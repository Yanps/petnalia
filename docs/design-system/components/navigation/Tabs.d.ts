import React from "react";
import { IconName } from "../core/Icon";

export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: IconName;
  /** Optional count pill. */
  count?: number;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: TabItem[];
  /** Controlled active value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** @default "underline" */
  variant?: "underline" | "pill";
}

/**
 * Tab navigation (maps to shadcn/ui Tabs). Renders the tablist only —
 * render the active panel yourself from `value`/`onChange`.
 */
export function Tabs(props: TabsProps): JSX.Element;
