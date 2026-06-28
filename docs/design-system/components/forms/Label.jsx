import React from "react";

/** Label — accessible field label (maps to shadcn/ui Label / Radix Label). */
export function Label({ children, htmlFor, required = false, className = "", ...rest }) {
  return (
    <label htmlFor={htmlFor} className={["vn-label", className].filter(Boolean).join(" ")} {...rest}>
      {children}
      {required && <span className="vn-label__req">*</span>}
    </label>
  );
}
