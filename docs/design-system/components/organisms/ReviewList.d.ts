import React from "react";

export interface ReviewRecord {
  author: string;
  meta?: string;
  rating?: number;
  text?: React.ReactNode;
  date?: string;
  avatar?: string;
}
export interface ReviewListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Average rating 0–5. */
  average?: number;
  /** Total review count. */
  total?: number;
  /** Star distribution as 5 percentages [5★,4★,3★,2★,1★]. */
  distribution?: number[];
  reviews?: ReviewRecord[];
  loading?: boolean;
  /** Renders a "see all" button when provided. */
  onMore?: () => void;
}
/** Rating summary + distribution bars + list of ReviewItem molecules. */
export function ReviewList(props: ReviewListProps): JSX.Element;
