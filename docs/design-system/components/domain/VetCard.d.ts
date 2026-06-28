import React from "react";

export interface VetCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Veterinarian full name. */
  name: string;
  /** Specialty / focus line, e.g. "Feline medicine · Dermatology". */
  specialty: string;
  /** Photo URL (falls back to initials). */
  photo?: string;
  /** Average rating 0–5. */
  rating?: number;
  /** Review count. */
  reviews?: number;
  /** Distance in km from the user's address. */
  distance?: number;
  /** Shows the "Home visit" badge. */
  homeVisit?: boolean;
  /** Shows the "Online" badge. */
  online?: boolean;
  /** Next availability label, e.g. "Today 16:30". */
  nextAvailable?: string;
  /** Price line, e.g. "From R$ 180". */
  price?: string;
  /** Shows the verified shield. */
  verified?: boolean;
  onSchedule?: () => void;
}

/**
 * Flagship marketplace card for a veterinarian — photo, rating, service
 * badges, distance, next availability, and a Schedule CTA. Composes
 * Card, Avatar, Badge, Rating, Button.
 *
 * @startingPoint section="Domain" subtitle="Veterinarian search-result card" viewport="700x240"
 */
export function VetCard(props: VetCardProps): JSX.Element;
