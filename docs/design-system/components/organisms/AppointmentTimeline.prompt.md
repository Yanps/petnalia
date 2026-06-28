AppointmentTimeline — the medical-record / appointment history organism: a connected vertical timeline of visits, vaccines, prescriptions, and exams.

```jsx
<AppointmentTimeline items={[
  { kind: "visit", title: "Consulta de rotina", date: "18 jun 2026", vet: "Dra. Helena", tag: "Concluída", tagVariant: "success", description: "Tudo bem com a Mel. Retorno em 6 meses." },
  { kind: "vaccine", title: "Vacina V4", date: "02 mai 2026", vet: "Dr. Rafael", tag: "Vacina", tagVariant: "info" },
  { kind: "prescription", title: "Receita — antialérgico", date: "02 mai 2026", vet: "Dr. Rafael" },
]} />
```

Event `kind` drives the icon + tint (visit/online/vaccine/prescription/exam). Has built-in loading and empty states.
