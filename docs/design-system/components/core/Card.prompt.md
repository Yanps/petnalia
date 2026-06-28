Card — surface container with soft elevation; compose with Header/Body/Footer subcomponents.

```jsx
<Card interactive>
  <CardHeader>…</CardHeader>
  <CardBody>…</CardBody>
  <CardFooter>…</CardFooter>
</Card>

<Card pad>Simple padded content</Card>
```

Props: `interactive` (hover lift, for clickable cards), `flat` (no shadow), `pad` (24px padding without subcomponents), `as`. Default radius 16px, 1px hairline border, `--shadow-sm`.
