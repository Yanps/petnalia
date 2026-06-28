StatusDot — presence/availability indicator. Pass `label` (or `true` for the default) and `pulse` for live states.

```jsx
<StatusDot status="online" label pulse />
<StatusDot status="busy" label="Em atendimento" />
<StatusDot status="emergency" pulse />
```

Statuses: `online` (green) · `busy` (amber) · `offline` (grey) · `emergency` (red). Pulse auto-disables under prefers-reduced-motion.
