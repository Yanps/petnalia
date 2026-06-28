import React from "react";
import { VetCardProps } from "../domain/VetCard";

export interface ResultsGridProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  /** Vet records (each spread into a VetCard; needs an `id`). */
  vets?: (VetCardProps & { id: string; next?: string })[];
  /** Show skeleton placeholders. @default false */
  loading?: boolean;
  /** Column count (desktop). @default 2 */
  columns?: number;
  /** Skeleton card count while loading. @default 4 */
  skeletonCount?: number;
  onVet?: (id: string) => void;
  onClear?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

/**
 * Responsive grid of VetCards with built-in loading / empty / loaded states.
 *
 * @startingPoint section="Organisms" subtitle="Vet results grid (loading/empty/loaded)" viewport="900x520"
 */
export function ResultsGrid(props: ResultsGridProps): JSX.Element;
