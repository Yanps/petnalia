import React from "react";

export interface CalendarDayProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Weekday abbreviation, e.g. "QUA". */
  dow?: string;
  /** Day number. */
  day: number | string;
  selected?: boolean;
  today?: boolean;
  disabled?: boolean;
  /** Show the green availability dot. */
  available?: boolean;
}
/** Selectable day cell for the vet availability calendar. */
export function CalendarDay(props: CalendarDayProps): JSX.Element;
