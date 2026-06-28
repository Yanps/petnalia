import React from "react";
import { Icon } from "../core/Icon.jsx";

function range(total, current, siblings = 1) {
  const pages = new Set([1, total, current]);
  for (let i = 1; i <= siblings; i++) {
    pages.add(Math.max(1, current - i));
    pages.add(Math.min(total, current + i));
  }
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

/** Pagination — page navigation with prev/next and ellipsis. */
export function Pagination({ total = 1, page = 1, onChange, className = "", ...rest }) {
  const go = (p) => { if (p >= 1 && p <= total && p !== page && onChange) onChange(p); };
  return (
    <nav aria-label="Pagination" className={["vn-pg", className].filter(Boolean).join(" ")} {...rest}>
      <button className="vn-pg__item" disabled={page <= 1} onClick={() => go(page - 1)} aria-label="Previous page">
        <Icon name="chevron-left" size={16} />
      </button>
      {range(total, page).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="vn-pg__ellipsis">…</span>
        ) : (
          <button key={p} className="vn-pg__item" aria-current={p === page ? "page" : undefined} onClick={() => go(p)}>{p}</button>
        )
      )}
      <button className="vn-pg__item" disabled={page >= total} onClick={() => go(page + 1)} aria-label="Next page">
        <Icon name="chevron-right" size={16} />
      </button>
    </nav>
  );
}
