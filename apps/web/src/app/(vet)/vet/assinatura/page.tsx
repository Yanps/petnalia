import type { Metadata } from 'next';
import { Button, Icon } from '@petnalia/ui';

export const metadata: Metadata = { title: 'Assinatura' };

const PLANS = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    period: 'para sempre',
    current: true,
    highlight: false,
    features: [
      'Perfil público básico',
      'Até 5 consultas/mês',
      'Avaliações de tutores',
    ],
  },
  {
    name: 'Pro',
    price: 'R$ 49',
    period: 'por mês',
    current: false,
    highlight: true,
    features: [
      'Consultas ilimitadas',
      'Prioridade na busca',
      'Agenda online completa',
      'Relatórios de desempenho',
    ],
  },
  {
    name: 'Clínica',
    price: 'R$ 149',
    period: 'por mês',
    current: false,
    highlight: false,
    features: [
      'Tudo do Pro',
      'Múltiplos profissionais',
      'Gestão de equipe',
      'Suporte prioritário',
    ],
  },
] as const;

export default function AssinaturaPage() {
  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>
          Assinatura
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Escolha o plano ideal para o seu volume de atendimentos.
        </p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 960,
      }}>
        {PLANS.map(({ name, price, period, current, highlight, features }) => (
          <div key={name} style={{
            padding: '32px 28px',
            background: current ? 'var(--teal-50)' : highlight ? 'var(--brand)' : 'var(--surface)',
            border: `1px solid ${current ? 'var(--brand)' : highlight ? 'var(--brand)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-xl)',
            position: 'relative',
          }}>
            {highlight && (
              <span style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--teal-800)', color: '#fff',
                padding: '4px 14px', borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>
                Mais popular
              </span>
            )}
            {current && (
              <span style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--brand)', color: '#fff',
                padding: '4px 14px', borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>
                Plano atual
              </span>
            )}

            <p style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '1rem',
              color: highlight ? 'rgba(255,255,255,0.8)' : current ? 'var(--brand)' : 'var(--text-secondary)',
              marginBottom: 8,
            }}>
              {name}
            </p>
            <p style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '2rem',
              color: highlight ? '#fff' : 'var(--text)',
              letterSpacing: '-0.02em', marginBottom: 4,
            }}>
              {price}
            </p>
            <p style={{
              fontSize: '0.8125rem',
              color: highlight ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
              marginBottom: 24,
            }}>
              {period}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon
                    name="check"
                    size={15}
                    style={{ color: highlight ? 'rgba(255,255,255,0.9)' : 'var(--brand)', flexShrink: 0 }}
                    strokeWidth={2.5}
                  />
                  <span style={{
                    fontSize: '0.9375rem',
                    color: highlight ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)',
                  }}>
                    {f}
                  </span>
                </div>
              ))}
            </div>

            {current ? (
              <Button variant="outline" size="md" block disabled>
                Plano atual
              </Button>
            ) : (
              <div style={{ position: 'relative' }}>
                <Button
                  variant={highlight ? 'accent' : 'outline'}
                  size="md"
                  block
                  disabled
                >
                  Em breve
                </Button>
                <span style={{
                  position: 'absolute', top: -8, right: -8,
                  background: 'var(--teal-600)', color: '#fff',
                  padding: '2px 8px', borderRadius: 'var(--radius-full)',
                  fontSize: '0.6875rem', fontWeight: 700,
                  letterSpacing: '0.04em',
                }}>
                  Em breve
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
