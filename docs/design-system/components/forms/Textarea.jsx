import React from "react";
import { Icon } from "../core/Icon.jsx";

let _tid = 0;
const useId = (p) => React.useMemo(() => `${p}-${++_tid}`, [p]);

/** Textarea — multi-line text field with label/hint/error. */
export function Textarea({ label, hint, error, required = false, id, rows = 4, className = "", ...rest }) {
  const autoId = useId("vn-textarea");
  const taId = id || autoId;
  const invalid = Boolean(error);
  return (
    <div className="vn-field">
      {label && (
        <label className="vn-label" htmlFor={taId}>
          {label}{required && <span className="vn-label__req">*</span>}
        </label>
      )}
      <textarea
        id={taId}
        rows={rows}
        className={["vn-input", className].filter(Boolean).join(" ")}
        aria-invalid={invalid || undefined}
        required={required}
        {...rest}
      />
      {error ? (
        <span className="vn-error-text"><Icon name="alert-circle" size={13} />{error}</span>
      ) : hint ? (
        <span className="vn-hint">{hint}</span>
      ) : null}
    </div>
  );
}
