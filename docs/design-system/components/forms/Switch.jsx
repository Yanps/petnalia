import React from "react";

/** Switch — labelled on/off toggle built on the native checkbox input. */
export function Switch({ label, checked, defaultChecked, disabled = false, className = "", ...rest }) {
  return (
    <label className={["vn-switch", className].filter(Boolean).join(" ")}>
      <input type="checkbox" role="switch" checked={checked} defaultChecked={defaultChecked} disabled={disabled} {...rest} />
      <span className="vn-switch__track"><span className="vn-switch__thumb" /></span>
      {label && <span>{label}</span>}
    </label>
  );
}
