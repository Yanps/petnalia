import React from "react";
import { Icon } from "../core/Icon.jsx";
import { DistanceIndicator } from "../atoms/DistanceIndicator.jsx";

const mapBg = {
  background:
    "linear-gradient(0deg, rgba(13,148,136,0.06), rgba(13,148,136,0.06)), " +
    "repeating-linear-gradient(0deg, transparent 0 23px, rgba(100,116,139,0.12) 23px 24px), " +
    "repeating-linear-gradient(90deg, transparent 0 23px, rgba(100,116,139,0.12) 23px 24px), " +
    "var(--surface-inset)",
};

/**
 * AddressPreview — map preview thumbnail + formatted address + distance.
 * The map area is a styled placeholder; drop in a real static-map image
 * by passing `mapSrc`.
 */
export function AddressPreview({ label = "Endereço da visita", address, distanceKm, mapSrc, action, onAction, className = "", ...rest }) {
  return (
    <div
      className={["vn-address", className].filter(Boolean).join(" ")}
      style={{ display: "flex", gap: "var(--space-4)", alignItems: "center", padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", background: "var(--surface)" }}
      {...rest}
    >
      <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0, borderRadius: "var(--radius-md)", overflow: "hidden", ...(mapSrc ? {} : mapBg) }}>
        {mapSrc && <img src={mapSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--brand)" }}>
          <Icon name="map-pin" size={26} style={{ filter: "drop-shadow(0 2px 3px rgba(15,23,42,0.25))" }} />
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: "var(--caption-size)", fontWeight: "var(--fw-semibold)", letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-muted)" }}>{label}</span>
        <span style={{ fontSize: "var(--small-size)", fontWeight: "var(--fw-medium)", color: "var(--text)", lineHeight: 1.4 }}>{address}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginTop: 2 }}>
          {typeof distanceKm !== "undefined" && <DistanceIndicator km={distanceKm} label="" />}
          {action && (
            <button onClick={onAction} style={{ appearance: "none", border: "none", background: "none", padding: 0, cursor: "pointer", color: "var(--text-link)", fontSize: "var(--caption-size)", fontWeight: "var(--fw-semibold)" }}>{action}</button>
          )}
        </div>
      </div>
    </div>
  );
}
