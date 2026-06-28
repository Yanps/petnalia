import React from "react";

export interface PriceTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Numeric amount (formatted pt-BR) or preformatted string. */
  amount: number | string;
  /** Currency symbol. @default "R$" */
  currency?: string;
  /** Prefix with "A partir de". @default false */
  from?: boolean;
  /** Unit suffix, e.g. "consulta". */
  unit?: string;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Original price shown struck-through (promo). */
  strike?: number | string;
}
/** Formatted price label (pt-BR), with optional "from", unit, and strike. */
export function PriceTag(props: PriceTagProps): JSX.Element;
