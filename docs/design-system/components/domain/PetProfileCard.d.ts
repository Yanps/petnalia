import React from "react";

export interface PetProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  /** @default "Dog" */
  species?: string;
  breed?: string;
  /** Age label, e.g. "3 years". */
  ageLabel?: string;
  /** Weight label, e.g. "6.2 kg". */
  weight?: string;
  /** Sex label, e.g. "Female". */
  sex?: string;
  photo?: string;
  neutered?: boolean;
  microchip?: boolean;
}

/** Pet identity card with photo, vitals grid, and health flags. */
export function PetProfileCard(props: PetProfileCardProps): JSX.Element;
