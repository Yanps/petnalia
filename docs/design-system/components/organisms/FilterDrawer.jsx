import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Button } from "../core/Button.jsx";

/**
 * FilterDrawer — mobile slide-in panel that hosts SearchFilters (or any
 * filter content) off-canvas. Organism: scrim + drawer + Button footer.
 * Uses the z-index ladder (--z-overlay / --z-drawer).
 */
export function FilterDrawer({ open = false, onClose, onApply, title = "Filtros", resultCount, side = "left", children, className = "", ...rest }) {
  return (
    <>
      <div className="vn-scrim" data-open={open} onClick={onClose} aria-hidden="true" />
      <aside
        className={["vn-drawer", side === "right" && "vn-drawer--right", className].filter(Boolean).join(" ")}
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        {...rest}
      >
        <div className="vn-drawer__header">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--body-size)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>
            <Icon name="sliders" size={18} style={{ color: "var(--brand)" }} />{title}
          </span>
          <button onClick={onClose} aria-label="Fechar" style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "var(--surface-inset)", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="vn-drawer__body">{children}</div>
        <div className="vn-drawer__footer">
          <Button variant="ghost" onClick={onClose}>Limpar</Button>
          <Button variant="primary" block onClick={onApply}>
            {typeof resultCount === "number" ? `Ver ${resultCount} vets` : "Aplicar filtros"}
          </Button>
        </div>
      </aside>
    </>
  );
}
