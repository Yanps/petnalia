import React from "react";
import { Icon } from "../core/Icon.jsx";

/** Checkbox — labelled checkbox built on the native input. */
export function Checkbox({ label, checked, defaultChecked, disabled = false, className = "", ...rest }) {
  return (
    <label className={["vn-check", className].filter(Boolean).join(" ")}>
      <input type="checkbox" checked={checked} defaultChecked={defaultChecked} disabled={disabled} {...rest} />
      <span className="vn-check__box"><Icon name="check" size={14} strokeWidth={3} /></span>
      {label && <span>{label}</span>}
    </label>
  );
}
