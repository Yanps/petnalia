import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * Chip — selectable pill for pet types and filters (Pet Type Chip / Filter Chip).
 * Toggle button by default; pass `onRemove` to render a dismissible chip.
 */
export function Chip({ children, icon, selected = false, onRemove, disabled = false, className = "", ...rest }) {
  const cls = ["vn-chip", selected && "vn-chip--selected", className].filter(Boolean).join(" ");
  return (
    <button type="button" className={cls} aria-pressed={selected} disabled={disabled} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
      {onRemove && (
        <span
          className="vn-chip__remove"
          role="button"
          aria-label="Remover"
          onClick={(e) => { e.stopPropagation(); onRemove(e); }}
        >
          <Icon name="x" size={14} />
        </span>
      )}
    </button>
  );
}
