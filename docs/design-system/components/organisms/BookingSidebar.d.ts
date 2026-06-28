import React from "react";

export interface BookingSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  price: number | string;
  /** Prefix price with "A partir de". @default true */
  from?: boolean;
  /** Next-slot highlight, e.g. "Hoje 16:30". */
  nextAvailable?: string;
  /** Selected modality — renders a RadioGroup when provided. */
  modality?: "home" | "online";
  onModalityChange?: (value: string) => void;
  /** Chosen date label (shows confirmation chips when both set). */
  selectedDate?: string;
  selectedTime?: string;
  onBook?: () => void;
  onMessage?: () => void;
}
/** Sticky booking summary + CTA rail for the vet profile / booking page. */
export function BookingSidebar(props: BookingSidebarProps): JSX.Element;
