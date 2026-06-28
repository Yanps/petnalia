import React from "react";

export interface AppointmentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  vetName: string;
  vetPhoto?: string;
  /** Pet the visit is for. */
  petName?: string;
  /** Visit modality. @default "home" */
  type?: "home" | "online";
  /** @default "upcoming" */
  status?: "upcoming" | "confirmed" | "pending" | "completed" | "cancelled";
  date: string;
  time: string;
  /** Visit address (home visits only). */
  address?: string;
  onPrimary?: () => void;
  /** @default "View details" */
  primaryLabel?: string;
}

/**
 * Summary card for a scheduled appointment — modality icon, status badge,
 * date/time/address, and a detail action. Used in dashboard + history lists.
 */
export function AppointmentCard(props: AppointmentCardProps): JSX.Element;
