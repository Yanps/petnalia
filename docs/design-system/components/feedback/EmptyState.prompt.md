EmptyState — zero-result / empty-list state with an icon, copy, and optional action.

```jsx
<EmptyState icon="search" title="Nenhum vet encontrado"
  description="Tente ampliar a distância ou remover alguns filtros."
  action="Limpar filtros" actionIcon="x" onAction={reset} />
```

Use for empty search results, no appointments, no pets yet. `compact` for inline lists.
