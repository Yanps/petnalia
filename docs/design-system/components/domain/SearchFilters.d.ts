import React from "react";

export interface SearchFiltersProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Specialty checkbox options. */
  specialties?: string[];
  /** Result count shown on the apply button. */
  resultCount?: number;
  onClear?: () => void;
}

/**
 * Search filter sidebar for vet results — visit type, specialty, availability,
 * distance, and rating. Composes Switch, Checkbox, Select, Separator, Button.
 * Presentational scaffold; wire controls to your own search state.
 */
export function SearchFilters(props: SearchFiltersProps): JSX.Element;
