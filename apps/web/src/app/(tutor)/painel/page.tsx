import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Icon } from '@petnalia/ui';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = { title: 'Painel' };

const STATS = [
  { label: 'Consultas agendadas', value: '0', icon: 'calendar' as const },
  { label: 'Pets cadastrados', value: '0', icon: 'paw-print' as const },
  { label: 'Consultas realizadas', value: '0', icon: 'check-circle' as const },
] as const;

export default async function TutorPainelPage() {
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
          Bem-vindo ao seu painel. Aqui você acompanha suas consultas e pets.
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
              Você ainda não tem consultas agendadas.
            </p>
            <Link href="/busca" style={{ textDecoration: 'none', marginTop: 4 }}>
              <Button variant="primary" size="sm" iconRight="arrow-right">
                Buscar veterinário
              </Button>
            </Link>
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
            fontSize: '1.0625rem', color: 'var(--text)', marginBottom: 24,
          }}>
            Seus pets
          </h2>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 12, padding: '24px 0',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--radius-full)',
              background: 'var(--teal-50)', display: 'grid', placeItems: 'center',
            }}>
              <Icon name="paw-print" size={24} style={{ color: 'var(--brand)' }} />
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Nenhum pet cadastrado ainda.
            </p>
            <Link href="/pets" style={{ textDecoration: 'none', marginTop: 4 }}>
              <Button variant="primary" size="sm" iconLeft="plus">
                Adicionar pet
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
