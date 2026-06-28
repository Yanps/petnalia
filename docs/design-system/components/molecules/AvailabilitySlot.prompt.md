AvailabilitySlot — a single bookable time slot for the booking flow.

```jsx
<AvailabilitySlot time="16:30" state="selected" />
<AvailabilitySlot time="09:00" state="occupied" />
<AvailabilitySlot time="14:00" onSelect={() => pick("14:00")} />
```

States: `available` (default) · `occupied` (struck-through, disabled) · `selected` (teal). Lay out in a wrapped flex row grouped by period.
