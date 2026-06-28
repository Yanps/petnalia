import React from "react";

export interface RatingProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Average rating, 0–5. */
  value?: number;
  /** Number of reviews to show in parentheses. */
  count?: number;
  /** Show the numeric value before the star. @default true */
  showValue?: boolean;
  /** Star size in px. @default 16 */
  size?: number;
}

/** Compact star rating: numeric average + filled star + review count. */
export function Rating(props: RatingProps): JSX.Element;
