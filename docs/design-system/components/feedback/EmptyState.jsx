import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Button } from "../core/Button.jsx";

/** EmptyState — illustration slot + title + description + optional action. */
export function EmptyState({ icon = "search", title, description, action, actionIcon, onAction, compact = false, className = "", ...rest }) {
  return (
    <div
      className={["vn-empty", className].filter(Boolean).join(" ")}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "var(--space-3)", padding: compact ? "var(--space-6)" : "var(--space-9) var(--space-6)" }}
      {...rest}
    >
      <span style={{ width: compact ? 48 : 64, height: compact ? 48 : 64, borderRadius: "var(--radius-xl)", background: "var(--brand-subtle)", color: "var(--brand)", display: "grid", placeItems: "center" }}>
        <Icon name={icon} size={compact ? 24 : 30} />
      </span>
      {title && <h3 style={{ margin: 0, fontSize: "var(--h4-size)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>{title}</h3>}
      {description && <p style={{ margin: 0, maxWidth: 340, fontSize: "var(--small-size)", lineHeight: 1.55, color: "var(--text-secondary)" }}>{description}</p>}
      {action && <div style={{ marginTop: "var(--space-2)" }}><Button variant="primary" iconLeft={actionIcon} onClick={onAction}>{action}</Button></div>}
    </div>
  );
}
