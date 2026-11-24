import type { Metadata } from 'next';
import Link from 'next/link';

import type { PetSitterOwnProfileResponse } from '@petnalia/types';
import { Button, Icon } from '@petnalia/ui';

import { apiFetch } from '@/lib/api-client';
import { getSession, getToken } from '@/lib/auth';

export const metadata: Metadata = { title: 'Painel — Pet sitter' };

export default async function PetSitterPainelPage() {
  const session = (await getSession())!;
  const token = await getToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const profile = await apiFetch<PetSitterOwnProfileResponse>('/v1/pet-sitters/me', {
    headers: authHeaders,
  }).catch(() => null);

  const checklist = [
    { label: 'Bio', done: Boolean(profile?.bio) },
    { label: 'Serviços oferecidos', done: Boolean(profile?.services.length) },
    { label: 'Cidade e estado de atendimento', done: Boolean(profile?.baseCity && profile?.baseState) },
  ];
  const allDone = checklist.every((c) => c.done);

  return (
    <div className="pn-page" style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
          marginBottom: 6,
        }}>
          Olá, {session.name}
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Complete seu perfil para aparecer nas buscas de tutores.
        </p>
      </div>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 28px',
        maxWidth: 520,
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '1.0625rem', color: 'var(--text)', marginBottom: 20,
        }}>
          Status do perfil
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {checklist.map(({ label, done }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon
                name={done ? 'check-circle' : 'info'}
                size={15}
                style={{ color: done ? 'var(--success-500)' : 'var(--text-muted)', flexShrink: 0 }}
              />
              <span style={{ fontSize: '0.875rem', color: done ? 'var(--text)' : 'var(--text-secondary)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
        {allDone ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--success-500)', fontWeight: 500 }}>
            Seu perfil está completo e visível na busca.
          </p>
        ) : (
          <Link href="/pet-sitter/perfil" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="sm" iconRight="arrow-right">
              Completar perfil
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
