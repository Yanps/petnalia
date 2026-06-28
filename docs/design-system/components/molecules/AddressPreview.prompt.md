AddressPreview — map thumbnail + formatted address + distance, for the booking flow and home-visit coverage.

```jsx
<AddressPreview address="Rua Augusta, 1024 — Consolação, São Paulo" distanceKm={2.4} action="Alterar" onAction={editAddress} />
```

The map area is a styled placeholder by default — pass `mapSrc` (a static-map image URL) for a real preview. Composes the `DistanceIndicator` atom.
