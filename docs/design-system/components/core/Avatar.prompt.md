Avatar — circular user/vet image with automatic initials fallback and optional presence dot.

```jsx
<Avatar src="/dr-helena.jpg" name="Helena Marques" size="lg" status="online" />
<Avatar name="João Pereira" size="md" />
```

Sizes `xs | sm | md | lg | xl`. `status`: `online` (green) `busy` (amber) `offline` (grey). Always pass `name` for accessible alt text even when `src` is set.
