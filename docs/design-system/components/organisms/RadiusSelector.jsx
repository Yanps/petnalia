import React from "react";
import { Icon } from "../core/Icon.jsx";
import { CoverageMap } from "./CoverageMap.jsx";

/**
 * RadiusSelector — choose a search/coverage radius with a live preview.
 * Organism: range slider (styled input) + CoverageMap + count readout.
 */
export function RadiusSelector({
  value = 5, min = 1, max = 25, step = 1, onChange,
  resultCount, areaLabel, showMap = true, className = "", ...rest
}) {
  const set = (v) => onChange && onChange(Number(v));
  return (
    <div className={["vn-radius", className].filter(Boolean).join(" ")} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }} {...rest}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: "var(--small-size)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>Raio de busca</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--body-size)", fontWeight: "var(--fw-bold)", color: "var(--brand-active)" }}>
          <Icon name="map-pin" size={16} />{value} km
        </span>
      </div>

      <input
        type="range"
        className="vn-range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => set(e.target.value)}
        aria-label="Raio de busca em quilômetros"
        aria-valuetext={`${value} quilômetros`}
        style={{ background: `linear-gradient(90deg, var(--brand) ${((value - min) / (max - min)) * 100}%, var(--slate-200) ${((value - min) / (max - min)) * 100}%)` }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--caption-size)", color: "var(--text-muted)" }}>
        <span>{min} km</span>
        {typeof resultCount === "number" && <span style={{ color: "var(--text-secondary)", fontWeight: "var(--fw-medium)" }}>{resultCount} vets nesta área</span>}
        <span>{max} km</span>
      </div>

      {showMap && <CoverageMap radiusKm={value} areaLabel={areaLabel} height={220} />}
    </div>
  );
}
