import React from "react";

/** Tooltip — hover/focus label. Wraps a single interactive child. */
export function Tooltip({ label, children, className = "", ...rest }) {
  return (
    <span className={["vn-tooltip-wrap", className].filter(Boolean).join(" ")} {...rest}>
      {children}
      <span role="tooltip" className="vn-tooltip">{label}</span>
    </span>
  );
}
