import React from "react";
import { Icon } from "../core/Icon.jsx";

const ICONS = { info: "info", success: "check-circle", warning: "alert-triangle", error: "alert-circle" };

/** Alert — inline contextual message banner. */
export function Alert({ variant = "info", title, children, icon, className = "", ...rest }) {
  const name = icon || ICONS[variant];
  return (
    <div role="alert" className={["vn-alert", `vn-alert--${variant}`, className].filter(Boolean).join(" ")} {...rest}>
      {name && <Icon name={name} className="vn-alert__icon" />}
      <div className="vn-alert__body">
        {title && <div className="vn-alert__title">{title}</div>}
        {children && <div className="vn-alert__desc">{children}</div>}
      </div>
    </div>
  );
}
