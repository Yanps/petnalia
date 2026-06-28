import React from "react";
import { Icon } from "./Icon.jsx";

/**
 * Button — primary action control (maps to shadcn/ui Button).
 * Variants: primary, accent, secondary, outline, ghost, destructive, link.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  block = false,
  iconLeft,
  iconRight,
  disabled = false,
  type = "button",
  className = "",
  ...rest
}) {
  const cls = [
    "vn-btn",
    `vn-btn--${variant}`,
    size !== "md" && `vn-btn--${size}`,
    block && "vn-btn--block",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={cls} disabled={disabled} {...rest}>
      {iconLeft && <Icon name={iconLeft} className="vn-btn__icon" />}
      {children}
      {iconRight && <Icon name={iconRight} className="vn-btn__icon" />}
    </button>
  );
}
