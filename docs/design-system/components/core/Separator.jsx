import React from "react";

/** Separator — thin divider line, horizontal or vertical. */
export function Separator({ orientation = "horizontal", className = "", style, ...rest }) {
  const cls = ["vn-sep", orientation === "vertical" ? "vn-sep--v" : "vn-sep--h", className].filter(Boolean).join(" ");
  return <div role="separator" aria-orientation={orientation} className={cls} style={style} {...rest} />;
}
