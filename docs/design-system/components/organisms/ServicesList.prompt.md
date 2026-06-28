ServicesList — a vet's offered services. Composes Icon + PriceTag + Button atoms, with a built-in empty state.

```jsx
<ServicesList selectable onSelect={pickService} services={[
  { icon: "home", name: "Visita domiciliar", duration: "45 min", price: 180, from: true },
  { icon: "video", name: "Teleconsulta", duration: "30 min", price: 120, from: true },
  { icon: "syringe", name: "Vacinação a domicílio", price: 90, from: true },
]} />
```
