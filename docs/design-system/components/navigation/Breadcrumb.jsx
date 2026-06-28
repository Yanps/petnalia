import React from "react";
import { Icon } from "../core/Icon.jsx";

/** Breadcrumb — hierarchical navigation trail. */
export function Breadcrumb({ items = [], className = "", ...rest }) {
  return (
    <nav aria-label="Breadcrumb" className={["vn-crumb", className].filter(Boolean).join(" ")} {...rest}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {last ? (
              <span className="vn-crumb__current" aria-current="page">{item.label}</span>
            ) : (
              <a href={item.href || "#"}>{item.label}</a>
            )}
            {!last && <Icon name="chevron-right" size={16} className="vn-crumb__sep" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
