import React from "react";

/**
 * AvailabilitySlot — a bookable time slot.
 * States: available (default), occupied (disabled), selected.
 */
export function AvailabilitySlot({ time, state = "available", onSelect, className = "", ...rest }) {
  const occupied = state === "occupied";
  const selected = state === "selected";
  return (
    <button
      type="button"
      disabled={occupied}
      aria-pressed={selected}
      onClick={onSelect}
      className={["vn-slot", `vn-slot--${state}`, className].filter(Boolean).join(" ")}
      style={{
        minWidth: 76, padding: "10px 16px", borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-sans)", fontSize: "var(--small-size)", fontWeight: "var(--fw-semibold)",
        cursor: occupied ? "not-allowed" : "pointer",
        border: `1.5px solid ${selected ? "var(--brand)" : occupied ? "var(--border)" : "var(--border-strong)"}`,
        background: selected ? "var(--brand-subtle)" : occupied ? "var(--surface-inset)" : "var(--surface)",
        color: selected ? "var(--brand-active)" : occupied ? "var(--text-disabled)" : "var(--text)",
        textDecoration: occupied ? "line-through" : "none",
        transition: "all var(--motion-fast) var(--ease-standard)",
      }}
      {...rest}
    >
      {time}
    </button>
  );
}
