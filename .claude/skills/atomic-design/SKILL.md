---
name: atomic-design
description: >
  Guia obrigatório de arquitetura de frontend do PetNalia — Atomic Design sobre
  o monorepo (`@petnalia/ui` + Tailwind v4 + tokens CSS do design system + shadcn/Radix).
  SEMPRE use esta skill ao criar, editar ou revisar QUALQUER componente, página, layout,
  elemento de UI ou estilo no PetNalia. Inclui: criar componente novo, alterar existente,
  adicionar página/rota, montar formulário, navegação, escolher ícone, acessibilidade,
  ou qualquer tarefa que toque `packages/ui/` ou `apps/web/src/`.
  Mesmo que o usuário não diga "atomic design" — se é trabalho de frontend no PetNalia, use.
  Antes de criar UI nova, esta skill manda REUTILIZAR o `@petnalia/ui` primeiro.
  NÃO dispare para tarefas sem UI: hooks de dados/cliente de API, stores Zustand, testes, specs, docs.
---

# Atomic Design — Arquitetura de Frontend do PetNalia

O PetNalia organiza UI por **Atomic Design** sobre **Tailwind v4 + tokens CSS do design system + shadcn/ui (Radix)**, com o design system no package **`@petnalia/ui`** e o app em **feature-based** (`apps/web/src/features/`). Estas regras valem pra todo código de frontend novo.

> **Fonte de verdade do design system:** `docs/design-system/` — tokens, componentes, guidelines e templates. Leia antes de gerar qualquer UI. O `@petnalia/ui` é a re-exportação React desses componentes para produção.

## Onde a UI mora

```
packages/ui/src/               # @petnalia/ui — o design system React (apresentacional)
  atoms/        # Button, Input, Label, Badge, Avatar, Skeleton, Icon, Rating...
  molecules/    # SearchBar, AvailabilitySlot, ReviewItem, FilterChipGroup, AddressPreview...
  organisms/    # VetCard, VetHero, ResultsGrid, BookingSidebar, AvailabilityCalendar,
                #   AppointmentCard, CoverageMap, Header, Footer, FilterDrawer...
  templates/    # Marketing, Search, Profile, Booking, Dashboard, Auth, Admin (layout sem dados)
  tokens/       # re-export dos tokens CSS do design system
  index.ts      # re-exports por nível

apps/web/src/
  app/                         # rotas (Next.js App Router) — compõem features + templates
  features/<feature>/          # 1 pasta por domínio (espelha a API 1:1)
    components/  # UI do feature (organisms/templates com dados reais)
    actions.ts   # Server Actions ('use server')
    queries.ts   # TanStack Query hooks + query-key factory
    schema.ts    # re-exports de @petnalia/types + schemas locais de form
  lib/                         # api-client, auth, query-client, mapbox
  stores/                      # Zustand stores (UI state efêmero apenas)
  components/                  # composições app-específicas reutilizáveis
```

**Imports:**

```ts
import { Button, Input, Badge, Skeleton } from '@petnalia/ui';
import { SearchBar, AvailabilitySlot } from '@petnalia/ui';
import { VetCard, ResultsGrid, BookingSidebar } from '@petnalia/ui';
import { cn } from '@petnalia/ui/utils/cn';
```

## Reuse-first (OBRIGATÓRIO antes de criar componente)

O maior erro é recriar o que o `@petnalia/ui` já tem. **Antes de escrever qualquer UI:**

```text
1. Grep em packages/ui/src/     → o componente já existe? Reutiliza.
2. Existe algo parecido?        → estende via variant (CVA), não cria irmão renomeado.
3. É composição de 2-4 atoms?  → molecule.
4. Tem dado/auth/lógica de domínio? → organism/template NO FEATURE do app, não no packages/ui.
```

**Não criar variante-renomeada** — sempre prop `variant`:

- ❌ `PrimaryButton`, `CTAButton` → ✅ `<Button variant="primary" />`
- ❌ `VetCardVerified`, `VetCardOnline` → ✅ `<VetCard verified online />`
- ❌ `SkeletonSmall` → ✅ `<Skeleton className="h-4 w-16" />`

## Onde cada nível vive

| Nível | Definição | Onde mora |
|---|---|---|
| **atoms** | bloco indivisível (Button, Input, Badge, Avatar, Icon, Skeleton, Rating, Chip...) | `@petnalia/ui` |
| **molecules** | combinação de atoms com uma função (SearchBar, AvailabilitySlot, ReviewItem...) | `@petnalia/ui` |
| **organisms** | seção completa de UI (VetCard, ResultsGrid, BookingSidebar, Header...) | `@petnalia/ui` **se apresentacional**; senão `apps/web/src/features/<feature>/components/` |
| **templates** | layout de página sem dados reais (7 templates do design system) | `@petnalia/ui` se apresentacional; senão feature do app |
| **pages** | template + dados reais + state | `apps/web/src/app/` (Next.js routes) |

**Regra de ouro da fronteira:** o `@petnalia/ui` **não depende de auth, dados de API, nem estado server**. Toda *wiring* (TanStack Query, Server Actions, Zustand) vive **no app** (`features/<feature>/`). Um organism que faz fetch ou lê auth **não sobe** pro packages/ui — fica no feature. Um organism puramente controlado por props **pode** subir.

**Regra de dependência do monorepo:** `packages/*` nunca dependem de `apps/*`. `@petnalia/ui` depende de `@petnalia/utils`; o app depende de todos os packages. Sem ciclos.

## Convenção de arquivo (kebab-case)

```
packages/ui/src/organisms/
  vet-card.tsx            # componente (export nomeado PascalCase)
  vet-card-skeleton.tsx   # skeleton companheiro (ver skill loading-skeletons)
```

Re-exporta no `index.ts`:

```ts
export { VetCard } from './organisms/vet-card';
export { VetCardSkeleton } from './organisms/vet-card-skeleton';
```

- **Arquivo** kebab-case (`vet-card.tsx`); **componente** PascalCase (`VetCard`); **export nomeado** (não default).
- No app, componentes de feature ficam em `features/<feature>/components/<nome>.tsx`.

## Tokens — Tailwind v4 + CSS Custom Properties

Os tokens são CSS custom properties definidos em `docs/design-system/tokens/` e importados via `styles.css`. Tailwind v4 os expõe via `@theme`. **Nunca hardcode cor/espaçamento** — sempre o token semântico.

```tsx
// ✅ Certo — tokens semânticos
<article className="flex flex-col gap-4 rounded-lg border border-[--border] bg-[--surface] p-4 shadow-sm">
  <h3 className="text-[--text] font-semibold">{title}</h3>
  <p className="text-[--text-secondary] text-sm">{description}</p>
</article>

// ❌ Errado — valores arbitrários / hex
<div className="bg-[#0D9488] text-[14px] border-gray-200">
```

**Aliases semânticos principais:**
- Cores: `--brand`, `--brand-hover`, `--accent`, `--bg`, `--surface`, `--surface-2`, `--text`, `--text-secondary`, `--text-muted`, `--border`, `--border-strong`, `--ring`
- Semântico: `--success`, `--warning`, `--error`, `--info` (cada um com `--*-bg` e `--*-border`)
- Teal = primário (`--brand`); Verde = disponibilidade/confirmação apenas (`--accent`)

**Nunca:** hex literal, `bg-teal-500`, `text-gray-900` — use o alias semântico. O dark mode sai de graça quando os tokens são usados corretamente via `[data-theme="dark"]`.

**Composição de classes:** use `cn()` de `@petnalia/ui/utils/cn` (clsx + tailwind-merge).

## Headless: shadcn/ui + Radix + CVA

O `@petnalia/ui` é construído sobre **shadcn/ui** (Radix por baixo) com **`class-variance-authority`** para variants. Para qualquer componente com foco, posicionamento, dismiss ou ARIA complexo (Dialog, Popover, Tabs, Select, Tooltip), **componha sobre o Radix** — não reimplemente do zero.

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        neutral: 'bg-[--surface-2] text-[--text]',
        brand:   'bg-[--brand] text-[--brand-fg]',
        accent:  'bg-[--accent] text-white',
        success: 'bg-[--success-bg] text-[--success] border border-[--success-border]',
        error:   'bg-[--error-bg] text-[--error] border border-[--error-border]',
      },
    },
    defaultVariants: { variant: 'neutral' },
  }
);
```

## Ícones

**Único sistema:** [Lucide](https://lucide.dev) — outline, 24×24, stroke-width 2. Entregue como inline SVG via o componente `Icon` de `@petnalia/ui`.

```tsx
import { Icon } from '@petnalia/ui';
// ou direto do lucide-react quando não for via Icon component:
import { MapPin, ShieldCheck, Home, Video, Calendar } from 'lucide-react';

<ShieldCheck aria-label="CRMV verificado" className="h-4 w-4 text-[--brand]" />
<Home aria-hidden className="h-4 w-4" />   {/* decorativo */}
```

- Ícone com significado → `aria-label`. Decorativo → `aria-hidden`.
- **Nunca use emoji como ícone de UI.**
- Glyphs preferidos do PetNalia: `map-pin`, `paw-print`, `home`, `calendar`, `clock`, `shield-check`, `stethoscope`, `heart-handshake`, `star`, `video`, `phone`.

## Server Components (app)

No `apps/web/src/app/` e nos `features/`, **Server Component é o default**. Adicione `'use client'` só quando precisar: event handlers, hooks React, browser APIs, Mapbox GL, formulários (React Hook Form), Zustand. Componentes do `@petnalia/ui` são apresentacionais e funcionam em ambos — a wiring client mora no app.

## Responsivo + animação

- **Mobile-first, obrigatório** — toda tela/componente adapta breakpoints Tailwind (`sm`/`md`/`lg`/`xl`). Breakspoints: sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1440.
- **Motion:** `--dur-fast 120ms` hover/cor · `--dur-base 200ms` padrão · `--dur-slow 350ms` painéis. Tudo colapsa para 0ms com `prefers-reduced-motion` (`motion-reduce:transition-none`).
- **Focus:** anel 3px `--ring` (teal), sempre visível — nunca remova sem repor.

## Acessibilidade (WCAG 2.1 AA)

1. **HTML semântico** — `<button>`, `<a>`, `<nav>`, `<main>`. Nunca `<div onClick>`.
2. **Labels** — todo interativo tem nome acessível (`aria-label`/`<label htmlFor>`).
3. **Teclado** — operável e ordem de foco lógica. Radix já entrega isso.
4. **Contraste** — tokens garantem AA quando usados corretamente.
5. **Touch targets** — mínimo 44px (`--control-md`).
6. **Foco** — nunca remova `outline` sem repor `focus-visible:ring-2`.

## Companheiro Skeleton

Todo componente data-driven tem **skeleton companheiro** `<nome>-skeleton.tsx` que espelha o layout exatamente. Consulte a skill **`loading-skeletons`** ao mexer em qualquer componente carregável.

## Checklist (antes de fechar frontend)

- [ ] Reutilizou o `@petnalia/ui` antes de criar (grep em packages/ui/src/)?
- [ ] Componente no nível atômico certo, no lugar certo (DS se apresentacional; feature do app se tem dado/auth).
- [ ] Arquivo kebab-case, export nomeado PascalCase, re-export no index.
- [ ] Só tokens semânticos (`--brand`, `--surface`, `--text`...) — sem hex, arbitrary, nem cor crua do Tailwind.
- [ ] Usa `cn()` para compor classes.
- [ ] Headless (Dialog/Popover/etc.) composto sobre Radix/shadcn, não do zero.
- [ ] Ícone: Lucide com `aria-label` (significativo) ou `aria-hidden` (decorativo).
- [ ] Copy em pt-BR, sentence case, "você", sem emoji.
- [ ] Teal = primário; verde = disponibilidade/confirmação apenas.
- [ ] Server Component por padrão; `'use client'` só onde necessário.
- [ ] Responsivo mobile-first; motion suave + `prefers-reduced-motion`.
- [ ] a11y: semântica, teclado, contraste, foco visível, 44px touch targets.
- [ ] Companheiro `*-skeleton.tsx` criado/atualizado (skill `loading-skeletons`).

## Anti-patterns (NÃO fazer)

- Hex/arbitrary (`bg-[#0D9488]`, `text-[14px]`) ou cor crua do Tailwind (`bg-teal-500`) — viola tokens.
- Recriar componente que já existe no `@petnalia/ui`.
- Criar `PrimaryButton` em vez de `<Button variant="primary" />`.
- Subir organism com fetch/auth para `@petnalia/ui` — wiring fica no feature.
- `<div onClick>` para algo interativo (use `<button>`).
- Emoji como ícone de UI.
- Verde (`--accent`) em botões de navegação primária — reservado para disponibilidade/confirmação.
- Reimplementar Dialog/Popover do zero ignorando Radix/shadcn.
- Editar componente data-driven sem sincronizar o `*-skeleton.tsx`.
- `'use client'` na página em vez de na folha (componente interativo).
- Business logic em componentes React — vai para use cases na API.
