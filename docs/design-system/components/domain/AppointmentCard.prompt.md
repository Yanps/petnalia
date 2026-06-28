AppointmentCard — scheduled-visit summary for the dashboard and history. Shows modality (home/online), status, date/time/address, and the vet.

```jsx
<AppointmentCard
  vetName="Dra. Helena Marques" vetPhoto="/vets/helena.jpg"
  petName="Mel" type="home" status="confirmed"
  date="Tue, 18 Jun" time="14:00"
  address="Rua Augusta, 1024 — Consolação"
  onPrimary={() => openDetails()}
/>
```

`status`: `upcoming | confirmed | pending | completed | cancelled` drives the badge color. `type="online"` swaps the icon to video and hides address.
