import React from "react";

export interface VetHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  /** Alias for `name` (use when a host strips the reserved `name` attribute). */
  vetName?: string;
  specialty: string;
  photo?: string;
  /** CRMV registration label. */
  crm?: string;
  rating?: number;
  reviews?: number;
  distance?: number;
  homeVisit?: boolean;
  online?: boolean;
  verified?: boolean;
  /** Presence. @default "online" */
  status?: "online" | "busy" | "offline";
  onBook?: () => void;
  onMessage?: () => void;
}
/** Veterinarian profile header — identity, trust signals, and primary CTAs. */
export function VetHero(props: VetHeroProps): JSX.Element;
