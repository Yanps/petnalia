Chip — selectable pill for Pet Type and Filter chips. Toggle button (aria-pressed) by default; dismissible when `onRemove` is given.

```jsx
<Chip icon="paw-print" selected>Cão</Chip>
<Chip icon="paw-print">Gato</Chip>
<Chip selected onRemove={() => clear('home')}>Visita em casa</Chip>
```

Props: `icon`, `selected`, `onRemove`, `disabled`. Compose many inside `FilterChipGroup`.
