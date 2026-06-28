import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Separator } from "../core/Separator.jsx";

/**
 * Footer — global site footer (organism).
 * Composes Logo + link columns + legal/trust row.
 */
export function Footer({ logoSrc, brand = "PetNalia", tagline = "Veterinário a domicílio, cuidado que chega até você.", columns = [], social = [], className = "", ...rest }) {
  const year = new Date().getFullYear();
  return (
    <footer className={["vn-footer", className].filter(Boolean).join(" ")} {...rest}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--space-9) var(--space-5) var(--space-6)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--space-7)" }}>
          <div style={{ maxWidth: 280 }}>
            {logoSrc
              ? <img src={logoSrc} alt={brand} style={{ height: 34, width: "auto" }} />
              : <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--text)" }}>{brand}</span>}
            <p style={{ margin: "var(--space-3) 0 0", fontSize: "var(--small-size)", lineHeight: 1.55, color: "var(--text-secondary)" }}>{tagline}</p>
            <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
              {social.map((s) => (
                <a key={s.icon} href={s.href || "#"} aria-label={s.label} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border)", display: "grid", placeItems: "center", color: "var(--text-secondary)" }}>
                  <Icon name={s.icon} size={17} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col, i) => (
            <div key={i}>
              <p className="vn-footer__col-title">{col.title}</p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {col.links.map((l, j) => (
                  <li key={j}><a href={l.href || "#"}>{l.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator style={{ margin: "var(--space-6) 0 var(--space-4)" }} />

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
          <span style={{ fontSize: "var(--caption-size)", color: "var(--text-muted)" }}>© {year} {brand}. Todos os direitos reservados.</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--caption-size)", color: "var(--text-muted)" }}>
            <Icon name="shield-check" size={14} style={{ color: "var(--brand)" }} />
            Profissionais com registro CRMV verificado
          </span>
        </div>
      </div>
    </footer>
  );
}
