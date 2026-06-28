import React from "react";
import { Card } from "../core/Card.jsx";
import { Checkbox } from "../forms/Checkbox.jsx";
import { Switch } from "../forms/Switch.jsx";
import { Select } from "../forms/Select.jsx";
import { Button } from "../core/Button.jsx";
import { Separator } from "../core/Separator.jsx";
import { Icon } from "../core/Icon.jsx";

function Section({ title, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <h4 style={{ margin: 0, fontSize: "var(--small-size)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>{title}</h4>
      {children}
    </div>
  );
}

/**
 * SearchFilters — vet search filter panel (sidebar).
 * Presentational scaffold; wire inputs to your search state.
 */
export function SearchFilters({
  specialties = ["Clínica geral", "Felinos", "Dermatologia", "Ortopedia", "Comportamento"],
  resultCount, onClear, className = "", ...rest
}) {
  return (
    <Card pad className={className} {...rest}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Icon name="sliders" size={18} style={{ color: "var(--brand)" }} />
          <h3 style={{ margin: 0, fontSize: "var(--body-size)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>Filters</h3>
        </div>
        <Button variant="link" size="sm" onClick={onClear}>Clear all</Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <Section title="Visit type">
          <Switch label="Home visit" defaultChecked />
          <Switch label="Online consultation" />
        </Section>
        <Separator />

        <Section title="Specialty">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {specialties.map((s, i) => <Checkbox key={s} label={s} defaultChecked={i === 0} />)}
          </div>
        </Section>
        <Separator />

        <Section title="Availability">
          <Select options={["Any time", "Today", "Tomorrow", "This week", "Weekend"]} />
        </Section>
        <Separator />

        <Section title="Distance">
          <Select options={["Within 2 km", "Within 5 km", "Within 10 km", "Within 25 km"]} defaultValue="Within 5 km" />
        </Section>
        <Separator />

        <Section title="Minimum rating">
          <Select options={["Any", "4.0+", "4.5+", "4.8+"]} />
        </Section>
      </div>

      <div style={{ marginTop: "var(--space-5)" }}>
        <Button variant="primary" block iconLeft="search">
          {typeof resultCount === "number" ? `Show ${resultCount} vets` : "Apply filters"}
        </Button>
      </div>
    </Card>
  );
}
