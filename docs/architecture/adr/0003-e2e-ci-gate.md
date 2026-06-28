# ADR-0003 — Suíte E2E (Playwright) com gate progressivo no CI

- **Status:** accepted
- **Data:** 2026-06-28
- **Decisores:** PetNalia core team

## Contexto

O PetNalia tem fluxos críticos que precisam de cobertura E2E (CLAUDE.md / TESTING_GUIDE.md):

- Autenticação (login, logout, refresh token)
- Busca de veterinários (geolocalização, filtros, resultados)
- Agendamento completo (booking flow, confirmação, cancelamento)
- Onboarding de veterinário (CRMV, área de atendimento, disponibilidade)
- Assinatura premium (Stripe, ativação, cancelamento)

O Playwright sobe o Next.js real (`next dev` ou `next start`) e exerce o cliente renderizando — está sujeito a jitter de boot e compilação on-demand. Promover a E2E a **required check** em todo PR desde o início transformaria flakiness transitória em bloqueio de merge não relacionado, o que paralisa o time.

A estratégia correta é acumular sinal de estabilidade antes de tornar o gate obrigatório.

## Decisão

Criar **`.github/workflows/e2e.yml`** com três modos de execução:

### 1. Opt-in por PR (label `run-e2e`)

```yaml
on:
  pull_request:
    types: [labeled, synchronize]
    paths:
      - 'apps/web/**'
      - 'apps/api/**'
      - 'packages/**'
      - '.github/workflows/e2e.yml'
```

Condição no job:

```yaml
if: >
  github.event_name != 'pull_request' ||
  contains(github.event.pull_request.labels.*.name, 'run-e2e')
```

PR que toca um fluxo crítico (auth, busca, booking, onboarding, assinatura) → adicionar label `run-e2e`. PR de refactor de CSS ou docs → sem label, sem E2E.

### 2. Noturno automático

```yaml
schedule:
  - cron: '0 3 * * *'  # 03:00 UTC, distinto do mutation.yml (se existir)
workflow_dispatch:       # sob demanda / debug
```

Acumula sinal de estabilidade sem custo no caminho crítico dos PRs.

### 3. Setup e execução

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: pnpm/action-setup@v4
    with: { version: '10' }
  - uses: actions/setup-node@v4
    with: { node-version: '22', cache: 'pnpm' }
  - run: pnpm install --frozen-lockfile
  - run: pnpm --filter web exec playwright install --with-deps chromium
  - run: pnpm --filter api build
  - name: E2E — fluxos críticos
    run: pnpm --filter web exec playwright test e2e/critical --project=chromium --reporter=list
    env:
      NEXT_PUBLIC_API_URL: http://localhost:3001
      DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
      # demais vars de teste
  - uses: actions/upload-artifact@v4
    if: failure()
    with:
      name: playwright-report
      path: apps/web/playwright-report/
```

### Configuração do Playwright

```ts
// apps/web/playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,  // absorve flake de boot no CI; local: sinal cru
  reporter: process.env.CI ? 'list' : 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm --filter web dev',
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

### Estrutura dos testes E2E

```
apps/web/e2e/
  critical/
    auth.spec.ts          # login, logout, refresh, sessão expirada
    search.spec.ts        # busca por localização, filtros, paginação
    booking.spec.ts       # seleção de slot, confirmação, cancelamento
    vet-onboarding.spec.ts # cadastro, CRMV, área de atendimento
    subscription.spec.ts  # ativação Stripe (modo teste), cancelamento
  helpers/
    auth.ts               # seedAuth — injeta sessão mockada
    api.ts                # interceptação de API (MSW ou Playwright route)
    factories.ts          # dados de seed reutilizáveis
```

### Caminho de graduação a required check

1. Manter E2E rodando no **noturno** e por label nos PRs de fluxo crítico.
2. Ao acumular **≥ 10 noites verdes consecutivas** sem flakiness:
   - Adicionar `e2e` como required check na branch protection de `main`.
   - Remover gate de label — disparar em todo PR que toca `apps/web/`, `apps/api/` ou `packages/`.
   - Atualizar este ADR com a data da graduação.
3. Se voltar a flakear após required: **reverter ao gate por label + noturno** (válvula de escape — nunca remover a suíte).

### Isolamento de dados

- API interceptada via `page.route()` para os happy paths (sem backend vivo no PR opt-in).
- Noturno usa banco de teste dedicado com seed determinístico (`pnpm --filter api seed:test`).
- Nunca apontar para banco de staging/produção.

## Alternativas consideradas

| Opção | Prós | Contras |
|---|---|---|
| Workflow label-gated + noturno (escolhida) | Sem bloqueio de PRs não relacionados; acumula sinal antes de graduar; reversível | Por padrão não cobre todo PR até graduar |
| Required em todo PR desde o início | Cobertura máxima imediata | Flakiness de boot bloqueia PRs não relacionados — paralisa o time |
| E2E no job `verify` do `ci.yml` | Sem workflow novo | Acopla browser (lento) ao gate de typecheck/lint/build (rápido) |
| Apenas testes manuais locais | Zero infra | Regressão de fluxo crítico só aparece em produção |

## Consequências

**Positivas:**
- Fluxos críticos têm execução automatizada (noturno) e opt-in controlado por PR.
- Regressão de rota (error boundary, tela branca, request vazando para rede real) vira sinal de CI.
- Relatório HTML em falha facilita triagem.
- Caminho de graduação a required está documentado e auditável.

**Negativas / custos aceitos:**
- Por padrão, a E2E não roda em todos os PRs até graduar — regressão pode passar batida até o run noturno.
- `retries: 2` no CI mascara flakiness leve (aceito até estabilizar).
- Noturno consome minutos de runner (boot do Next.js + navegações reais).

## Follow-ups

- Implementar `seedAuth` helper para injetar sessão sem passar pelo login UI em cada teste.
- Avaliar MSW (Mock Service Worker) para interceptação de API mais robusta que `page.route()`.
- Ao graduar a required: atualizar `TESTING_GUIDE.md` que hoje descreve E2E como gate opt-in.
- Adicionar testes de smoke de rota (descoberta automática de `page.tsx` + navegação com sessão mockada) como complemento ao `critical/`.
