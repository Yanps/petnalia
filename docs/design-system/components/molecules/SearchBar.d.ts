import React from "react";

export interface SearchBarProps extends React.HTMLAttributes<HTMLDivElement> {
  onSearch?: () => void;
  /** Pet type options. */
  petTypes?: string[];
  /** Specialty options. */
  specialties?: string[];
}
/**
 * Marketplace search molecule — Address Input + Pet Type Select +
 * Specialty Select + Search Button. Composes Input/Select atoms + Button.
 *
 * @startingPoint section="Molecules" subtitle="Marketplace search bar" viewport="900x120"
 */
export function SearchBar(props: SearchBarProps): JSX.Element;
