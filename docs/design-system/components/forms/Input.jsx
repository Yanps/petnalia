import React from "react";
import { Icon } from "../core/Icon.jsx";

let _id = 0;
const useId = (p) => React.useMemo(() => `${p}-${++_id}`, [p]);

/** Input — text field with label, hint, error, and optional icons. */
export function Input({
  label, hint, error, icon, iconRight, required = false,
  id, className = "", type = "text", ...rest
}) {
  const autoId = useId("vn-input");
  const inputId = id || autoId;
  const invalid = Boolean(error);
  return (
    <div className="vn-field">
      {label && (
        <label className="vn-label" htmlFor={inputId}>
          {label}{required && <span className="vn-label__req">*</span>}
        </label>
      )}
      <div className="vn-input-wrap">
        {icon && <Icon name={icon} className="vn-input-wrap__icon" />}
        <input
          id={inputId}
          type={type}
          className={["vn-input", className].filter(Boolean).join(" ")}
          aria-invalid={invalid || undefined}
          aria-describedby={hint || error ? `${inputId}-desc` : undefined}
          required={required}
          {...rest}
        />
        {iconRight && <Icon name={iconRight} className="vn-input-wrap__icon vn-input-wrap__icon--right" />}
      </div>
      {error ? (
        <span id={`${inputId}-desc`} className="vn-error-text"><Icon name="alert-circle" size={13} />{error}</span>
      ) : hint ? (
        <span id={`${inputId}-desc`} className="vn-hint">{hint}</span>
      ) : null}
    </div>
  );
}
