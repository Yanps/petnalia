CoverageMap — the home-visit coverage organism: a map with a dashed service-radius ring, scattered vet pins, and an in/out-of-area status badge.

```jsx
<CoverageMap covered radiusKm={8} areaLabel="Zona Oeste · São Paulo"
  pins={[{top:35,left:30},{top:60,left:65},{top:42,left:72,covered:false}]} />
```

The map area is a styled placeholder by default — pass `mapSrc` (a static-map image) for a real background. Composes Icon + Badge.
