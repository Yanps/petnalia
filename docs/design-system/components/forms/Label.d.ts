import React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Append a required asterisk. */
  required?: boolean;
}
/** Form field label (maps to shadcn/ui Label, built on Radix Label). */
export function Label(props: LabelProps): JSX.Element;
