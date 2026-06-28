FilterChipGroup — a labelled row of selectable Chips for pet types and quick filters.

```jsx
<FilterChipGroup label="Filtros rápidos" defaultValue={["home"]} options={[
  { value: "dog", label: "Cão", icon: "paw-print" },
  { value: "cat", label: "Gato", icon: "paw-print" },
  { value: "emergency", label: "Emergência" },
  { value: "home", label: "Visita em casa", icon: "home" },
]} onChange={setFilters} />
```

Composes the `Chip` atom. `multiple` (default true) or single-select. Controlled via `value`/`onChange` or `defaultValue`.
