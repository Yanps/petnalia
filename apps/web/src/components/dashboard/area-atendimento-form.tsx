'use client';

import { useState, useTransition } from 'react';
import { Button, Icon, RadiusSelector } from '@petnalia/ui';
import type { VetOwnProfileResponse } from '@petnalia/types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function updateServiceRadius(radiusKm: number, token: string): Promise<void> {
  const res = await fetch(`${API}/v1/veterinarians/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ serviceRadiusKm: radiusKm }),
  });
  if (!res.ok) throw new Error('Falha ao salvar o raio de atendimento.');
}

interface Props {
  readonly profile: VetOwnProfileResponse;
  readonly token: string;
}

export function AreaAtendimentoForm({ profile, token }: Props) {
  const [radius, setRadius] = useState(profile.serviceRadiusKm);
  const [lastSavedRadius, setLastSavedRadius] = useState(profile.serviceRadiusKm);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const areaLabel = profile.baseCity && profile.baseState
    ? `${profile.baseCity} · ${profile.baseState}`
    : undefined;

  const dirty = radius !== lastSavedRadius;

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateServiceRadius(radius, token);
        setLastSavedRadius(radius);
        setSaved(true);
      } catch {
        setError('Não foi possível salvar. Tente novamente.');
      }
    });
  }

  return (
    <div>
      {!areaLabel && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '16px 20px', marginBottom: 24,
          background: 'var(--teal-50)', border: '1px solid var(--teal-200)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <Icon name="info" size={18} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--brand)', lineHeight: 1.6, margin: 0 }}>
            Cadastre seu endereço base para exibirmos a região de atendimento no mapa.
          </p>
        </div>
      )}

      <div style={{
        background: 'white', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)', padding: '32px',
      }}>
        <RadiusSelector
          value={radius}
          onChange={setRadius}
          min={1}
          max={100}
          {...(areaLabel !== undefined && { areaLabel })}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
          <Button variant="primary" disabled={pending || !dirty} onClick={handleSave}>
            {pending ? 'Salvando...' : 'Salvar raio de atendimento'}
          </Button>
          {saved && !dirty && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--success-600)' }}>
              <Icon name="check-circle" size={16} />
              Salvo
            </span>
          )}
          {error && (
            <span style={{ fontSize: '0.875rem', color: 'var(--error-600)' }}>{error}</span>
          )}
        </div>
      </div>
    </div>
  );
}
