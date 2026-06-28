FilterDrawer — the off-canvas filter panel for mobile (maps to shadcn/ui **Sheet** on Radix Dialog). Hosts `SearchFilters` (or any content) behind a scrim with an apply/clear footer.

```jsx
const [open, setOpen] = React.useState(false);
<Button variant="secondary" iconLeft="sliders" onClick={() => setOpen(true)}>Filtros</Button>
<FilterDrawer open={open} onClose={() => setOpen(false)} onApply={() => setOpen(false)} resultCount={48}>
  <SearchFilters />
</FilterDrawer>
```

Uses `--z-overlay`/`--z-drawer`; slide + scrim animations disable under prefers-reduced-motion. In production wire to Radix Dialog for focus-trap + Esc-to-close.
