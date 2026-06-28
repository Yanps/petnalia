import React from "react";
import { IconName } from "../core/Icon";

export interface ChipOption {
  value: string;
  label: React.ReactNode;
  icon?: IconName;
}
export interface FilterChipGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  label?: string;
  options: (string | ChipOption)[];
  /** Controlled selected values. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** Allow multiple selection. @default true */
  multiple?: boolean;
}
/** Labelled row of selectable Chips (pet types, quick filters). */
export function FilterChipGroup(props: FilterChipGroupProps): JSX.Element;
