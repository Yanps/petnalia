import React from "react";
import { Icon } from "../core/Icon.jsx";
import { PriceTag } from "../atoms/PriceTag.jsx";
import { Button } from "../core/Button.jsx";
import { EmptyState } from "../feedback/EmptyState.jsx";

/**
 * ServicesList — list of a vet's offered services with icon, price, and CTA.
 * Organism: composes Icon + PriceTag + Button (+ EmptyState).
 */
export function ServicesList({ services = [], onSelect, selectable = false, className = "", ...rest }) {
  if (!services.length) {
    return <EmptyState compact icon="stethoscope" title="Nenhum serviço cadastrado" description="Este profissional ainda não listou serviços." />;
  }
  return (
    <ul className={["vn-services", className].filter(Boolean).join(" ")} style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }} {...rest}>
      {services.map((s, i) => (
        <li key={s.id || i} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4) 0", borderBottom: i < services.length - 1 ? "1px solid var(--border)" : "none" }}>
          <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", color: "var(--brand-active)", display: "grid", placeItems: "center" }}>
            <Icon name={s.icon || "stethoscope"} size={20} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "var(--body-size)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>{s.name}</div>
            {s.description && <div style={{ fontSize: "var(--small-size)", color: "var(--text-secondary)", marginTop: 2 }}>{s.description}</div>}
            {s.duration && <div style={{ fontSize: "var(--caption-size)", color: "var(--text-muted)", marginTop: 2, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="clock" size={13} />{s.duration}</div>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--space-2)" }}>
            <PriceTag amount={s.price} from={s.from} size="sm" />
            {selectable && <Button variant="outline" size="sm" iconRight="arrow-right" onClick={() => onSelect && onSelect(s)}>Agendar</Button>}
          </div>
        </li>
      ))}
    </ul>
  );
}
