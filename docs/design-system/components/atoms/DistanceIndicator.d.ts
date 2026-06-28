import React from "react";

export interface DistanceIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Distance in km (number) or preformatted string. */
  km: number | string;
  /** Trailing context label. @default "de você" — pass "" to hide. */
  label?: string;
  /** @default "sm" */
  size?: "sm" | "md";
}
/** Map-pin + distance from the user's address. */
export function DistanceIndicator(props: DistanceIndicatorProps): JSX.Element;
