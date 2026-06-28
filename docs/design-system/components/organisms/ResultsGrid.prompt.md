ResultsGrid — the search results organism: a responsive grid of `VetCard`s that owns its **loading** (Skeleton cards), **empty** (EmptyState + clear CTA), and **loaded** states.

```jsx
<ResultsGrid vets={results} loading={isFetching} columns={2}
  onVet={openProfile} onClear={resetFilters} />
```

Composes VetCard + EmptyState + Skeleton. Responsive: set `columns={1}` under md. Pass each vet an `id`; other fields flow straight into VetCard.
