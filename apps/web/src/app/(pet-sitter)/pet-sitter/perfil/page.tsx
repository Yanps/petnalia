import type { Metadata } from 'next';

import type { PetSitterOwnProfileResponse } from '@petnalia/types';
import { Icon } from '@petnalia/ui';

import { PetSitterProfileForm } from '@/components/dashboard/pet-sitter-profile-form';
import { apiFetch } from '@/lib/api-client';
import { getToken } from '@/lib/auth';

export const metadata: Metadata = { title: 'Perfil — Pet sitter' };

export default async function PetSitterPerfilPage() {
  const token = await getToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const profile = await apiFetch<PetSitterOwnProfileResponse>('/v1/pet-sitters/me', {
    headers: authHeaders,
  }).catch(() => null);

  if (!profile) {
    return (
      <div className="pn-page" style={{ padding: '40px 40px 60px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '16px 20px',
            background: 'var(--teal-50)',
            border: '1px solid var(--teal-200)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <Icon name="info" size={18} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '0.875rem', color: 'var(--brand)', lineHeight: 1.6 }}>
              Não foi possível carregar seu perfil. Tente novamente em instantes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <PetSitterProfileForm profile={profile} token={token ?? ''} />;
}
