VetCard — the flagship search-result card for a veterinarian. Composes Card, Avatar, Badge, Rating, and Button.

```jsx
<VetCard
  name="Dra. Helena Marques"
  specialty="Feline medicine · Dermatology"
  photo="/vets/helena.jpg"
  rating={4.9} reviews={213}
  distance={2.4}
  homeVisit online verified
  nextAvailable="Today 16:30"
  price="From R$ 180"
  onSchedule={() => openBooking()}
/>
```

Service badges (`homeVisit`, `online`), `verified` shield, `distance`, `nextAvailable`, and `price` are all optional — render only what the listing has. The Schedule button is the single primary action.
