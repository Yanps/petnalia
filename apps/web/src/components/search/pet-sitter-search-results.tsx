'use client';

import { useRouter } from 'next/navigation';
import type { PetSitterSearchResult } from '@petnalia/types';
import { PetSitterCard } from '@petnalia/ui';

interface PetSitterSearchResultsProps {
  readonly sitters: readonly PetSitterSearchResult[];
  readonly columns?: 2 | 3;
}

export function PetSitterSearchResults({ sitters, columns = 3 }: PetSitterSearchResultsProps) {
  const router = useRouter();

  return (
    <div
      className={columns === 3 ? 'pn-grid-3' : 'pn-grid-2'}
      style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 20 }}
    >
      {sitters.map((sitter) => (
        <div
          key={sitter.id}
          style={{ cursor: 'pointer' }}
          onClick={() => router.push(`/pet-sitter/${sitter.slug}`)}
        >
          <PetSitterCard
            name={sitter.fullName}
            {...(sitter.avatarUrl && { photo: sitter.avatarUrl })}
            {...(sitter.bio && { bio: sitter.bio })}
            services={sitter.services}
            distance={sitter.distanceKm}
            city={sitter.baseCity}
            {...(sitter.totalReviews > 0 && { rating: sitter.averageRating, reviews: sitter.totalReviews })}
            onViewMore={(e) => {
              e.stopPropagation();
              router.push(`/pet-sitter/${sitter.slug}`);
            }}
            viewMoreLabel="Ver perfil"
          />
        </div>
      ))}
    </div>
  );
}
