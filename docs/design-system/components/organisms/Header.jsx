import React from "react";
import { Avatar } from "../core/Avatar.jsx";
import { Icon } from "../core/Icon.jsx";
import { Button } from "../core/Button.jsx";

/**
 * Header — global marketplace navigation bar (organism).
 * Composes Logo + nav links + location + notifications + Avatar.
 * Sticky, blurred; uses --z-sticky. Pass `logoSrc` (horizontal lockup).
 */
export function Header({
  logoSrc, brand = "PetNalia", links = [], active, city,
  user, unread = false, onNav, onMenu, onLogin, compact = false, className = "", ...rest
}) {
  return (
    <header className={["vn-header", className].filter(Boolean).join(" ")} style={{ position: "sticky", top: 0, zIndex: "var(--z-sticky)", background: "color-mix(in srgb, var(--surface) 85%, transparent)", backdropFilter: "saturate(180%) blur(12px)", borderBottom: "1px solid var(--border)" }} {...rest}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 var(--space-5)", height: 68, display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
        {/* Mobile menu */}
        {onMenu && (
          <button onClick={onMenu} aria-label="Abrir menu" className="vn-header__menu" style={{ display: "none", width: 40, height: 40, borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", placeItems: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
            <Icon name="menu" size={20} />
          </button>
        )}

        <a onClick={() => onNav && onNav("home")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }}>
          {logoSrc
            ? <img src={logoSrc} alt={brand} style={{ height: 36, width: "auto", display: "block" }} />
            : <>
                <span style={{ width: 36, height: 36, borderRadius: 11, background: "var(--brand)", color: "#fff", display: "grid", placeItems: "center", boxShadow: "var(--shadow-brand)" }}><Icon name="stethoscope" size={20} strokeWidth={2.2} /></span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--text)", letterSpacing: "-0.02em" }}>{brand}</span>
              </>}
        </a>

        {!compact && (
          <nav className="vn-header__nav" style={{ display: "flex", gap: 4 }}>
            {links.map((l) => (
              <button key={l.id} onClick={() => onNav && onNav(l.id)} style={{
                appearance: "none", border: "none", cursor: "pointer",
                background: active === l.id ? "var(--brand-subtle)" : "transparent",
                color: active === l.id ? "var(--brand-active)" : "var(--text-secondary)",
                font: "var(--fw-medium) 14px/1 var(--font-sans)", padding: "9px 14px", borderRadius: 10,
              }}>{l.label}</button>
            ))}
          </nav>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          {city && (
            <span className="vn-header__city" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
              <Icon name="map-pin" size={16} style={{ color: "var(--brand)" }} />{city}
            </span>
          )}
          {user ? (
            <>
              <button aria-label="Notificações" style={{ position: "relative", width: 40, height: 40, borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
                <Icon name="bell" size={18} />
                {unread && <span style={{ position: "absolute", top: 8, right: 9, width: 7, height: 7, background: "var(--accent)", borderRadius: "50%", border: "2px solid var(--surface)" }} />}
              </button>
              <Avatar name={user.name} src={user.photo} size="md" status={user.status} style={{ cursor: "pointer" }} />
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={onLogin}>Entrar</Button>
          )}
        </div>
      </div>
    </header>
  );
}
