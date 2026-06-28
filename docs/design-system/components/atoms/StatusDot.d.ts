import React from "react";

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default "online" */
  status?: "online" | "busy" | "offline" | "emergency";
  /** Label text, or `true` for the default label for the status, or omit for dot-only. */
  label?: React.ReactNode | true;
  /** Animated ping ring. @default false */
  pulse?: boolean;
  /** Dot diameter in px. @default 8 */
  size?: number;
}
/** Presence / availability indicator dot, with optional label and pulse. */
export function StatusDot(props: StatusDotProps): JSX.Element;
