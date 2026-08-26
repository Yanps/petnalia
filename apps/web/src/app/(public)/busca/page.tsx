import { Suspense } from 'react';
import type { Metadata } from 'next';
import type { PetSitterSearchResult, Specialty, VetSearchResult } from '@petnalia/types';
import { Icon } from '@petnalia/ui';

import { api } from '@/lib/api-client';
import { VetResultsGrid } from '@/components/search/vet-results-grid';
import { PetSitterSearchResults } from '@/components/search/pet-sitter-search-results';
import { SearchFilters } from '@/components/search/search-filters';
import { SearchFiltersSkeleton } from '@/components/search/search-filters-skeleton';
import { MainSearchBar } from '@/components/search/main-search-bar';

export const metadata: Metadata = { title: 'Buscar veterinários e pet sitters' };

// São Paulo city centre — default when the browser hasn't shared location yet
const DEFAULT_LAT = -23.5505;
const DEFAULT_LNG = -46.6333;

type SearchType = 'veterinario' | 'pet-sitter';

interface SearchPageProps {
  readonly searchParams: Promise<{
    tipo?: string;
    lat?: string;
    lng?: string;
    raio?: string;
    especialidade?: string | string[];
    local?: string;
    q?: string;
  }>;
}

interface VetSearchResponse {
  data: VetSearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface PetSitterSearchResponse {
  data: PetSitterSearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

async function fetchVets(params: URLSearchParams): Promise<VetSearchResponse> {
  try {
    return await api.get<VetSearchResponse>(`/v1/veterinarians/search?${params.toString()}`, {
      cache: 'no-store',
    });
  } catch {
    return { data: [], total: 0, page: 1, limit: 12, hasMore: false };
  }
}

async function fetchPetSitters(params: URLSearchParams): Promise<PetSitterSearchResponse> {
  try {
    return await api.get<PetSitterSearchResponse>(`/v1/pet-sitters/search?${params.toString()}`, {
      cache: 'no-store',
    });
  } catch {
    return { data: [], total: 0, page: 1, limit: 12, hasMore: false };
  }
}

async function fetchSpecialties(): Promise<Specialty[]> {
  try {
    return await api.get<Specialty[]>('/v1/veterinarians/specialties', { cache: 'force-cache' });
  } catch {
    return [];
  }
}

export default async function BuscaPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const tipo: SearchType = sp.tipo === 'pet-sitter' ? 'pet-sitter' : 'veterinario';

  const lat = sp.lat ? parseFloat(sp.lat) : DEFAULT_LAT;
  const lng = sp.lng ? parseFloat(sp.lng) : DEFAULT_LNG;
  const radiusKm = sp.raio ? parseInt(sp.raio, 10) : 20;
  const specialtyIds = sp.especialidade
    ? (Array.isArray(sp.especialidade) ? sp.especialidade : [sp.especialidade])
    : [];
  const usingDefault = !sp.lat && !sp.lng;

  const specialties = await fetchSpecialties();
  const initialSpecialty = specialtyIds[0]
    ? specialties.find((s) => s.id === specialtyIds[0])
    : undefined;

  const searchBar = (
    <MainSearchBar
      specialties={specialties}
      initialTipo={tipo}
      {...(initialSpecialty && {
        initialEspecialidadeId: initialSpecialty.id,
        initialEspecialidadeName: initialSpecialty.name,
      })}
      {...(sp.local && { initialLocal: sp.local })}
    />
  );

  const locationNotice = usingDefault ? (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '10px 16px',
      marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center',
    }}>
      <Icon name="map-pin" size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} />
      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Exibindo resultados próximos a São Paulo. Compartilhe sua localização para resultados mais precisos.
      </span>
    </div>
  ) : null;

  if (tipo === 'pet-sitter') {
    const qs = new URLSearchParams({
      lat: String(lat), lng: String(lng), radiusKm: String(radiusKm), limit: '12', page: '1',
    });
    if (sp.q) qs.set('q', sp.q);

    const { data: sitters, total } = await fetchPetSitters(qs);

    return (
      <main style={{ flex: 1 }}>
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '20px 24px' }}>
          <div style={{ maxWidth: 1152, margin: '0 auto' }}>{searchBar}</div>
        </div>

        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '32px 24px' }}>
          {locationNotice}

          <div style={{ marginBottom: 20 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '1.25rem', color: 'var(--text)', letterSpacing: '-0.01em',
            }}>
              Pet sitters próximos
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {total} pet sitter{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
            </p>
          </div>

          {sitters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <Icon name="search" size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                Nenhum pet sitter encontrado nessa região.
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 8 }}>
                Tente escolher outra localização.
              </p>
            </div>
          ) : (
            <PetSitterSearchResults sitters={sitters} columns={3} />
          )}
        </div>
      </main>
    );
  }

  const qs = new URLSearchParams({
    lat: String(lat), lng: String(lng), radiusKm: String(radiusKm), limit: '12', page: '1',
  });
  for (const id of specialtyIds) qs.append('specialtyIds', id);
  if (sp.q) qs.set('q', sp.q);

  const { data: vets, total } = await fetchVets(qs);

  return (
    <main style={{ flex: 1 }}>
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>{searchBar}</div>
      </div>

      <div className="pn-search-layout" style={{
        maxWidth: 1152, margin: '0 auto', padding: '32px 24px',
        display: 'flex', gap: 32, alignItems: 'flex-start',
      }}>
        <Suspense fallback={<SearchFiltersSkeleton />}>
          <SearchFilters
            specialties={specialties}
            currentRadius={radiusKm}
            currentSpecialtyIds={specialtyIds}
            lat={lat}
            lng={lng}
          />
        </Suspense>

        <div style={{ flex: 1, minWidth: 0 }}>
          {locationNotice}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '1.25rem', color: 'var(--text)', letterSpacing: '-0.01em',
              }}>
                Veterinários próximos
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {total} veterinário{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {vets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <Icon name="search" size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                Nenhum veterinário encontrado nessa região.
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 8 }}>
                Tente aumentar o raio de busca ou escolha outra localização.
              </p>
            </div>
          ) : (
            <VetResultsGrid vets={vets} columns={2} />
          )}
        </div>
      </div>
    </main>
  );
}
