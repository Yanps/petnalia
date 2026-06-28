# ADR-0002 — Gate de contraste WCAG AA sobre os tokens de cor

- **Status:** accepted
- **Data:** 2026-06-28
- **Decisores:** PetNalia core team

## Contexto

O CLAUDE.md e o ENGINEERING_GUIDE.md exigem WCAG 2.1 AA em todo o design system. Contraste de cor é o item mais barato e mais regressível dessa pauta: cada novo token em `docs/design-system/tokens/colors.css` pode introduzir um par texto/fundo ilegível (WCAG 2.1 SC 1.4.3 exige ≥ 4.5:1 para texto normal), e sem uma trava mecânica isso só é detectado em revisão visual.

Os tokens semânticos do PetNalia já codificam os pares na estrutura de nomes: `--brand-fg` é texto sobre `--brand`, `--text` é o texto principal sobre `--bg`/`--surface`, `--success` é texto sobre `--success-bg`, etc. Portanto os pares são diretamente verificáveis sem renderizar UI — basta parsear o CSS e calcular a luminância relativa.

Os valores base usam `var(--teal-*)`, `var(--slate-*)`, etc., que são resolvidos na mesma folha de estilos (`colors.css`). O parser precisa resolver essas referências antes de calcular o contraste.

## Decisão

Adicionar um **gate de contraste WCAG 2.1 AA dependency-free** no package `@petnalia/ui`:

- **Arquivo:** `packages/ui/src/contrast.test.ts` (Vitest, sem dependência nova).
- Lê `docs/design-system/tokens/colors.css` como texto cru (`fs.readFileSync`).
- Parseia as variáveis base (`--teal-*`, `--slate-*`, etc.) e resolve as referências `var(--*)` nos aliases semânticos.
- **Pares verificados por tema** — ver tabela abaixo.
- Calcula razão de contraste WCAG e **assere ≥ 4.5:1** (texto normal).
- **Ledger** (`packages/ui/src/contrast-ledger.json`): pares que hoje não alcançam 4.5:1 são congelados. Par no ledger é assegurado como *falha conhecida*. Par novo fora do ledger **tem de passar**. O ledger só encolhe — corrigir o token remove a entrada.

### Pares verificados

#### Tema claro (`[data-theme="light"]`)

| Par | Texto | Fundo | Mínimo |
|---|---|---|---|
| brand-fg / brand | `#FFFFFF` | `#0D9488` (teal-500) | 4.5:1 |
| text / bg | `#0F172A` (slate-900) | `#F8FAFC` (slate-50) | 4.5:1 |
| text / surface | `#0F172A` (slate-900) | `#FFFFFF` | 4.5:1 |
| text-secondary / surface | `#475569` (slate-600) | `#FFFFFF` | 4.5:1 |
| text-link / surface | `#115E59` (teal-700) | `#FFFFFF` | 4.5:1 |
| success / success-bg | `#16A34A` (success-500) | `#F0FDF4` (success-50) | 4.5:1 |
| warning / warning-bg | `#D97706` (warning-600) | `#FFFBEB` (warning-50) | 4.5:1 |
| error / error-bg | `#DC2626` (error-500) | `#FEF2F2` (error-50) | 4.5:1 |
| info / info-bg | `#0284C7` (info-600) | `#EFF6FF` (info-50) | 4.5:1 |

#### Tema escuro (`[data-theme="dark"]`)

| Par | Texto | Fundo | Mínimo |
|---|---|---|---|
| brand-fg / brand | `#04201D` | `#2DD4BF` (teal-400) | 4.5:1 |
| text / bg | `#F1F5F9` (slate-100) | `#060B16` (slate-950) | 4.5:1 |
| text / surface | `#F1F5F9` (slate-100) | `#0F1B27` | 4.5:1 |
| text-secondary / surface | `#CBD5E1` (slate-300) | `#0F1B27` | 4.5:1 |
| text-link / surface | `#5EEAD4` (teal-300) | `#0F1B27` | 4.5:1 |
| success / success-bg | `#4ADE80` | `rgba(34,197,94,0.12)` sobre `#0F1B27` | 4.5:1 |
| warning / warning-bg | `#FBBF24` | `rgba(245,158,11,0.12)` sobre `#0F1B27` | 4.5:1 |
| error / error-bg | `#F87171` | `rgba(220,38,38,0.14)` sobre `#0F1B27` | 4.5:1 |
| info / info-bg | `#38BDF8` | `rgba(14,165,233,0.14)` sobre `#0F1B27` | 4.5:1 |

> Backgrounds `rgba` são compostos sobre a superfície base do tema para obter o hex efetivo antes de calcular o contraste.

### Estrutura do teste

```ts
// packages/ui/src/contrast.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import ledger from './contrast-ledger.json';

// Fórmula WCAG — luminância relativa (dependency-free, ~30 linhas)
function hexToLinear(hex: string): [number, number, number] { /* ... */ }
function relativeLuminance(hex: string): number { /* ... */ }
function contrastRatio(a: string, b: string): number { /* ... */ }

// Parser CSS — lê tokens base e resolve var(--*)
function parseTokens(css: string): Record<string, string> { /* ... */ }

const PAIRS = [ /* tabela acima */ ];

describe('Contraste WCAG 2.1 AA — tokens PetNalia', () => {
  const css = readFileSync(
    resolve(__dirname, '../../../docs/design-system/tokens/colors.css'),
    'utf8',
  );
  const tokens = parseTokens(css);

  for (const { id, text, bg, label } of PAIRS) {
    const isLedgered = ledger.failing.includes(id);
    it(`${isLedgered ? '[LEDGER] ' : ''}${label}: ${id}`, () => {
      const ratio = contrastRatio(tokens[text], tokens[bg]);
      if (isLedgered) {
        expect(ratio).toBeLessThan(4.5); // falha conhecida — ledger anti-rot
      } else {
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});
```

### Ledger

```json
// packages/ui/src/contrast-ledger.json
{
  "failing": [],
  "note": "Pares que não alcançam 4.5:1 — adicionar aqui apenas ao criar novo par com falha conhecida. Corrigir o token remove a entrada."
}
```

O ledger começa vazio. Se algum par da tabela acima não passar na primeira execução, ele entra no ledger com uma issue vinculada e prazo de correção.

## Alternativas consideradas

| Opção | Prós | Contras |
|---|---|---|
| Teste Vitest dependency-free (escolhida) | Zero dep nova; valida o token diretamente; roda em ms | Reimplementa ~30 linhas de math WCAG; não cobre UI composta em runtime |
| `jest-axe` / `@axe-core/react` | Regras a11y completas | Dep nova; contraste no jsdom depende de cor computada (frágil) |
| `@axe-core/playwright` | Browser real | Toolchain pesada para validar o token isolado |
| Revisão manual em PR | Sem trabalho de infra | Regressão silenciosa ao mudar token |

## Consequências

**Positivas:**
- Qualquer par de token novo nasce obrigado a cumprir 4.5:1.
- Regressão de contraste vira teste vermelho no PR — detectada antes do merge.
- A dívida de contraste fica explícita e auditável no ledger.

**Negativas / custos aceitos:**
- O parser CSS é mantido à mão (coberto por sanity check: preto/branco ≈ 21:1).
- Cobre o token, não a composição visual em runtime (texto sobre imagem/gradiente fica para auditoria a11y futura).
- Backgrounds `rgba` do dark mode precisam de composição alpha antes do cálculo — lógica adicional no parser.

## Follow-ups

- Ao corrigir qualquer par no ledger, remover a entrada e abrir PR específico de token.
- Se `colors.css` migrar para `oklch()`/`hsl()`: estender `toRgb()` no teste — sem mudar a estrutura do gate.
- Gate completo de a11y (foco, ARIA, navegação por teclado) fica para fase posterior do design system.
