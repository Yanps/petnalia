import React from "react";

export type IconName =
  | "map-pin" | "paw-print" | "home" | "calendar" | "clock" | "shield-check"
  | "stethoscope" | "heart-handshake" | "check" | "chevron-down" | "chevron-right"
  | "chevron-left" | "x" | "search" | "star" | "info" | "alert-triangle"
  | "alert-circle" | "check-circle" | "video" | "phone" | "message-circle"
  | "user" | "settings" | "bell" | "menu" | "filter" | "sliders" | "plus"
  | "arrow-right" | "more-horizontal" | "syringe" | "pill" | "file-text";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Icon glyph name from the curated Lucide set. */
  name: IconName;
  /** Alias for `name` (use when a host strips the reserved `name` attribute). */
  glyph?: IconName;
  /** Pixel size (width & height). @default 20 */
  size?: number;
  /** Stroke weight. @default 2 */
  strokeWidth?: number;
}

/** Curated Lucide icon. Inherits `currentColor`. */
export function Icon(props: IconProps): JSX.Element | null;

export const ICON_NAMES: IconName[];
