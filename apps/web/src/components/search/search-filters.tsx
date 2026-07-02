'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@petnalia/ui';

interface Specialty {
  id: string;
  name: string;
  slug: string;
}

interface SearchFiltersProps {
  readonly specialties: readonly Specialty[];
  readonly currentRadius: number;
  readonly currentSpecialtyId: string | undefined;
  readonly lat: number;
  readonly lng: number;
}

export function SearchFilters({ specialties, currentRadius, currentSpecialtyId, lat, lng }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [panelOpen, setPanelOpen] = useState(false);

  const activeCount = (currentRadius !== 20 ? 1 : 0) + (currentSpecialtyId ? 1 : 0);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`/busca?${params.toString()}`);
  }

  const filterContent = (
    <>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
          Raio (km)
        </p>
        {[10, 20, 50].map((r) => (
          <label
            key={r}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}
          >
            <input
              type="radio"
              name="raio"
              checked={r === currentRadius}
              onChange={() => updateParams({ raio: String(r) })}
              style={{ accentColor: 'var(--brand)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{r} km</span>
          </label>
        ))}
      </div>

      {specialties.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
            Especialidade
          </p>
          {specialties.map((s) => (
            <label
              key={s.id}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}
            >
              <input
                type="checkbox"
                checked={currentSpecialtyId === s.id}
                onChange={(e) =>
                  updateParams({ especialidade: e.target.checked ? s.id : null })
                }
                style={{ accentColor: 'var(--brand)', width: 16, height: 16, cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{s.name}</span>
            </label>
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="pn-filter-toggle-btn"
        onClick={() => setPanelOpen((v) => !v)}
        style={{
          width: '100%', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', cursor: 'pointer',
          fontFamily: 'inherit', marginBottom: 0,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="filter" size={16} style={{ color: 'var(--brand)' }} />
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)' }}>
            Filtros
            {activeCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginLeft: 8, width: 20, height: 20, borderRadius: '50%',
                background: 'var(--brand)', color: '#fff',
                fontSize: '0.75rem', fontWeight: 700,
              }}>
                {activeCount}
              </span>
            )}
          </span>
        </span>
        <Icon name={panelOpen ? 'chevron-up' : 'chevron-down'} size={16} style={{ color: 'var(--text-muted)' }} />
      </button>

      {/* Mobile: collapsible panel */}
      <div
        className={`pn-filter-panel${panelOpen ? ' open' : ''}`}
        style={{ marginBottom: panelOpen ? 20 : 0 }}
      >
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderTop: 'none',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
          padding: '20px',
        }}>
          {filterContent}
        </div>
      </div>

      {/* Desktop: always visible aside */}
      <aside
        className="pn-search-filters"
        style={{
          width: 240, flexShrink: 0,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px',
          position: 'sticky', top: 80,
        }}
      >
        <p style={{
          fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text)',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16,
        }}>
          Filtros
        </p>
        {filterContent}
      </aside>
    </>
  );
}
