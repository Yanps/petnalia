'use client';

import { useRouter } from 'next/navigation';
import { VetCard } from '@petnalia/ui';
import type { MockVet } from '@/data/mock-vets';

interface VetResultsGridProps {
  readonly vets: readonly MockVet[];
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
            name={vet.name}
            specialty={vet.specialty}
            photo={vet.photo}
            rating={vet.rating}
            reviews={vet.reviews}
            distance={vet.distance}
            homeVisit={vet.homeVisit}
            online={vet.online}
            nextAvailable={vet.nextAvailable}
            price={vet.price}
            verified={vet.verified}
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
