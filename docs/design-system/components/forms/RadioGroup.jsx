import React from "react";

/**
 * RadioGroup — single-choice control (maps to shadcn/ui RadioGroup / Radix).
 * Provide `options` [{value,label}] and a `name`.
 */
export function RadioGroup({ name, options = [], value, defaultValue, onChange, row = false, legend, className = "", ...rest }) {
  const [internal, setInternal] = React.useState(defaultValue);
  const active = value ?? internal;
  const pick = (v) => { setInternal(v); onChange && onChange(v); };
  return (
    <div role="radiogroup" aria-label={legend} className={["vn-radio-group", row && "vn-radio-group--row", className].filter(Boolean).join(" ")} {...rest}>
      {options.map((o) => {
        const opt = typeof o === "string" ? { value: o, label: o } : o;
        return (
          <label key={opt.value} className="vn-radio">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={active === opt.value}
              onChange={() => pick(opt.value)}
              disabled={opt.disabled}
            />
            <span className="vn-radio__dot" />
            <span>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
