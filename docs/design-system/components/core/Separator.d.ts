import React from "react";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical";
}
/** Thin 1px divider line. */
export function Separator(props: SeparatorProps): JSX.Element;
