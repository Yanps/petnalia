import React from "react";
import { IconName } from "../core/Icon";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "info" */
  variant?: "info" | "success" | "warning" | "error";
  /** Bold title line. */
  title?: React.ReactNode;
  /** Override the default variant icon. */
  icon?: IconName;
}
/** Inline contextual banner (maps to shadcn/ui Alert). Body via children. */
export function Alert(props: AlertProps): JSX.Element;
