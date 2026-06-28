import React from "react";
import { Icon } from "./Icon.jsx";

/** Rating — star rating with numeric value and optional review count. */
export function Rating({ value = 0, count, showValue = true, size = 16, className = "", ...rest }) {
  const full = Math.round(value);
  return (
    <span className={["vn-rating", className].filter(Boolean).join(" ")} {...rest}>
      {showValue && <span className="vn-rating__value">{value.toFixed(1)}</span>}
      <Icon name="star" size={size} className="vn-rating__star" style={{ fill: "currentColor" }} />
      {typeof count === "number" && (
        <span className="vn-rating__count">({count.toLocaleString()})</span>
      )}
    </span>
  );
}
