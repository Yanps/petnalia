'use client';

import { create } from 'zustand';

type PetType = 'dog' | 'cat' | 'other';

interface SearchState {
  readonly query: string;
  readonly specialty: string | null;
  readonly radiusKm: number;
  readonly petType: PetType | null;
  setQuery: (query: string) => void;
  setSpecialty: (specialty: string | null) => void;
  setRadiusKm: (km: number) => void;
  setPetType: (type: PetType | null) => void;
  reset: () => void;
}

const INITIAL: Pick<SearchState, 'query' | 'specialty' | 'radiusKm' | 'petType'> = {
  query: '',
  specialty: null,
  radiusKm: 10,
  petType: null,
};

export const useSearchStore = create<SearchState>()((set) => ({
  ...INITIAL,
  setQuery: (query) => set({ query }),
  setSpecialty: (specialty) => set({ specialty }),
  setRadiusKm: (radiusKm) => set({ radiusKm }),
  setPetType: (petType) => set({ petType }),
  reset: () => set(INITIAL),
}));
