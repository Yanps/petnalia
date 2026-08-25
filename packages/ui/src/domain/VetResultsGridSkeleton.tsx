import React from 'react';
import { VetCardSkeleton } from './VetCardSkeleton';

export interface VetResultsGridSkeletonProps {
  readonly count?: number;
  readonly columns?: 2 | 3;
}

export function VetResultsGridSkeleton({ count = 6, columns = 3 }: VetResultsGridSkeletonProps): React.JSX.Element {
  return (
    <div
      role="status"
      aria-label={`Carregando ${count} veterinários...`}
      style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 20 }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <VetCardSkeleton key={i} />
      ))}
    </div>
  );
}
