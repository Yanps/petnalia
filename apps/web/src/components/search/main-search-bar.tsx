'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Icon } from '@petnalia/ui';
import type { GeoSuggestion } from '@petnalia/types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type SearchType = 'veterinario' | 'pet-sitter';

interface SpecialtyOption {
  readonly id: string;
  readonly name: string;
}

interface MainSearchBarProps {
  readonly specialties: readonly SpecialtyOption[];
  readonly initialTipo?: SearchType;
  readonly initialEspecialidadeId?: string;
  readonly initialEspecialidadeName?: string;
  readonly initialLocal?: string;
}

const TABS: { id: SearchType; label: string; icon: 'stethoscope' | 'heart-handshake' }[] = [
  { id: 'veterinario', label: 'Veterinário', icon: 'stethoscope' },
  { id: 'pet-sitter', label: 'Pet sitter', icon: 'heart-handshake' },
];

export function MainSearchBar({
  specialties,
  initialTipo = 'veterinario',
  initialEspecialidadeId,
  initialEspecialidadeName,
  initialLocal,
}: MainSearchBarProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tipo, setTipo] = useState<SearchType>(initialTipo);

  const [especialidadeInput, setEspecialidadeInput] = useState(initialEspecialidadeName ?? '');
  const [especialidadeId, setEspecialidadeId] = useState<string | null>(initialEspecialidadeId ?? null);
  const [especialidadeOpen, setEspecialidadeOpen] = useState(false);

  const [localInput, setLocalInput] = useState(initialLocal ?? '');
  const [localCoords, setLocalCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [localOpen, setLocalOpen] = useState(false);
  const [localSuggestions, setLocalSuggestions] = useState<GeoSuggestion[]>([]);
  const [localLoading, setLocalLoading] = useState(false);

  const especialidadeBoxRef = useRef<HTMLDivElement>(null);
  const localBoxRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (especialidadeBoxRef.current && !especialidadeBoxRef.current.contains(e.target as Node)) {
        setEspecialidadeOpen(false);
      }
      if (localBoxRef.current && !localBoxRef.current.contains(e.target as Node)) {
        setLocalOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Debounced location suggestions
  useEffect(() => {
    if (localCoords) return; // already resolved to a real place — typing clears this first
    if (localInput.trim().length < 3) {
      setLocalSuggestions([]);
      return;
    }
    setLocalLoading(true);
    const timer = setTimeout(() => {
      fetch(`${API}/v1/geo/suggest?q=${encodeURIComponent(localInput)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: GeoSuggestion[]) => setLocalSuggestions(data))
        .catch(() => setLocalSuggestions([]))
        .finally(() => setLocalLoading(false));
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localInput]);

  const filteredSpecialties = especialidadeInput.trim()
    ? specialties.filter((s) => s.name.toLowerCase().includes(especialidadeInput.trim().toLowerCase()))
    : specialties;

  function selectSpecialty(s: SpecialtyOption) {
    setEspecialidadeId(s.id);
    setEspecialidadeInput(s.name);
    setEspecialidadeOpen(false);
  }

  function selectLocal(s: GeoSuggestion) {
    setLocalCoords({ lat: s.lat, lng: s.lng });
    setLocalInput(s.label);
    setLocalOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ tipo });
    if (tipo === 'veterinario' && especialidadeId) params.set('especialidade', especialidadeId);
    if (localCoords) {
      params.set('lat', String(localCoords.lat));
      params.set('lng', String(localCoords.lng));
    }
    if (localInput.trim()) params.set('local', localInput.trim());

    startTransition(() => {
      router.push(`/busca?${params.toString()}`);
    });
  }

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
      padding: 16, maxWidth: 720, width: '100%',
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTipo(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              border: `1px solid ${tipo === t.id ? 'var(--brand)' : 'var(--border)'}`,
              background: tipo === t.id ? 'var(--teal-50)' : 'transparent',
              color: tipo === t.id ? 'var(--brand)' : 'var(--text-secondary)',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Icon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="pn-search-bar-form" style={{ display: 'flex', gap: 10 }}>
        {tipo === 'veterinario' && (
          <div ref={especialidadeBoxRef} style={{ position: 'relative', flex: '1 1 160px', minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              padding: '10px 14px', background: 'var(--surface-2)',
            }}>
              <Icon name="stethoscope" size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                value={especialidadeInput}
                onChange={(e) => { setEspecialidadeInput(e.target.value); setEspecialidadeId(null); }}
                onFocus={() => setEspecialidadeOpen(true)}
                placeholder="Especialidade"
                disabled={pending}
                style={{
                  flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                  fontSize: '0.9375rem', color: 'var(--text)', fontFamily: 'inherit',
                }}
              />
            </div>
            {especialidadeOpen && filteredSpecialties.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                maxHeight: 260, overflowY: 'auto', zIndex: 'var(--z-dropdown)' as unknown as number,
              }}>
                {filteredSpecialties.slice(0, 8).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectSpecialty(s)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 14px', border: 'none', background: 'transparent',
                      cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text)',
                      fontFamily: 'inherit',
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div ref={localBoxRef} style={{ position: 'relative', flex: '1 1 160px', minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
            padding: '10px 14px', background: 'var(--surface-2)',
          }}>
            <Icon name="map-pin" size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              value={localInput}
              onChange={(e) => { setLocalInput(e.target.value); setLocalCoords(null); }}
              onFocus={() => setLocalOpen(true)}
              placeholder="Cidade ou região"
              disabled={pending}
              style={{
                flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                fontSize: '0.9375rem', color: 'var(--text)', fontFamily: 'inherit',
              }}
            />
          </div>
          {localOpen && (localLoading || localSuggestions.length > 0) && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
              maxHeight: 260, overflowY: 'auto', zIndex: 'var(--z-dropdown)' as unknown as number,
            }}>
              {localLoading ? (
                <p style={{ padding: '10px 14px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Buscando...
                </p>
              ) : (
                localSuggestions.map((s, i) => (
                  <button
                    key={`${s.lat}-${s.lng}-${i}`}
                    type="button"
                    onClick={() => selectLocal(s)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 14px', border: 'none', background: 'transparent',
                      cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text)',
                      fontFamily: 'inherit',
                    }}
                  >
                    {s.label}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <Button
          type="submit" variant="primary" size="md" iconRight="arrow-right" disabled={pending}
          style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          {pending ? 'Buscando...' : 'Pesquisar'}
        </Button>
      </form>
    </div>
  );
}
