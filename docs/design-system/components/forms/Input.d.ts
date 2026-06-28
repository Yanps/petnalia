import React from "react";
import { IconName } from "../core/Icon";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Field label rendered above the input. */
  label?: string;
  /** Helper text below the field. */
  hint?: string;
  /** Error message — sets aria-invalid and red styling. */
  error?: string;
  /** Leading icon glyph. */
  icon?: IconName;
  /** Trailing icon glyph. */
  iconRight?: IconName;
  /** Marks the field required (adds asterisk). */
  required?: boolean;
}

/**
 * Text input with label, hint/error, and icon affordances. Wraps the native
 * input (maps to shadcn/ui Input) with accessible label + describedby wiring.
 */
export function Input(props: InputProps): JSX.Element;
