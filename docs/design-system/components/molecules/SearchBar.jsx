import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Button } from "../core/Button.jsx";

function Field({ icon, children, grow = 1, divider = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: grow, minWidth: 0, padding: "0 14px", borderLeft: divider ? "1px solid var(--border)" : "none" }}>
      <Icon name={icon} size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
      {children}
    </div>
  );
}

const baseSelect = { border: "none", outline: "none", background: "transparent", height: 48, font: "15px var(--font-sans)", color: "var(--text)", flex: 1, minWidth: 0, cursor: "pointer", appearance: "none" };

/**
 * SearchBar — the marketplace search molecule: address input + pet type +
 * specialty + search button. Presentational; wire inputs to your state.
 */
export function SearchBar({ onSearch, petTypes = ["Cão", "Gato", "Outro"], specialties = ["Clínica geral", "Felinos", "Dermatologia", "Ortopedia", "Comportamento"], className = "", ...rest }) {
  return (
    <div
      className={["vn-searchbar", className].filter(Boolean).join(" ")}
      style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)" }}
      {...rest}
    >
      <Field icon="map-pin" grow={1.4} divider={false}>
        <input placeholder="Seu endereço ou cidade" style={{ ...baseSelect, cursor: "text" }} />
      </Field>
      <Field icon="paw-print">
        <select aria-label="Tipo de pet" style={baseSelect} defaultValue="">
          <option value="" disabled>Tipo de pet</option>
          {petTypes.map((p) => <option key={p}>{p}</option>)}
        </select>
        <Icon name="chevron-down" size={16} style={{ color: "var(--text-muted)" }} />
      </Field>
      <Field icon="stethoscope">
        <select aria-label="Especialidade" style={baseSelect} defaultValue="">
          <option value="" disabled>Especialidade</option>
          {specialties.map((s) => <option key={s}>{s}</option>)}
        </select>
        <Icon name="chevron-down" size={16} style={{ color: "var(--text-muted)" }} />
      </Field>
      <Button variant="primary" size="lg" iconLeft="search" onClick={onSearch}>Buscar</Button>
    </div>
  );
}
