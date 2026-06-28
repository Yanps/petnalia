import React from "react";
import { IconName } from "../core/Icon";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Illustration glyph. @default "search" */
  icon?: IconName;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Primary action label; renders a Button when set. */
  action?: React.ReactNode;
  actionIcon?: IconName;
  onAction?: () => void;
  /** Tighter padding for inline/empty lists. @default false */
  compact?: boolean;
}
/** Empty / zero-result state with icon, copy, and optional CTA. */
export function EmptyState(props: EmptyStateProps): JSX.Element;
