import type { Metadata } from 'next';

import type { Specialty, VetOwnProfileResponse } from '@petnalia/types';
import { Icon } from '@petnalia/ui';

import { VetProfileForm } from '@/components/dashboard/vet-profile-form';
import { apiFetch } from '@/lib/api-client';
import { getToken } from '@/lib/auth';

export const metadata: Metadata = { title: 'Perfil — Veterinário' };

export default async function VetPerfilPage() {
  const token = await getToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const [profileResult, specialties] = await Promise.all([
    apiFetch<VetOwnProfileResponse>('/v1/veterinarians/me', { headers: authHeaders }).catch(
      () => null,
    ),
    apiFetch<Specialty[]>('/v1/veterinarians/specialties').catch(() => []),
  ]);

  if (!profileResult) {
    return (
      <div className="pn-page" style={{ padding: '40px 40px 60px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
            }}>
              Perfil do veterinário
            </h1>
          </div>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '16px 20px',
            background: 'var(--teal-50)',
            border: '1px solid var(--teal-200)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <Icon name="info" size={18} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--brand)', marginBottom: 4 }}>
                Complete seu onboarding
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--brand)', lineHeight: 1.6 }}>
                Seu perfil de veterinário ainda não foi configurado. Finalize o cadastro para começar a atender.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <VetProfileForm
      profile={profileResult}
      specialties={specialties}
    />
  );
}
