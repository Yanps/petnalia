import React from "react";

export interface SavedAddress {
  id: string;
  label?: string;
  address: React.ReactNode;
  distanceKm?: number;
}
export interface AddressSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  addresses?: SavedAddress[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onAdd?: () => void;
  onSearch?: () => void;
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
/** Search + select among saved addresses; composes Input + AddressPreview. */
export function AddressSelector(props: AddressSelectorProps): JSX.Element;
