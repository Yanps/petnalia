'use client';

import { useState } from 'react';
import type { Specialty, VetProfilePublicResponse } from '@petnalia/types';
import { Button, Icon } from '@petnalia/ui';

import { apiFetch } from '@/lib/api-client';

interface VetProfileFormProps {
  profile: VetProfilePublicResponse;
  specialties: Specialty[];
  token: string;
}

type SaveState = 'idle' | 'saving' | 'success' | 'error';

export function VetProfileForm({ profile, specialties, token }: VetProfileFormProps) {
  const [bio, setBio] = useState(profile.bio ?? '');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(profile.serviceRadiusKm);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(profile.specialties.map((s) => s.id)),
  );
  const [saveState, setSaveState] = useState<SaveState>('idle');

  function toggleSpecialty(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveState('saving');
    try {
      await apiFetch('/v1/veterinarians/profile', {
        method: 'PUT',
        body: {
          bio: bio || null,
          serviceRadiusKm,
          specialtyIds: Array.from(selectedIds),
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSaveState('success');
    } catch {
      setSaveState('error');
    }
  }

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
        }}>
          Perfil do veterinário
        </h1>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 36px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28,
            paddingBottom: 24, borderBottom: '1px solid var(--border)',
          }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text)' }}>
                {profile.fullName}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                CRMV-{profile.crmvState} {profile.crmv}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                placeholder="Descreva sua experiência e especialidades..."
                style={{
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
                }}
              />
            </div>

            <div>
              <label style={labelStyle}>Raio de atendimento (km)</label>
              <input
                type="number"
                min={1}
                max={200}
                required
                value={serviceRadiusKm}
                onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9375rem', color: 'var(--text)',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {specialties.length > 0 && (
              <div>
                <label style={labelStyle}>Especialidades</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {specialties.map((s) => {
                    const selected = selectedIds.has(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSpecialty(s.id)}
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
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {saveState === 'success' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
                background: 'var(--success-50)',
                border: '1px solid var(--success-500)',
                borderRadius: 'var(--radius-md)',
              }}>
                <Icon name="check-circle" size={16} style={{ color: 'var(--success-600)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--success-600)', fontWeight: 500 }}>
                  Perfil atualizado com sucesso.
                </span>
              </div>
            )}

            {saveState === 'error' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
                background: 'var(--teal-50)',
                border: '1px solid var(--teal-200)',
                borderRadius: 'var(--radius-md)',
              }}>
                <Icon name="alert-circle" size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--brand)', fontWeight: 500 }}>
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
