import React from "react";

/** PriceTag — formatted price with optional "from" prefix and unit. */
export function PriceTag({ amount, currency = "R$", from = false, unit, size = "md", strike, className = "", style, ...rest }) {
  const sizes = { sm: 15, md: 20, lg: 26 };
  const fmt = (v) => typeof v === "number" ? v.toLocaleString("pt-BR", { minimumFractionDigits: 0 }) : v;
  return (
    <span className={["vn-pricetag", className].filter(Boolean).join(" ")} style={{ display: "inline-flex", alignItems: "baseline", gap: "var(--space-1)", ...style }} {...rest}>
      {from && <span style={{ fontSize: "var(--caption-size)", color: "var(--text-muted)", fontWeight: "var(--fw-medium)" }}>A partir de</span>}
      {strike !== undefined && (
        <span style={{ fontSize: sizes[size] * 0.7, color: "var(--text-muted)", textDecoration: "line-through", fontWeight: "var(--fw-medium)" }}>{currency} {fmt(strike)}</span>
      )}
      <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: sizes[size], color: "var(--text)", letterSpacing: "-0.01em" }}>
        {currency} {fmt(amount)}
      </span>
      {unit && <span style={{ fontSize: "var(--caption-size)", color: "var(--text-muted)" }}>/ {unit}</span>}
    </span>
  );
}
