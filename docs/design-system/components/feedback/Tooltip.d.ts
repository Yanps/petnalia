import React from "react";

export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Tooltip text shown above the trigger on hover/focus. */
  label: React.ReactNode;
  /** Single interactive trigger element. */
  children: React.ReactNode;
}
/** CSS hover/focus tooltip (maps to shadcn/ui Tooltip). Top-positioned. */
export function Tooltip(props: TooltipProps): JSX.Element;
