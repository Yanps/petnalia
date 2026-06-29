'use client';

import { useQuery } from '@tanstack/react-query';
import type { VetSearchQuery, VetSearchResponse } from '@petnalia/types';

import { api } from '@/lib/api-client';

type SearchParams = Partial<VetSearchQuery>;

export function useVetSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['vet-search', params],
    queryFn: () => {
      const qs = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) qs.set(key, String(value));
      }
      return api.get<VetSearchResponse>(`/v1/veterinarians/search?${qs.toString()}`);
    },
    enabled: params.lat !== undefined && params.lng !== undefined,
    staleTime: 30_000,
  });
}
