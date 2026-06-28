import React from "react";

function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();
}

/** Avatar — user/vet image with initials fallback and optional status dot. */
export function Avatar({ src, name, fullName, size = "md", status, className = "", ...rest }) {
  const who = name ?? fullName ?? "";
  const cls = ["vn-avatar", `vn-avatar--${size}`, className].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {src ? <img src={src} alt={who} /> : <span>{initials(who)}</span>}
      {status && <span className={`vn-avatar__status vn-avatar__status--${status}`} aria-label={status} />}
    </span>
  );
}
