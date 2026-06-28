import React from "react";

export interface TimelineEntry {
  id?: string;
  /** Event type → icon + tint. @default "visit" */
  kind?: "visit" | "online" | "vaccine" | "prescription" | "exam";
  title: string;
  date: string;
  vet?: string;
  description?: React.ReactNode;
  /** Optional badge label. */
  tag?: string;
  tagVariant?: "neutral" | "brand" | "accent" | "success" | "warning" | "error" | "info";
}
export interface AppointmentTimelineProps extends React.HTMLAttributes<HTMLUListElement> {
  items?: TimelineEntry[];
  loading?: boolean;
}
/**
 * Vertical medical-record / appointment history timeline.
 * Composes Icon + Badge with loading and empty states.
 */
export function AppointmentTimeline(props: AppointmentTimelineProps): JSX.Element;
