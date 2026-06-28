import React from "react";

export interface AvailabilitySlotProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Slot time label, e.g. "16:30". */
  time: string;
  /** @default "available" */
  state?: "available" | "occupied" | "selected";
  onSelect?: () => void;
}
/** A bookable time slot — available / occupied (disabled) / selected. */
export function AvailabilitySlot(props: AvailabilitySlotProps): JSX.Element;
