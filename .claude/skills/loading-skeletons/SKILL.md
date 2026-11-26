---
name: loading-skeletons
description: >
  Guardião de sincronia de skeletons do PetNalia — use em TODA tarefa de UI frontend,
  mesmo que o usuário nunca diga "loading" ou "skeleton". Acione sempre que mexer em
  `packages/ui/src/` ou `apps/web/src/` para: mudar padding, gap, grid-cols,
  flex-direction, breakpoints, aspect-ratio, width/height, border-radius, ou qualquer
  propriedade de layout; adicionar/remover seções num componente; criar página ou
  componente novo; refatorar a estrutura de um componente. Razão: componentes data-driven
  têm um companheiro `<nome>-skeleton.tsx` que espelha o layout — se o componente muda e o
  skeleton não, o usuário vê layout shift quando o conteúdo carrega.
  NÃO dispare para mudanças só de texto/cópia, só de cor/token, ou só de lógica/handler sem alterar layout — nem para backend/teste/config.
---

# Loading States & Skeletons — PetNalia

Todo conteúdo carregável **tem** estado de loading. Ninguém deve ver tela em branco, container vazio ou layout shift enquanto dados carregam. A stack é **Tailwind CSS v4 + tokens do `@petnalia/ui`**; o skeleton base é o atom **`Skeleton`** do `@petnalia/ui`.

## Princípios

> **1. Se carrega, tem skeleton. Sem exceção.**
> **2. Se o componente muda, o skeleton muda junto. Sem exceção.**

Data fetching (TanStack Query), carregamento de imagem, transição de rota, componente lazy — tudo mostra placeholder que espelha o layout final. Quando o layout do componente real muda, o skeleton é atualizado **na mesma mudança**.

## Skeleton Sync Protocol (MANDATÓRIO em toda edição de UI)

Sempre que criar, editar ou revisar um componente frontend:

### Passo 1 — Procurar o companheiro

```
vet-card.tsx → vet-card-skeleton.tsx   (mesma pasta)
```

Cheque também o `loading.tsx` do segmento de rota, se o componente aparece numa página (`apps/web/src/app/.../loading.tsx`).

### Passo 2 — Comparar propriedades de layout

Se existe skeleton, estas propriedades **DEVEM bater** entre componente real e skeleton:

| Propriedade | Bate? |
|---|---|
| Flex direction (`flex-col`/`flex-row`) | SIM |
| Grid columns (`grid-cols-*`) | SIM |
| Gaps (`gap-*`) | SIM |
| Padding (`p-*`/`px-*`/`py-*`) | SIM |
| Width / height / aspect-ratio | SIM |
| Border radius (`rounded-md`/`rounded-lg`) | SIM |
| Breakpoints responsivos (`sm:`/`md:`/`lg:`) | SIM |
| Visibilidade por breakpoint (`hidden md:block`) | SIM |
| Container max-width | SIM |
| Ordem dos filhos · nº de seções · margens entre seções | SIM |

### Passo 3 — Atualizar o skeleton

Divergiu? Atualize o skeleton pra bater. Não é opcional.

### Passo 4 — Conferir `loading.tsx` e fallbacks de `<Suspense>`

Se o componente aparece em página: o `loading.tsx` da rota ainda reflete o layout? Algum `<Suspense fallback={...}>` usa o skeleton atualizado?

### Quando criar um skeleton NOVO

Ao adicionar data fetching / image loading / lazy a um componente que antes não tinha, crie o companheiro `<nome>-skeleton.tsx` imediatamente.

## O atom `Skeleton` (já existe no `@petnalia/ui`)

Não recrie — importe:

```ts
import { Skeleton } from '@petnalia/ui';
```

```tsx
<Skeleton className="h-4 w-32 rounded-md" />
<Skeleton className="aspect-video w-full" />        // imagem
<Skeleton className="h-10 w-10 rounded-full" />     // avatar/círculo
```

Fundo: token `--surface-inset` / classe equivalente no Tailwind — nunca hardcode cor. Animação: `animate-pulse`.

## Hierarquia — onde o skeleton mora

```
packages/ui/src/
  atoms/skeleton.tsx                          # bloco base
  organisms/vet-card-skeleton.tsx             # companheiro de organism APRESENTACIONAL

apps/web/src/
  features/<feature>/components/
    results-grid.tsx
    results-grid-skeleton.tsx                 # ← companheiro do componente data-driven
  app/<rota>/loading.tsx                      # skeleton no nível de rota (Next.js App Router)
```

Regra: **o skeleton mora ao lado do componente data-driven que ele representa.** Organisms puramente apresentacionais (sem fetch/auth) e seus skeletons podem subir para `packages/ui`.

## Construindo um companheiro

O skeleton espelha **exatamente** o layout do real — mesmo spacing, dimensões, estrutura. Exemplo para o `VetCard`:

```tsx
// apps/web/src/features/search/components/vet-card-skeleton.tsx
import { Skeleton } from '@petnalia/ui';

export function VetCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-[--border] bg-[--surface] p-4 shadow-sm"
      role="status"
      aria-label="Carregando veterinário..."
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="flex items-center justify-between mt-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
  );
}
```

## Integração com Next.js App Router

### 1. `loading.tsx` — skeleton no nível de rota

```tsx
// apps/web/src/app/(public)/busca/loading.tsx
import { ResultsGridSkeleton } from '@/features/search/components/results-grid-skeleton';

export default function Loading() {
  return <ResultsGridSkeleton count={9} />;
}
```

### 2. `<Suspense>` — skeleton no nível de componente

```tsx
import { Suspense } from 'react';
import { ResultsGrid } from '@/features/search/components/results-grid';
import { ResultsGridSkeleton } from '@/features/search/components/results-grid-skeleton';

export default function BuscaPage() {
  return (
    <main>
      <Suspense fallback={<ResultsGridSkeleton count={9} />}>
        <ResultsGrid />
      </Suspense>
    </main>
  );
}
```

### 3. Fetch no client (TanStack Query v5)

TanStack Query v5 usa **`isPending`** para o estado inicial (não `isLoading`):

```tsx
'use client';
import { useVetSearch } from '@/features/search/queries';
import { ResultsGrid } from '@/features/search/components/results-grid';
import { ResultsGridSkeleton } from '@/features/search/components/results-grid-skeleton';

export function SearchResults({ query }: { query: VetSearchQuery }) {
  const { data, isPending } = useVetSearch(query);
  if (isPending) return <ResultsGridSkeleton count={9} />;
  return <ResultsGrid vets={data.items} />;
}
```

### 4. Imagens — blur ou skeleton wrapper

```tsx
import Image from 'next/image';

<Image
  src={vet.avatarUrl}
  alt={vet.fullName}
  width={48}
  height={48}
  placeholder="blur"
  blurDataURL={vet.avatarBlurDataUrl}
  className="rounded-full transition-opacity duration-300"
/>
```

## Skeletons responsivos — todos os breakpoints

Se o real muda layout entre breakpoints, o skeleton faz igual:

```tsx
// Real: 1 col mobile → 2 sm → 3 lg
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

// Skeleton — classes responsivas idênticas
export function ResultsGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <VetCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

Breakpoints PetNalia: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1440.

## Acessibilidade

Todo skeleton:

1. `role="status"` no container raiz.
2. `aria-label` em pt-BR (`"Carregando resultados..."`, `"Carregando 9 veterinários..."`).
3. `aria-busy={isPending}` no container pai que vai receber o conteúdo.

```tsx
<section aria-busy={isPending} aria-label="Resultados da busca">
  {isPending
    ? <ResultsGridSkeleton count={9} />
    : <ResultsGrid vets={data.items} />
  }
</section>
```

## Checklist

### Skeleton Sync (toda edição de UI)
- [ ] Procurou companheiro `<nome>-skeleton.tsx` de todo componente tocado.
- [ ] Layout do skeleton bate com o real (flex, grid, gaps, padding, dimensões, radius).
- [ ] Breakpoints responsivos + elementos hidden/visible por breakpoint batem.
- [ ] `loading.tsx` da rota atualizado se o layout da página mudou.
- [ ] Fallbacks de `<Suspense>` atualizados se a estrutura mudou.
- [ ] Sem layout shift em nenhum viewport.

### Conteúdo async novo
- [ ] Rota que faz fetch tem `loading.tsx` com skeleton de template.
- [ ] Server Component async envolto em `<Suspense>` com skeleton matching.
- [ ] Client component com TanStack Query mostra skeleton durante `isPending`.
- [ ] Companheiro `<nome>-skeleton.tsx` existe ao lado do componente carregável.
- [ ] Imagens com `placeholder="blur"` ou skeleton wrapper.
- [ ] Skeleton de lista/grid aceita `count`.

### Acessibilidade
- [ ] `role="status"` + `aria-label` (pt-BR) nas raízes de skeleton.
- [ ] `aria-busy` no container pai.
- [ ] `animate-pulse` consistente (+ `motion-reduce:animate-none` se fica muito na tela).

## Anti-patterns (NUNCA)

- **Tela em branco enquanto carrega** — sempre skeleton.
- **Spinner-only em página/seção** — spinner é pra botão/ação pequena; região carregável usa skeleton.
- **Layout diferente entre skeleton e real** — causa layout shift.
- **Sem `loading.tsx`** numa rota com fetch server-side.
- **Skeleton sem `role="status"` + `aria-label`**.
- **Cor hardcoded** — use tokens (`--surface-inset`), nunca hex/cor crua.
- **Recriar o atom `Skeleton`** — importe de `@petnalia/ui`.
- **Mobile vendo skeleton de desktop** — responsividade obrigatória.
- **Editar componente sem atualizar o skeleton** — drift acumula silencioso.
