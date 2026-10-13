'use client';

import { useState } from 'react';

import type { PetSitterOwnProfileResponse, PetSitterService } from '@petnalia/types';
import { PET_SITTER_SERVICE_LABELS, PetSitterServiceSchema } from '@petnalia/types';
import { Button, Icon } from '@petnalia/ui';

interface PetSitterProfileFormProps {
  readonly profile: PetSitterOwnProfileResponse;
  readonly token: string;
}

type SaveState = 'idle' | 'saving' | 'success' | 'error';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const ALL_SERVICES = PetSitterServiceSchema.options;

const BRAZIL_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

export function PetSitterProfileForm({ profile, token }: PetSitterProfileFormProps) {
  const [bio, setBio] = useState(profile.bio ?? '');
  const [services, setServices] = useState<Set<PetSitterService>>(new Set(profile.services));
  const [baseCity, setBaseCity] = useState(profile.baseCity ?? '');
  const [baseState, setBaseState] = useState(profile.baseState ?? '');
  const [saveState, setSaveState] = useState<SaveState>('idle');

  function toggleService(service: PetSitterService) {
    setServices((prev) => {
      const next = new Set(prev);
      if (next.has(service)) next.delete(service);
      else next.add(service);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveState('saving');
    try {
      const res = await fetch(`${API_BASE}/v1/pet-sitters/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          bio: bio || undefined,
          services: Array.from(services),
          baseCity: baseCity || undefined,
          baseState: baseState || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSaveState('success');
    } catch {
      setSaveState('error');
    }
  }

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
          }}>
            Perfil do pet sitter
          </h1>
        </div>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 36px',
          display: 'flex', flexDirection: 'column', gap: 28,
        }}>
          <div style={{ paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text)' }}>
              {profile.fullName}
            </p>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={labelStyle}>
                Bio
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                  ({bio.length}/1000)
                </span>
              </label>
              <textarea
                rows={4}
                maxLength={1000}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte sobre sua experiência cuidando de pets..."
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Serviços oferecidos</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ALL_SERVICES.map((service) => {
                  const selected = services.has(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.875rem',
                        fontWeight: selected ? 600 : 400,
                        cursor: 'pointer',
                        border: selected ? '1.5px solid var(--brand)' : '1.5px solid var(--border)',
                        background: selected ? 'var(--teal-50)' : 'var(--surface-2)',
                        color: selected ? 'var(--brand)' : 'var(--text-secondary)',
                        transition: 'all 0.15s ease',
                        fontFamily: 'inherit',
                      }}
                    >
                      {PET_SITTER_SERVICE_LABELS[service]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pn-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
              <div>
                <label htmlFor="baseCity" style={labelStyle}>Cidade de atendimento</label>
                <input
                  id="baseCity"
                  type="text"
                  value={baseCity}
                  onChange={(e) => setBaseCity(e.target.value)}
                  placeholder="Ex: São Paulo"
                  style={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="baseState" style={labelStyle}>Estado</label>
                <select
                  id="baseState"
                  value={baseState}
                  onChange={(e) => setBaseState(e.target.value)}
                  style={{ ...inputStyle, width: 80 }}
                >
                  <option value="">UF</option>
                  {BRAZIL_STATES.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>

            {saveState === 'success' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
                background: 'var(--success-50)',
                border: '1px solid var(--success-100)',
                borderRadius: 'var(--radius-md)',
              }}>
                <Icon name="check-circle" size={16} style={{ color: 'var(--success-500)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--success-600)', fontWeight: 500 }}>
                  Perfil atualizado com sucesso.
                </span>
              </div>
            )}

            {saveState === 'error' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
                background: 'var(--error-50)',
                border: '1px solid var(--error-100)',
                borderRadius: 'var(--radius-md)',
              }}>
                <Icon name="alert-circle" size={16} style={{ color: 'var(--error-500)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--error-600)', fontWeight: 500 }}>
                  Não foi possível salvar as alterações. Tente novamente.
                </span>
              </div>
            )}

            <div style={{ paddingTop: 8 }}>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={saveState === 'saving'}
              >
                {saveState === 'saving' ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--text)',
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.9375rem', color: 'var(--text)',
  boxSizing: 'border-box',
  outline: 'none',
  resize: 'vertical',
  lineHeight: 1.6,
  fontFamily: 'inherit',
};
