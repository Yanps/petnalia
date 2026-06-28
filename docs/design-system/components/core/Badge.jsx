import React from "react";
import { Icon } from "./Icon.jsx";

/** Badge — compact status / metadata label. */
export function Badge({ children, variant = "neutral", icon, pill = false, solid = false, className = "", ...rest }) {
  const cls = [
    "vn-badge",
    `vn-badge--${variant}`,
    pill && "vn-badge--pill",
    solid && "vn-badge--solid",
    className,
  ].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
}
