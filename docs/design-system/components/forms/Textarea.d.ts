import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}
/** Multi-line text field with label/hint/error (maps to shadcn/ui Textarea). */
export function Textarea(props: TextareaProps): JSX.Element;
