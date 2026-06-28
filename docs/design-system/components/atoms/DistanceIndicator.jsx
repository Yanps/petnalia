import React from "react";
import { Icon } from "../core/Icon.jsx";

/** DistanceIndicator — map-pin + distance from the user's address. */
export function DistanceIndicator({ km, label = "de você", size = "sm", className = "", style, ...rest }) {
  const fs = size === "md" ? "var(--small-size)" : "var(--caption-size)";
  const text = typeof km === "number" ? `${km.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km` : km;
  return (
    <span className={["vn-distance", className].filter(Boolean).join(" ")} style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)", fontSize: fs, color: "var(--text-secondary)", fontWeight: "var(--fw-medium)", ...style }} {...rest}>
      <Icon name="map-pin" size={size === "md" ? 15 : 13} style={{ color: "var(--brand)" }} />
      {text}{label ? <span style={{ color: "var(--text-muted)", fontWeight: "var(--fw-regular)" }}>· {label}</span> : null}
    </span>
  );
}
