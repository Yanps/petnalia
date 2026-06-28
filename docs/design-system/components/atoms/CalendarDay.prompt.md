CalendarDay — single day cell for the vet availability calendar (maps to a Radix/shadcn Calendar day).

```jsx
<CalendarDay dow="QUA" day={18} available />
<CalendarDay dow="QUI" day={19} selected />
<CalendarDay dow="DOM" day={22} disabled />
```

States: default · `today` (teal outline) · `selected` (teal fill) · `disabled` · `available` (green dot).
