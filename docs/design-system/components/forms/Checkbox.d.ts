import React from "react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Label text beside the box. */
  label?: React.ReactNode;
}
/** Labelled checkbox (maps to shadcn/ui Checkbox). */
export function Checkbox(props: CheckboxProps): JSX.Element;
