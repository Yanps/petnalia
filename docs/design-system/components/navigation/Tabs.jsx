import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * Tabs — controlled or uncontrolled tab navigation.
 * Provide `items` [{value,label,icon?,count?}]; render panels yourself
 * based on the active value via `onChange`, or use `value`.
 */
export function Tabs({ items = [], value, defaultValue, onChange, variant = "underline", className = "", ...rest }) {
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.value);
  const active = value ?? internal;
  const select = (v) => { setInternal(v); onChange && onChange(v); };

  return (
    <div className={["vn-tabs", className].filter(Boolean).join(" ")} {...rest}>
      <div role="tablist" className={["vn-tabs__list", variant === "pill" && "vn-tabs__list--pill"].filter(Boolean).join(" ")}>
        {items.map((t) => (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={active === t.value}
            className="vn-tab"
            onClick={() => select(t.value)}
          >
            {t.icon && <Icon name={t.icon} size={16} />}
            {t.label}
            {typeof t.count === "number" && <span className="vn-tab__count">{t.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
