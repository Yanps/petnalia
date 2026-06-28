import React from "react";
import { IconName } from "./Icon";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color intent. @default "neutral" */
  variant?: "neutral" | "brand" | "accent" | "success" | "warning" | "error" | "info";
  /** Optional leading icon. */
  icon?: IconName;
  /** Fully rounded pill shape. @default false */
  pill?: boolean;
  /** Solid filled brand badge. @default false */
  solid?: boolean;
}

/**
 * Small status/metadata label. Use `accent` (green) for live availability
 * ("Online now"), `brand` for service tags ("Home visit"), `success/warning/error`
 * for state. Keep labels to 1–2 words.
 */
export function Badge(props: BadgeProps): JSX.Element;
