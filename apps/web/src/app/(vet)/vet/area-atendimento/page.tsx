import type { Metadata } from 'next';
import type { VetOwnProfileResponse } from '@petnalia/types';
import { Icon } from '@petnalia/ui';

import { apiFetch } from '@/lib/api-client';
import { getToken } from '@/lib/auth';
import { AreaAtendimentoForm } from '@/components/dashboard/area-atendimento-form';

export const metadata: Metadata = { title: 'Área de atendimento' };

export default async function AreaAtendimentoPage() {
  const token = await getToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const profile = await apiFetch<VetOwnProfileResponse>('/v1/veterinarians/me', {
    headers: authHeaders,
  }).catch(() => null);

  return (
    <main className="pn-page" style={{ padding: '40px 40px 60px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 6,
          }}>
            Área de atendimento
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            Defina o raio de deslocamento para consultas domiciliares a partir do seu endereço base.
          </p>
        </div>

        {profile ? (
          <AreaAtendimentoForm profile={profile} token={token ?? ''} />
        ) : (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '16px 20px',
            background: 'var(--teal-50)', border: '1px solid var(--teal-200)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <Icon name="info" size={18} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '0.875rem', color: 'var(--brand)', lineHeight: 1.6, margin: 0 }}>
              Seu perfil de veterinário ainda não foi configurado. Finalize o cadastro para definir sua área de atendimento.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
