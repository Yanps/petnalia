Alert — inline contextual banner (maps to shadcn/ui Alert). Variant sets color + default icon.

```jsx
<Alert variant="success" title="Visit confirmed">Dr. Helena will arrive Tue, 14:00.</Alert>
<Alert variant="warning" title="Almost full">Only 2 slots left this week.</Alert>
<Alert variant="error" title="Payment failed">Check your card details and try again.</Alert>
```

Variants: `info | success | warning | error`. Title via `title`, body via children. Use for page/section-level messaging; use Toast for transient feedback.
