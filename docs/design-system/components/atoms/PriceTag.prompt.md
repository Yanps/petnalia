PriceTag — formatted price (pt-BR) for vet cards, services, and checkout.

```jsx
<PriceTag amount={180} from />
<PriceTag amount={120} unit="consulta" size="lg" />
<PriceTag amount={150} strike={200} />
```

Props: `amount`, `currency` (default R$), `from`, `unit`, `size`, `strike` (promo original).
