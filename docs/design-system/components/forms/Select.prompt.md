Select — styled dropdown with label/hint/error (maps to shadcn/ui Select for simple option lists).

```jsx
<Select label="Species" placeholder="Choose…" options={["Dog","Cat","Rabbit","Bird"]} />
<Select label="Reason" options={[{value:"checkup",label:"Routine check-up"},{value:"vaccine",label:"Vaccination"}]} />
```

Props: `label`, `hint`, `error`, `required`, `placeholder`, `options` (string[] or {value,label}[]). Matches Input height and focus styling.
