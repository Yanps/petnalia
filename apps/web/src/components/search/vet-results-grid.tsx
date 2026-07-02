'use client';

import { useRouter } from 'next/navigation';
import { VetCard } from '@petnalia/ui';
import type { VetSearchResult } from '@petnalia/types';

interface VetResultsGridProps {
  readonly vets: readonly VetSearchResult[];
  readonly columns?: 2 | 3;
}

export function VetResultsGrid({ vets, columns = 3 }: VetResultsGridProps) {
  const router = useRouter();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 20,
    }}>
      {vets.map((vet) => (
        <div
          key={vet.id}
          style={{ cursor: 'pointer' }}
          onClick={() => router.push(`/vet/${vet.slug}`)}
        >
          <VetCard
            name={vet.fullName}
            {...(vet.specialties[0] && { specialty: vet.specialties[0].name })}
            {...(vet.avatarUrl && { photo: vet.avatarUrl })}
            rating={vet.averageRating}
            reviews={vet.totalReviews}
            distance={vet.distanceKm}
            homeVisit
            verified={vet.verificationStatus === 'verified'}
            onSchedule={(e) => {
              e.stopPropagation();
              router.push(`/vet/${vet.slug}`);
            }}
          />
        </div>
      ))}
    </div>
  );
}
