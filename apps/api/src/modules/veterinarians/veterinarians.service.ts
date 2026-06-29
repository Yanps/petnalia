import { Injectable } from '@nestjs/common';
import type { VetSearchQuery, VetSearchResponse, VetSearchResult } from '@petnalia/types';

import { VeterinariansRepository } from './veterinarians.repository';

function toSlug(fullName: string, id: string): string {
  const base = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${base}-${id.substring(0, 8)}`;
}

@Injectable()
export class VeterinariansService {
  constructor(private readonly vetsRepository: VeterinariansRepository) {}

  async search(params: VetSearchQuery): Promise<VetSearchResponse> {
    const { rows, totalCount } = await this.vetsRepository.search(params);

    const data: VetSearchResult[] = rows.map((row) => ({
      id: row.vet_id,
      slug: toSlug(row.full_name, row.vet_id),
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      specialties: row.specialties ?? [],
      averageRating: row.average_rating,
      totalReviews: row.total_reviews,
      distanceKm: row.distance_km,
      baseCity: row.base_city,
      baseState: row.base_state,
      serviceRadiusKm: row.service_radius_km,
      verificationStatus: row.verification_status as VetSearchResult['verificationStatus'],
      tier: row.tier as VetSearchResult['tier'],
    }));

    return {
      data,
      total: totalCount,
      page: params.page,
      limit: params.limit,
      hasMore: params.page * params.limit < totalCount,
    };
  }
}
