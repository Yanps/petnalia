Input — labelled text field with hint, error, and icon slots (maps to shadcn/ui Input).

```jsx
<Input label="Email" type="email" icon="user" placeholder="you@email.com" required />
<Input label="Search" icon="search" placeholder="Vet, specialty, city" />
<Input label="CEP" error="Enter a valid postal code" />
```

Props: `label`, `hint`, `error` (sets aria-invalid + red), `icon`, `iconRight`, `required`, plus native input attrs. 44px height, focus ring uses `--ring`.
