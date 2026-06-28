import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Badge } from "../core/Badge.jsx";

/**
 * CoverageMap — home-visit coverage area visualization.
 * Organism: styled map placeholder + coverage radius + legend (Icon + Badge).
 * Pass `mapSrc` for a real static-map background.
 */
export function CoverageMap({
  covered = true, radiusKm = 8, areaLabel, mapSrc, height = 320,
  pins = [], className = "", ...rest
}) {
  return (
    <div className={["vn-coverage", className].filter(Boolean).join(" ")} style={{ position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border)", height }} {...rest}>
      <div className={mapSrc ? "" : "vn-mapgrid"} style={{ position: "absolute", inset: 0 }}>
        {mapSrc && <img src={mapSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      </div>

      {/* Coverage radius ring centered */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "62%", aspectRatio: "1", borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.18), rgba(13,148,136,0.06) 70%, transparent 72%)", border: "2px dashed var(--brand)" }} />

      {/* Center pin */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -100%)", color: "var(--brand)" }}>
        <Icon name="map-pin" size={34} style={{ filter: "drop-shadow(0 3px 5px rgba(15,23,42,0.3))" }} />
      </div>

      {/* Scattered vet pins */}
      {pins.map((p, i) => (
        <div key={i} style={{ position: "absolute", top: `${p.top}%`, left: `${p.left}%`, transform: "translate(-50%, -100%)", color: p.covered === false ? "var(--text-muted)" : "var(--accent)" }}>
          <Icon name="stethoscope" size={20} style={{ filter: "drop-shadow(0 2px 3px rgba(15,23,42,0.25))" }} />
        </div>
      ))}

      {/* Status overlay */}
      <div style={{ position: "absolute", left: "var(--space-3)", top: "var(--space-3)" }}>
        {covered
          ? <Badge variant="success" icon="check-circle">Atendido nesta região</Badge>
          : <Badge variant="warning" icon="alert-triangle">Fora da área de cobertura</Badge>}
      </div>

      {/* Footer legend */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)", background: "linear-gradient(0deg, rgba(255,255,255,0.92), rgba(255,255,255,0))" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--small-size)", fontWeight: "var(--fw-medium)", color: "var(--slate-700)" }}>
          <Icon name="home" size={15} style={{ color: "var(--brand)" }} />
          Raio de atendimento: {radiusKm} km
        </span>
        {areaLabel && <span style={{ fontSize: "var(--caption-size)", color: "var(--slate-600)" }}>{areaLabel}</span>}
      </div>
    </div>
  );
}
