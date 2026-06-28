import React from "react";
import { IconName } from "../core/Icon";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Leading icon glyph. */
  icon?: IconName;
  /** Selected (pressed) state. @default false */
  selected?: boolean;
  /** Render a dismiss "×"; called when clicked. */
  onRemove?: (e: React.MouseEvent) => void;
}
/**
 * Selectable pill — Pet Type Chip ("Cão", "Gato") and Filter Chip
 * ("Emergência", "Visita em casa"). Toggle role via aria-pressed.
 */
export function Chip(props: ChipProps): JSX.Element;
