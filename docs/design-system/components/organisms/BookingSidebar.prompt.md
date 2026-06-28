BookingSidebar — the sticky booking rail on the vet profile / booking page. Composes Card + PriceTag + RadioGroup + Button + Separator.

```jsx
<BookingSidebar price={180} nextAvailable="Hoje 16:30"
  modality={modality} onModalityChange={setModality}
  selectedDate="QUA, 18/06" selectedTime="16:30"
  onBook={confirm} onMessage={openChat} />
```

The CTA disables until a date + time are chosen (when `modality` is used). Responsive: sticky rail on desktop → fixed bottom bar on mobile.
