'use client';

import { useState } from 'react';
import type { PetSitterSearchResult } from '@petnalia/types';
import { PetSitterCard } from '@petnalia/ui';
import type { Session } from '@/lib/auth';

import { PetSitterBookingModal } from './pet-sitter-booking-modal';

interface PetSitterSearchResultsProps {
  readonly sitters: readonly PetSitterSearchResult[];
  readonly columns?: 2 | 3;
  readonly session: Session | null;
  readonly token: string | null;
}

export function PetSitterSearchResults({ sitters, columns = 3, session, token }: PetSitterSearchResultsProps) {
  const [bookingSitter, setBookingSitter] = useState<PetSitterSearchResult | null>(null);

  return (
    <>
      <div
        className={columns === 3 ? 'pn-grid-3' : 'pn-grid-2'}
        style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 20 }}
      >
        {sitters.map((sitter) => (
          <PetSitterCard
            key={sitter.id}
            name={sitter.fullName}
            {...(sitter.avatarUrl && { photo: sitter.avatarUrl })}
            {...(sitter.bio && { bio: sitter.bio })}
            services={sitter.services}
            distance={sitter.distanceKm}
            city={sitter.baseCity}
            {...(sitter.totalReviews > 0 && { rating: sitter.averageRating, reviews: sitter.totalReviews })}
            onViewMore={() => setBookingSitter(sitter)}
            viewMoreLabel="Reservar"
          />
        ))}
      </div>

      {bookingSitter && (
        <PetSitterBookingModal
          sitterId={bookingSitter.id}
          sitterName={bookingSitter.fullName}
          services={bookingSitter.services}
          session={session}
          token={token}
          onClose={() => setBookingSitter(null)}
        />
      )}
    </>
  );
}
