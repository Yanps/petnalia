import React from "react";

export interface AddressPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Eyebrow label. @default "Endereço da visita" */
  label?: string;
  /** Formatted address line. */
  address: React.ReactNode;
  /** Distance in km from the vet/user. */
  distanceKm?: number;
  /** Static-map image URL. Omit for the styled placeholder. */
  mapSrc?: string;
  /** Inline action label, e.g. "Alterar". */
  action?: React.ReactNode;
  onAction?: () => void;
}
/** Map thumbnail + formatted address + distance (composes DistanceIndicator). */
export function AddressPreview(props: AddressPreviewProps): JSX.Element;
