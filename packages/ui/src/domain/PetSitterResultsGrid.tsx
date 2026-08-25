import React from 'react';
import { PetSitterCard, type PetSitterServiceTag } from './PetSitterCard';

export interface PetSitterResultItem {
  readonly id: string;
  readonly fullName: string;
  readonly avatarUrl?: string | null;
  readonly bio?: string | null;
  readonly services: readonly PetSitterServiceTag[];
  readonly distanceKm?: number;
  readonly baseCity?: string;
  readonly averageRating?: number;
  readonly totalReviews?: number;
}

export interface PetSitterResultsGridProps {
  readonly sitters: readonly PetSitterResultItem[];
  readonly columns?: 2 | 3;
  readonly onViewMore?: React.MouseEventHandler<HTMLButtonElement>;
}

export function PetSitterResultsGrid({ sitters, columns = 3, onViewMore }: PetSitterResultsGridProps): React.JSX.Element {
  return (
    <div
      className={columns === 3 ? 'pn-grid-3' : 'pn-grid-2'}
      style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 20 }}
    >
      {sitters.map((s) => (
        <PetSitterCard
          key={s.id}
          name={s.fullName}
          {...(s.avatarUrl && { photo: s.avatarUrl })}
          {...(s.bio && { bio: s.bio })}
          services={s.services}
          {...(typeof s.distanceKm === 'number' && { distance: s.distanceKm })}
          {...(s.baseCity && { city: s.baseCity })}
          {...(typeof s.averageRating === 'number' && typeof s.totalReviews === 'number' && s.totalReviews > 0
            && { rating: s.averageRating, reviews: s.totalReviews })}
          {...(onViewMore && { onViewMore })}
        />
      ))}
    </div>
  );
}
