Button — the primary action control; renders a styled `<button>` with icon slots, mapping to shadcn/ui's Button.

```jsx
<Button variant="primary" iconLeft="calendar">Schedule visit</Button>
<Button variant="accent" iconRight="arrow-right">Confirm booking</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost" size="sm">Skip</Button>
```

Variants: `primary` (teal, default — one per view), `accent` (green, for confirm/availability CTAs), `secondary` (bordered), `outline` (teal outline), `ghost` (low emphasis), `destructive` (red), `link`. Sizes `sm | md | lg` — `md` is the 44px AA touch target. Props `block`, `iconLeft`, `iconRight`, plus all native button attrs. Disabled state drops to 50% opacity and removes elevation.
