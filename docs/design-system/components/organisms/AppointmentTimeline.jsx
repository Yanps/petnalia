import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Badge } from "../core/Badge.jsx";
import { EmptyState } from "../feedback/EmptyState.jsx";
import { Skeleton } from "../core/Skeleton.jsx";

const KIND = {
  visit: { icon: "home", tint: "var(--brand-subtle)", color: "var(--brand-active)" },
  online: { icon: "video", tint: "var(--green-50)", color: "var(--green-700)" },
  vaccine: { icon: "syringe", tint: "var(--info-bg)", color: "var(--info)" },
  prescription: { icon: "pill", tint: "var(--warning-bg)", color: "var(--warning)" },
  exam: { icon: "file-text", tint: "var(--surface-inset)", color: "var(--text-secondary)" },
};

/**
 * AppointmentTimeline — vertical medical-record / appointment history.
 * Organism: composes Icon + Badge (+ Skeleton / EmptyState).
 */
export function AppointmentTimeline({ items = [], loading = false, className = "", ...rest }) {
  if (loading) {
    return (
      <div className={className} {...rest}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: "flex", gap: "var(--space-4)", padding: "var(--space-3) 0" }}>
            <Skeleton circle height={40} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <Skeleton width="40%" height={14} />
              <Skeleton width="80%" height={12} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <EmptyState compact icon="file-text" title="Sem histórico ainda" description="As consultas, vacinas e receitas do seu pet aparecerão aqui." />;
  }

  return (
    <ul className={["vn-timeline", className].filter(Boolean).join(" ")} style={{ listStyle: "none", margin: 0, padding: 0 }} {...rest}>
      {items.map((it, i) => {
        const k = KIND[it.kind] || KIND.visit;
        const last = i === items.length - 1;
        return (
          <li key={it.id || i} style={{ display: "flex", gap: "var(--space-4)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "var(--radius-full)", background: k.tint, color: k.color, display: "grid", placeItems: "center", border: "1px solid var(--border)" }}>
                <Icon name={k.icon} size={18} />
              </span>
              {!last && <span style={{ flex: 1, width: 2, background: "var(--border)", margin: "4px 0", minHeight: 16 }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: last ? 0 : "var(--space-5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <span style={{ fontSize: "var(--body-size)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>{it.title}</span>
                {it.tag && <Badge variant={it.tagVariant || "neutral"}>{it.tag}</Badge>}
              </div>
              <div style={{ fontSize: "var(--caption-size)", color: "var(--text-muted)", marginTop: 2, display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="calendar" size={13} />{it.date}</span>
                {it.vet && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="stethoscope" size={13} />{it.vet}</span>}
              </div>
              {it.description && <p style={{ margin: "var(--space-2) 0 0", fontSize: "var(--small-size)", lineHeight: 1.5, color: "var(--text-secondary)" }}>{it.description}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
