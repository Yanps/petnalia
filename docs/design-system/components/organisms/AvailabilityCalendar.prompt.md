AvailabilityCalendar — the scheduling organism: a horizontal day strip of `CalendarDay` atoms over period-grouped `AvailabilitySlot` molecules (Manhã / Tarde / Noite), with loading and empty states.

```jsx
<AvailabilityCalendar
  days={days} selectedDay={day} onSelectDay={setDay}
  slots={{ morning: ["08:00","09:00"], afternoon: [{time:"14:00"},{time:"15:30",occupied:true}], evening: ["18:00"] }}
  selectedSlot={slot} onSelectSlot={setSlot} />
```

The day strip scrolls horizontally on mobile. Composes CalendarDay + AvailabilitySlot + EmptyState + Skeleton.
