'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PetSitterSearchResult, VetSearchResult } from '@petnalia/types';
import { Icon, PetSitterCard, VetCard } from '@petnalia/ui';

interface FeaturedProsCarouselProps {
  readonly vets: readonly VetSearchResult[];
  readonly sitters: readonly PetSitterSearchResult[];
}

export function FeaturedProsCarousel({ vets, sitters }: FeaturedProsCarouselProps) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [vets.length, sitters.length]);

  function scrollByCard(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-carousel-item]');
    const step = card ? card.offsetWidth + 20 : el.clientWidth;
    el.scrollBy({ left: step * direction, behavior: 'smooth' });
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={trackRef}
        className="pn-carousel-track"
        role="region"
        aria-label="Profissionais em destaque"
        tabIndex={0}
        style={{ display: 'flex', gap: 20, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 4 }}
      >
        {vets.map((vet) => (
          <div key={vet.id} data-carousel-item className="pn-carousel-item" style={{ scrollSnapAlign: 'start' }}>
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
              onClick={() => router.push(`/vet/${vet.slug}`)}
            />
          </div>
        ))}

        {sitters.map((sitter) => (
          <div key={sitter.id} data-carousel-item className="pn-carousel-item" style={{ scrollSnapAlign: 'start' }}>
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
              onClick={() => router.push(`/pet-sitter/${sitter.slug}`)}
            />
          </div>
        ))}
      </div>

      {canScrollPrev && (
        <button
          type="button"
          aria-label="Ver anteriores"
          onClick={() => scrollByCard(-1)}
          className="pn-carousel-arrow pn-carousel-arrow--prev"
        >
          <Icon name="chevron-left" size={18} />
        </button>
      )}
      {canScrollNext && (
        <button
          type="button"
          aria-label="Ver próximos"
          onClick={() => scrollByCard(1)}
          className="pn-carousel-arrow pn-carousel-arrow--next"
        >
          <Icon name="chevron-right" size={18} />
        </button>
      )}
    </div>
  );
}
