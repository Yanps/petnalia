import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  /** @default 16 */
  height?: number | string;
  /** Border radius (ignored when `circle`). */
  radius?: number | string;
  /** Render a circle of diameter `height`. @default false */
  circle?: boolean;
}
/** Shimmering loading placeholder. Respects prefers-reduced-motion. */
export function Skeleton(props: SkeletonProps): JSX.Element;
