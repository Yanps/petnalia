import React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Disabled placeholder option shown first. */
  placeholder?: string;
  /** Options as strings or {value,label}. */
  options?: (string | SelectOption)[];
}

/**
 * Styled native select with label/hint/error and chevron affordance
 * (maps to shadcn/ui Select for simple cases).
 */
export function Select(props: SelectProps): JSX.Element;
