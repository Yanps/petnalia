# ADR-0001 — CI e postura de segurança no build

- **Status:** accepted
- **Data:** 2026-06-28
- **Decisores:** PetNalia core team

## Contexto

O monorepo nasceu sem CI e sem reforços de segurança no build. Antes de qualquer feature entrar em produção, é necessário estabelecer a postura mínima de segurança e qualidade automatizada.

Três realidades do Next.js guiam as decisões:

1. **Minificação já existe.** `next build` minifica via SWC em produção — não há o que adicionar, apenas reforçar (esconder source maps, remover `console`).
2. **Criptografar `NEXT_PUBLIC_*` no cliente é ineficaz** — a chave de descriptografia viajaria no bundle. A proteção real é impedir que secrets vazem para o bundle desde o início.
3. **Variáveis de ambiente sem validação são bombas-relógio.** Um `undefined` silencioso em runtime é mais perigoso do que um build que quebra explicitamente.

## Decisão

Adotar quatro medidas aplicadas a todos os apps (`web`, futuramente `admin`) e ao monorepo:

### 1. Validação de env no build

`@t3-oss/env-nextjs` + Zod em `apps/*/src/env.ts`, importado no topo de `next.config.ts`.

- Schema divide `client` (apenas `NEXT_PUBLIC_*`) de `server`.
- O build **quebra** se uma variável obrigatória faltar ou tiver formato errado.
- O t3-env **lança erro em runtime** se código client tentar ler variável server-only — guardrail anti-vazamento de secret.

```ts
// apps/web/src/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
    SENDGRID_API_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_MAPBOX_TOKEN: z.string(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
});
```

Variável nova → declara no schema **e** atualiza `.env.example`.

### 2. Build hardening compartilhado

`packages/next-config` (`@petnalia/next-config`) expõe `withSecurity()`:

```ts
// tooling/next-config/index.mjs (ESM puro — sem build step, roda no contexto Node do next.config)
export function withSecurity(nextConfig = {}) {
  return {
    ...nextConfig,
    poweredByHeader: false,
    reactStrictMode: true,
    productionBrowserSourceMaps: false,
    compiler: {
      ...nextConfig.compiler,
      removeConsole: process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
    },
  };
}
```

```ts
// apps/web/next.config.ts
import { withSecurity } from '@petnalia/next-config';
import './src/env'; // valida env no build

export default withSecurity({ /* config específica do app */ });
```

### 3. Security headers

`securityHeaders()` em `next.config.ts` de cada app via `headers()`:

| Header | Valor |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self)` |
| `Content-Security-Policy` | `Report-Only` inicialmente (afinar origens antes de enforce) |

CSP em enforce após validar que CKEditor/Mapbox/Stripe.js não quebram — registrar novo ADR ao migrar.

### 4. CI no GitHub Actions

`.github/workflows/ci.yml` — gate em PR e push para `main`/`dev`:

```yaml
jobs:
  verify:
    steps:
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm build
      - run: pnpm audit --audit-level=high --prod
```

`pnpm audit` com `--audit-level=high` bloqueia merge em vulnerabilidade high/critical. Passa a ser gate automático, não prática manual.

## Alternativas consideradas

| Opção | Prós | Contras |
|---|---|---|
| Validação de env (escolhida) | Quebra cedo; guardrail client/server; sem falsa segurança | Depende de `@t3-oss/env-nextjs` + `zod` |
| Sem validação de env | Zero trabalho | `undefined` silencioso em runtime; secret pode vazar para bundle |
| CSP em enforce imediatamente | Cobertura máxima | Quebraria Mapbox GL / Stripe.js / fontes antes de afinar as origens |
| Obfuscação de bundle | Dificulta leitura | Alto custo, baixo valor em front-end; risco de quebra |
| `pnpm audit` apenas manual | Sem gate novo | Vulnerabilidade conhecida não bloqueia merge |

## Consequências

**Positivas:**
- Build falha explicitamente em env inválida ou ausente — nunca um `undefined` em produção.
- Bundle sem source maps e sem `console.log` em produção.
- Headers de defesa em profundidade presentes desde o primeiro deploy.
- Vulnerabilidade de dependência (high/critical) bloqueia o merge automaticamente.

**Negativas / custos aceitos:**
- `@petnalia/next-config` é JS ESM puro (sem build step) por rodar no contexto Node do `next.config` — único package fora do padrão "TS transpilado pelo Next".
- `pnpm audit` pode bloquear por vulnerabilidade em dependência de terceiro sem fix disponível — nesse caso, abrir issue e documentar exceção temporária com prazo.

## Follow-ups

- Migrar CSP de `Report-Only` para enforce com nonce (via middleware) após afinar origens — novo ADR.
- Ao adicionar chaves server-side novas (ex.: AWS S3, OpenTelemetry), declará-las em `server` do `env.ts`.
- Avaliar SOPS/dotenv-vault para secrets versionados se algum secret server-side precisar estar no repositório.
- Configurar Dependabot para PRs automáticos de atualização de dependências.

> **Atualização (2026-10-14) — estado da implementação:** só a medida 4 (CI no GitHub Actions) existe, e o `pnpm lint` passou a rodar de fato nesta data (antes falhava por falta de config do ESLint e bloqueava os testes). Ainda **não implementadas**: validação de env no build (`apps/*/src/env.ts` com t3-env — o arquivo não existe), o pacote `@petnalia/next-config` com `withSecurity()` e os security headers do web. Hoje a API lê `process.env` com defaults (`main.ts`, `redis.service.ts`).

> **Atualização (2026-11-24) — medidas 1 a 3 implementadas, com dois desvios:**
>
> - **Validação de env na inicialização, não no build.** Os schemas ficam em `@petnalia/config` (`parseApiEnv`, `parseWebEnv`), sem t3-env. A API valida no `ConfigModule` (`app.module.ts`) e o web no `register()` de `src/instrumentation.ts`. Motivo: a imagem Docker é construída uma vez, sem segredos, e recebe o ambiente ao subir; validar no build obrigaria a passar segredos para o build ou a desligar a validação nele. Em produção, toda variável que tem default de desenvolvimento passa a ser obrigatória, e os valores de exemplo do `.env.example` (`change-me…`, `minioadmin`, `sk_test_`) são recusados. A mensagem de erro lista só nomes, nunca valores.
> - **Sem pacote `@petnalia/next-config`.** Só existe um app Next, então os headers ficam em `apps/web/src/lib/security-headers.ts`, aplicados pelo `next.config.ts` (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, HSTS, `Permissions-Policy` e CSP em `Report-Only`). Extrair para um pacote quando houver um segundo app Next.
> - Medida 2 aplicada no `next.config.ts`: `productionBrowserSourceMaps: false`, `compiler.removeConsole` (mantendo `error`/`warn`) e `poweredByHeader: false`.
> - Gate de dependências: o CI roda `pnpm audit --prod --audit-level=high`. Correções de transitivas ficam em `overrides` no `pnpm-workspace.yaml`.
