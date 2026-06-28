import React from "react";

export interface FilterDrawerProps extends React.HTMLAttributes<HTMLElement> {
  open?: boolean;
  onClose?: () => void;
  onApply?: () => void;
  /** Header title. @default "Filtros" */
  title?: string;
  /** Result count shown on the apply button. */
  resultCount?: number;
  /** Slide-in side. @default "left" */
  side?: "left" | "right";
  /** Filter content (e.g. <SearchFilters />). */
  children?: React.ReactNode;
}
/**
 * Off-canvas drawer hosting filters on mobile (maps to shadcn/ui Sheet on
 * Radix Dialog). Scrim + slide panel + apply/clear footer; honors the
 * z-index ladder and prefers-reduced-motion.
 */
export function FilterDrawer(props: FilterDrawerProps): JSX.Element;
