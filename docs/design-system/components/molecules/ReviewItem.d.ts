import React from "react";

export interface ReviewItemProps extends React.HTMLAttributes<HTMLDivElement> {
  author: string;
  /** Secondary line, e.g. "tutora da Mel". */
  meta?: string;
  rating?: number;
  text?: React.ReactNode;
  date?: string;
  avatar?: string;
  /** Bottom hairline divider. @default true */
  divider?: boolean;
}
/** A single review row: avatar, name, star rating, text, date. */
export function ReviewItem(props: ReviewItemProps): JSX.Element;
