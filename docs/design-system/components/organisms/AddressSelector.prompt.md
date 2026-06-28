AddressSelector — the home-visit address organism: a search field over a list of saved addresses (each an `AddressPreview`), with selection state and an add CTA.

```jsx
<AddressSelector selectedId={addr} onSelect={setAddr} onAdd={newAddress}
  addresses={[
    { id: "home", label: "Casa", address: "Rua Augusta, 1024 — Consolação", distanceKm: 2.4 },
    { id: "work", label: "Trabalho", address: "Av. Paulista, 1000 — Bela Vista", distanceKm: 3.1 },
  ]} />
```

Composes Input + AddressPreview + Button, with an empty state when no addresses are saved.
