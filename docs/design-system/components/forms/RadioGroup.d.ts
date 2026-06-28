import React from "react";

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}
export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Shared input name. */
  name: string;
  options: (string | RadioOption)[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Lay options horizontally. @default false */
  row?: boolean;
  /** Accessible group label. */
  legend?: string;
}
/** Single-choice radio group (maps to shadcn/ui RadioGroup on Radix). */
export function RadioGroup(props: RadioGroupProps): JSX.Element;
