import type { Metadata } from 'next';
import type { Address } from '@petnalia/types';
import { AddressManager } from '@/components/dashboard/address-manager';
import { api } from '@/lib/api-client';
import { getSession, getToken } from '@/lib/auth';

export const metadata: Metadata = { title: 'Meu perfil' };

async function getAddresses(token: string): Promise<Address[]> {
  try {
    return await api.get<Address[]>('/v1/addresses', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return [];
  }
}

export default async function TutorPerfilPage() {
  const session = (await getSession())!;
  const token = await getToken();
  const addresses = token ? await getAddresses(token) : [];

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
        }}>
          Meu perfil
        </h1>
      </div>

      <div style={{ maxWidth: 640 }}>
        {/* Profile info section */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 36px',
          marginBottom: 24,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '1.125rem', color: 'var(--text)', marginBottom: 20,
          }}>
            Informações pessoais
          </h2>

          <form style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{
                display: 'block', fontSize: '0.875rem', fontWeight: 600,
                color: 'var(--text)', marginBottom: 8,
              }}>
                Nome completo
              </label>
              <input
                type="text"
                defaultValue={session.name}
                disabled
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9375rem', color: 'var(--text)',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: '0.875rem', fontWeight: 600,
                color: 'var(--text)', marginBottom: 8,
              }}>
                E-mail
              </label>
              <input
                type="email"
                defaultValue={session.email}
                readOnly
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9375rem', color: 'var(--text-secondary)',
                  boxSizing: 'border-box',
                  outline: 'none',
                  cursor: 'not-allowed',
                }}
              />
            </div>
          </form>
        </div>

        {/* Address management section */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 36px',
        }}>
          <AddressManager
            initialAddresses={addresses}
            token={token ?? ''}
          />
        </div>
      </div>
    </div>
  );
}
