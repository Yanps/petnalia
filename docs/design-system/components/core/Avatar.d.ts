import React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Image URL. Falls back to initials when absent. */
  src?: string;
  /** Full name — used for alt text and initials. */
  name?: string;
  /** Alias for `name` (use when a host strips the reserved `name` attribute). */
  fullName?: string;
  /** @default "md" */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Presence indicator. */
  status?: "online" | "busy" | "offline";
}

/** Circular avatar with initials fallback and optional presence dot. */
export function Avatar(props: AvatarProps): JSX.Element;
