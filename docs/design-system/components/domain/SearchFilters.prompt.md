SearchFilters — the vet-search filter sidebar. Composes Switch, Checkbox, Select, Separator, and Button into the standard marketplace filter stack: visit type, specialty, availability, distance, rating.

```jsx
<SearchFilters resultCount={48} onClear={resetFilters} />
```

Presentational scaffold — wire each control to your search state. The apply button shows the live result count when `resultCount` is passed. On mobile, present this inside a Drawer/Sheet rather than inline.
