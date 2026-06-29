import type { Metadata } from 'next';
import { Button, Icon } from '@petnalia/ui';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = { title: 'Meu perfil' };

export default async function TutorPerfilPage() {
  const session = (await getSession())!;

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

      <div style={{ maxWidth: 600 }}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 36px',
          marginBottom: 16,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            background: 'var(--teal-50)',
            border: '1px solid var(--teal-200)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 28,
          }}>
            <Icon name="info" size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--brand)', fontWeight: 500 }}>
              Funcionalidade em breve
            </span>
          </div>

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

            <div>
              <label style={{
                display: 'block', fontSize: '0.875rem', fontWeight: 600,
                color: 'var(--text)', marginBottom: 8,
              }}>
                Telefone
              </label>
              <input
                type="tel"
                placeholder="(11) 90000-0000"
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

            <div style={{ paddingTop: 8 }}>
              <Button variant="primary" size="md" disabled>
                Salvar alterações
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
