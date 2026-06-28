import React from "react";
import { Chip } from "../atoms/Chip.jsx";

/**
 * FilterChipGroup — a labelled row of selectable filter/pet-type chips.
 * Controlled via `value` (array of selected option values) + `onChange`,
 * or uncontrolled with `defaultValue`.
 */
export function FilterChipGroup({ label, options = [], value, defaultValue = [], onChange, multiple = true, className = "", ...rest }) {
  const [internal, setInternal] = React.useState(defaultValue);
  const selected = value ?? internal;

  const toggle = (v) => {
    let next;
    if (multiple) next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
    else next = selected.includes(v) ? [] : [v];
    setInternal(next);
    onChange && onChange(next);
  };

  return (
    <div className={["vn-chipgroup", className].filter(Boolean).join(" ")} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }} {...rest}>
      {label && <span style={{ fontSize: "var(--small-size)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>{label}</span>}
      <div role="group" aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <Chip key={opt.value} icon={opt.icon} selected={selected.includes(opt.value)} onClick={() => toggle(opt.value)}>
              {opt.label}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}
