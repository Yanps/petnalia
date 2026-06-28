PetProfileCard — pet identity summary with a vitals grid and health flags. Used on the pet profile and inside booking flows.

```jsx
<PetProfileCard
  name="Mel" species="Cat" breed="Siamese"
  ageLabel="3 years" weight="4.1 kg" sex="Female"
  photo="/pets/mel.jpg" neutered microchip
/>
```

Vitals (age/weight/species) render in a 3-up grid; missing values show "—". `neutered` and `microchip` show as health badges.
