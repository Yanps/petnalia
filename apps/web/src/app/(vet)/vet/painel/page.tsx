import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Icon } from '@petnalia/ui';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = { title: 'Painel — Veterinário' };

const STATS = [
  { label: 'Consultas esta semana', value: '0', icon: 'calendar' as const },
  { label: 'Avaliação média', value: '—', icon: 'star' as const },
  { label: 'Novos clientes', value: '0', icon: 'user' as const },
] as const;

export default async function VetPainelPage() {
  const session = (await getSession())!;

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
          marginBottom: 6,
        }}>
          Olá, {session.name}
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Acompanhe suas consultas, avaliações e desempenho.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
        {STATS.map(({ label, value, icon }) => (
          <div key={label} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 28px',
            display: 'flex', alignItems: 'flex-start', gap: 16,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-lg)',
              background: 'var(--teal-50)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>
              <Icon name={icon} size={20} style={{ color: 'var(--brand)' }} />
            </div>
            <div>
              <p style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: '2rem', color: 'var(--text)', letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                {value}
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 28px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '1.0625rem', color: 'var(--text)', marginBottom: 24,
          }}>
            Próximas consultas
          </h2>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 12, padding: '24px 0',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--radius-full)',
              background: 'var(--teal-50)', display: 'grid', placeItems: 'center',
            }}>
              <Icon name="calendar" size={24} style={{ color: 'var(--brand)' }} />
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Nenhuma consulta agendada.
            </p>
          </div>
        </div>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 28px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '1.0625rem', color: 'var(--text)', marginBottom: 20,
          }}>
            Status do perfil
          </h2>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Complete seu perfil para aparecer nas buscas de tutores e receber consultas.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Foto de perfil', done: false },
                { label: 'Bio profissional', done: false },
                { label: 'Especialidades', done: false },
                { label: 'Área de atendimento', done: false },
              ].map(({ label, done }) => (
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
            <Link href="/vet/perfil" style={{ textDecoration: 'none', marginTop: 4 }}>
              <Button variant="primary" size="sm" iconRight="arrow-right">
                Completar perfil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
