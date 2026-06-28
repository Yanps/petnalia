import React from "react";

export interface CalendarDayInfo {
  dow: string;
  day: number;
  today?: boolean;
  disabled?: boolean;
  available?: boolean;
}
export type SlotInfo = string | { time: string; occupied?: boolean };

export interface AvailabilityCalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  days?: CalendarDayInfo[];
  selectedDay?: number;
  onSelectDay?: (day: number) => void;
  /** Slots grouped by period: { morning: [...], afternoon: [...], evening: [...] }. */
  slots?: { morning?: SlotInfo[]; afternoon?: SlotInfo[]; evening?: SlotInfo[] };
  selectedSlot?: string;
  onSelectSlot?: (time: string) => void;
  loading?: boolean;
}
/**
 * Vet availability calendar — day strip (CalendarDay) + period-grouped
 * AvailabilitySlots, with loading and empty states.
 */
export function AvailabilityCalendar(props: AvailabilityCalendarProps): JSX.Element;
