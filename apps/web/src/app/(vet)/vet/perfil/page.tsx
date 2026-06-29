import type { Metadata } from 'next';
import { Button, Icon } from '@petnalia/ui';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = { title: 'Perfil — Veterinário' };

export default async function VetPerfilPage() {
  const session = (await getSession())!;

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
                Bio
              </label>
              <textarea
                rows={4}
                placeholder="Descreva sua experiência e especialidades..."
                disabled
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9375rem', color: 'var(--text)',
                  boxSizing: 'border-box',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: 1.6,
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: '0.875rem', fontWeight: 600,
                color: 'var(--text)', marginBottom: 8,
              }}>
                Especialidades
              </label>
              <div style={{
                padding: '12px 14px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                minHeight: 48,
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Nenhuma especialidade adicionada.
                </p>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: '0.875rem', fontWeight: 600,
                color: 'var(--text)', marginBottom: 8,
              }}>
                Raio de atendimento (km)
              </label>
              <input
                type="number"
                placeholder="Ex: 20"
                min={1}
                max={200}
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
                Salvar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
