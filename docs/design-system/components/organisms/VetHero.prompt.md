VetHero — the veterinarian profile header organism. Composes Avatar + Rating + Badges (Verified CRMV / Home Visit / Online) + DistanceIndicator + StatusDot + action Buttons.

```jsx
<VetHero name="Dra. Helena Marques" specialty="Felinos · Dermatologia"
  crm="CRMV-SP 28431" rating={4.9} reviews={213} distance={2.4}
  homeVisit online verified status="online"
  onBook={openBooking} onMessage={openChat} />
```

Responsive: the CTA column wraps below the identity block under md.
