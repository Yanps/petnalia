import React from "react";
import { IconName } from "./Icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "primary" */
  variant?: "primary" | "accent" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  /** Control height. @default "md" (44px AA touch target) */
  size?: "sm" | "md" | "lg";
  /** Stretch to full container width. @default false */
  block?: boolean;
  /** Leading icon glyph. */
  iconLeft?: IconName;
  /** Trailing icon glyph. */
  iconRight?: IconName;
}

/**
 * Primary action button. Use one primary button per view; pair with
 * `secondary`/`ghost` for lower-emphasis actions. `accent` (green) is
 * reserved for availability / confirmation CTAs like "Schedule".
 *
 * @startingPoint section="Core" subtitle="Buttons — all variants & sizes" viewport="700x220"
 */
export function Button(props: ButtonProps): JSX.Element;
