Pagination — page navigation for search results (maps to shadcn/ui Pagination). Auto-collapses with ellipsis.

```jsx
const [page, setPage] = React.useState(1);
<Pagination total={12} page={page} onChange={setPage} />
```

Props: `total`, `page` (1-based), `onChange`. Prev/next disable at bounds.
