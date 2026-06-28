Tabs — section navigation (maps to shadcn/ui Tabs). Renders the tablist; you render the panel from the active value.

```jsx
const [tab, setTab] = React.useState("about");
<Tabs value={tab} onChange={setTab} items={[
  { value: "about", label: "About" },
  { value: "reviews", label: "Reviews", count: 213 },
  { value: "services", label: "Services" },
]} />
```

Variants: `underline` (default) and `pill` (segmented). Items support `icon` and `count`.
