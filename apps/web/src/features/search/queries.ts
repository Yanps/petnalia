import { queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { SearchParams } from './schema';

// TODO: import response type from @petnalia/types when search contract is defined
export interface VetSearchResult {
  readonly id: string;
  readonly name: string;
  readonly specialty: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly distanceKm: number;
  readonly homeVisit: boolean;
  readonly online: boolean;
  readonly nextAvailable: string | null;
}

export interface SearchResponse {
  readonly data: readonly VetSearchResult[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export const searchKeys = {
  all: ['vets'] as const,
  search: (params: SearchParams) => ['vets', 'search', params] as const,
};

export function searchVetsOptions(params: SearchParams) {
  return queryOptions({
    queryKey: searchKeys.search(params),
    queryFn: () =>
      api.get<SearchResponse>('/v1/veterinarians/search', {
        next: { revalidate: 60 },
      }),
    staleTime: 60 * 1_000,
  });
}
