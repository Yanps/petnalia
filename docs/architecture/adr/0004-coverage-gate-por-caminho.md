# ADR-0004 — Gate de cobertura por caminho (Vitest)

- **Status:** accepted
- **Data:** 2026-06-28
- **Decisores:** PetNalia core team

## Contexto

O CLAUDE.md e o TESTING_GUIDE.md estabelecem cobertura mínima de 80% para serviços e use-cases como gate de CI. Um threshold global único tem dois problemas opostos:

1. **Bloqueia progresso:** código novo legítimo (feature em desenvolvimento) derruba o global abaixo do limiar e bloqueia PRs não relacionados.
2. **Não protege regressão:** se a média global já está em 85%, um serviço crítico que cai de 95% para 60% não é detectado — a média se mantém verde.

A solução é **thresholds estratificados por caminho**: pastas já cobertas têm limiar alto (100% onde possível), features em desenvolvimento têm limiar interim (80%), e o global fica em 0 para não bloquear pastas novas.

## Decisão

Configurar `coverage.thresholds` por caminho no `vitest.config.ts` de cada app/package, usando **@vitest/coverage-v8** (não Istanbul).

### Configuração inicial — `apps/api`

```ts
// apps/api/vitest.config.ts
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        '**/*.d.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/index.ts',          // barrels (re-exports puros)
        '**/main.ts',           // bootstrap NestJS
        '**/migrations/**',     // geradas pelo Prisma
        '**/__mocks__/**',
        '**/test-utils/**',
      ],
      thresholds: {
        // Global zerado — não bloqueia pastas novas
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,

        // --- Infraestrutura (100% quando construída) ---
        // 'src/modules/auth/**': { lines: 100, functions: 100, branches: 100 },

        // --- Domínios ativos em construção (80% interim) ---
        // 'src/modules/appointments/**': { lines: 80, functions: 80, branches: 80 },
        // 'src/modules/availability/**': { lines: 80, functions: 80, branches: 80 },

        // Elevar para 100% conforme cada módulo estabiliza.
      },
    },
  },
});
```

### Regra de elevação

| Estado do módulo | Threshold |
|---|---|
| Recém criado / em construção ativa | Sem entrada (global 0% cobre) |
| Feature completa, testes escritos | Adicionar entrada com 80% |
| Módulo estabilizado, sem mudanças frequentes | Elevar para 100% |

O CI falha **apenas** se uma pasta que já tem entrada regredir abaixo do limiar. Pasta nova não tem entrada → não bloqueia.

### Evolução esperada (pós-Foundation)

```ts
thresholds: {
  // Global
  lines: 0, functions: 0, branches: 0, statements: 0,

  // Infraestrutura estável
  'src/modules/auth/**':   { lines: 100, functions: 100, branches: 100 },
  'src/modules/users/**':  { lines: 100, functions: 100, branches: 100 },
  'src/modules/pets/**':   { lines: 100, functions: 100, branches: 100 },

  // Domínios complexos — interim enquanto crescem
  'src/modules/appointments/**':  { lines: 80, functions: 80, branches: 80 },
  'src/modules/availability/**':  { lines: 80, functions: 80, branches: 80 },
  'src/modules/subscriptions/**': { lines: 80, functions: 80, branches: 80 },

  // Domínios simples (CRUD) — 100% após construção inicial
  'src/modules/reviews/**':       { lines: 100, functions: 100, branches: 100 },
  'src/modules/notifications/**': { lines: 80, functions: 80, branches: 80 },
}
```

### Exclusões justificadas

| Padrão | Motivo |
|---|---|
| `**/migrations/**` | Geradas pelo Prisma — não testam lógica |
| `**/index.ts` (barrels) | Re-exports puros, sem lógica |
| `**/main.ts` | Bootstrap NestJS — não testável em unit |
| `**/*.spec.ts` / `**/*.test.ts` | O próprio código de teste |
| `**/__mocks__/**` | Helpers de teste |
| `**/test-utils/**` | Setup e factories |

### CI

```yaml
# .github/workflows/ci.yml
- name: Test + Coverage
  run: pnpm --filter api test:coverage
  # Falha se algum threshold por caminho for violado
```

Script no `package.json` do app:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest"
  }
}
```

### Mutation testing (follow-up)

Cobertura de linha não garante qualidade dos testes — um teste pode cobrir uma linha sem assegurar o comportamento correto. Para módulos críticos (`auth`, `appointments`), avaliar **Stryker** com threshold de mutation score ≥ 80%:

```json
// apps/api/stryker.conf.json (futuro)
{
  "mutate": ["src/modules/auth/**", "src/modules/appointments/**"],
  "thresholds": { "high": 80, "low": 60, "break": 80 }
}
```

Rodar como workflow informativo (`mutation.yml`, não required) até acumular sinal de estabilidade — análogo ao gate E2E (ADR-0003).

## Alternativas consideradas

| Opção | Prós | Contras |
|---|---|---|
| Thresholds por caminho (escolhida) | Protege regressão sem bloquear progresso; escalável | Requires manutenção ativa do arquivo de config ao criar módulos |
| Threshold global único (80%) | Simples | Não protege regressão em módulo específico; bloqueia progresso em código novo |
| Threshold global 100% | Máxima proteção | Impraticável no início; bloqueia toda feature nova |
| Sem gate de cobertura | Zero atrito | Cobertura cai silenciosamente; bug sem teste passa para produção |

## Consequências

**Positivas:**
- Regressão em módulo crítico vira teste vermelho no CI, independente da média global.
- Feature nova não bloqueia PR por estar abaixo do threshold — incentiva progresso incremental.
- O plano de elevação torna a dívida de cobertura explícita e auditável.

**Negativas / custos aceitos:**
- O `vitest.config.ts` precisa ser atualizado ao estabilizar cada módulo — se não houver disciplina, o threshold fica desatualizado.
- Cobertura de linha não implica qualidade de teste (mutation testing endereça isso, mas é follow-up).

## Follow-ups

- Adicionar entradas ao `thresholds` conforme cada módulo é construído e estabilizado.
- Implementar `mutation.yml` (Stryker) como workflow informativo para módulos críticos (`auth`, `appointments`).
- Quando `appointments` e `availability` estabilizarem, elevar de 80% → 100%.
- Integrar relatório de cobertura (`lcov`) ao PR via `actions/upload-artifact` + comentário automático.
