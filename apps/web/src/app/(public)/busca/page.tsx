import type { Metadata } from 'next';
import type { VetSearchResult } from '@petnalia/types';
import { Icon } from '@petnalia/ui';

import { api } from '@/lib/api-client';
import { VetResultsGrid } from '@/components/search/vet-results-grid';

export const metadata: Metadata = { title: 'Buscar veterinários' };

// São Paulo city centre — default when the browser hasn't shared location yet
const DEFAULT_LAT = -23.5505;
const DEFAULT_LNG = -46.6333;

interface SearchPageProps {
  readonly searchParams: Promise<{
    lat?: string;
    lng?: string;
    raio?: string;
    especialidade?: string;
  }>;
}

interface SearchResponse {
  data: VetSearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

const SPECIALTIES = [
  'Clínica geral',
  'Dermatologia',
  'Cardiologia',
  'Ortopedia',
  'Comportamento',
  'Animais exóticos',
  'Oncologia',
] as const;

async function fetchVets(params: URLSearchParams): Promise<SearchResponse> {
  try {
    return await api.get<SearchResponse>(`/v1/veterinarians/search?${params.toString()}`, {
      cache: 'no-store',
    });
  } catch {
    return { data: [], total: 0, page: 1, limit: 12, hasMore: false };
  }
}

export default async function BuscaPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;

  const lat = sp.lat ? parseFloat(sp.lat) : DEFAULT_LAT;
  const lng = sp.lng ? parseFloat(sp.lng) : DEFAULT_LNG;
  const radiusKm = sp.raio ? parseInt(sp.raio, 10) : 20;

  const qs = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radiusKm: String(radiusKm),
    limit: '12',
    page: '1',
  });
  if (sp.especialidade) qs.set('specialtyId', sp.especialidade);

  const { data: vets, total } = await fetchVets(qs);
  const usingDefault = !sp.lat && !sp.lng;

  return (
    <main style={{ flex: 1 }}>
      {/* Barra de busca */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '20px 24px',
      }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{
            display: 'flex', gap: 12, alignItems: 'center',
            background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)',
            padding: '10px 16px', border: '1px solid var(--border)',
            maxWidth: 560,
          }}>
            <Icon name="search" size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Busque por especialidade, pet ou localização..."
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: '0.9375rem', color: 'var(--text)',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: 1152, margin: '0 auto', padding: '32px 24px',
        display: 'flex', gap: 32, alignItems: 'flex-start',
      }}>
        {/* Filtros */}
        <aside style={{
          width: 240, flexShrink: 0,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px',
          position: 'sticky', top: 80,
        }}>
          <p style={{
            fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text)',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16,
          }}>
            Filtros
          </p>

          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Raio (km)
            </p>
            {[10, 20, 50].map((r) => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}>
                <input
                  type="radio"
                  name="raio"
                  defaultChecked={r === radiusKm}
                  style={{ accentColor: 'var(--brand)' }}
                />
                <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{r} km</span>
              </label>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Especialidade
            </p>
            {SPECIALTIES.map((s) => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}>
                <input type="checkbox" style={{ accentColor: 'var(--brand)', width: 16, height: 16 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{s}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* Resultados */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {usingDefault && (
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
          )}

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
