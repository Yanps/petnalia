import React from "react";

/** Skeleton — loading placeholder block with shimmer. */
export function Skeleton({ width, height = 16, radius, circle = false, className = "", style, ...rest }) {
  const s = {
    width: circle ? height : width,
    height,
    borderRadius: circle ? "9999px" : radius,
    ...style,
  };
  return <div className={["vn-skel", className].filter(Boolean).join(" ")} style={s} {...rest} />;
}
