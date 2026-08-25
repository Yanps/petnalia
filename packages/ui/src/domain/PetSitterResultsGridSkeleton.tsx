import React from 'react';
import { PetSitterCardSkeleton } from './PetSitterCardSkeleton';

export interface PetSitterResultsGridSkeletonProps {
  readonly count?: number;
  readonly columns?: 2 | 3;
}

export function PetSitterResultsGridSkeleton({ count = 6, columns = 3 }: PetSitterResultsGridSkeletonProps): React.JSX.Element {
  return (
    <div
      role="status"
      aria-label={`Carregando ${count} pet sitters...`}
      className={columns === 3 ? 'pn-grid-3' : 'pn-grid-2'}
      style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 20 }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <PetSitterCardSkeleton key={i} />
      ))}
    </div>
  );
}
