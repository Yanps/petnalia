import React from "react";
import { Icon } from "../core/Icon.jsx";

let _sid = 0;
const useId = (p) => React.useMemo(() => `${p}-${++_sid}`, [p]);

/** Select — native select styled to match Input, with label/hint/error. */
export function Select({
  label, hint, error, required = false, placeholder,
  options = [], children, id, className = "", ...rest
}) {
  const autoId = useId("vn-select");
  const selId = id || autoId;
  const invalid = Boolean(error);
  return (
    <div className="vn-field">
      {label && (
        <label className="vn-label" htmlFor={selId}>
          {label}{required && <span className="vn-label__req">*</span>}
        </label>
      )}
      <div className="vn-select-wrap">
        <select
          id={selId}
          className={["vn-input", "vn-select", className].filter(Boolean).join(" ")}
          aria-invalid={invalid || undefined}
          required={required}
          defaultValue={placeholder ? "" : undefined}
          {...rest}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => {
            const opt = typeof o === "string" ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
          {children}
        </select>
        <Icon name="chevron-down" className="vn-select-wrap__chev" />
      </div>
      {error ? (
        <span className="vn-error-text"><Icon name="alert-circle" size={13} />{error}</span>
      ) : hint ? (
        <span className="vn-hint">{hint}</span>
      ) : null}
    </div>
  );
}
