RadioGroup — single-choice control (maps to shadcn/ui RadioGroup on Radix). Use for 2–5 mutually exclusive options; use Select past ~6.

```jsx
<RadioGroup name="modal" defaultValue="home" legend="Tipo de atendimento" options={[
  { value: "home", label: "Visita em casa" },
  { value: "online", label: "Teleconsulta" },
]} />
```

Props: `name`, `options` (string[] or {value,label,disabled}[]), `value`/`defaultValue`, `onChange`, `row`, `legend`.
