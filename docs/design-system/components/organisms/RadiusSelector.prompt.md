RadiusSelector — choose a search/coverage radius with a styled range slider and a live `CoverageMap` preview.

```jsx
<RadiusSelector value={radius} onChange={setRadius} resultCount={48} areaLabel="São Paulo" />
```

The slider track fills teal to the thumb; the map updates its ring as `value` changes. Composes a token-styled range input + CoverageMap.
