import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Icon } from '@petnalia/ui';

export const metadata: Metadata = {
  title: 'Planos — PetNalia',
  description: 'Conheça os planos gratuitos para tutores e as opções para veterinários que queiram ampliar sua carteira de clientes.',
};

export const revalidate = 3600;

const TUTOR_BENEFITS = [
  { icon: 'search' as const, text: 'Busca gratuita de veterinários' },
  { icon: 'calendar' as const, text: 'Agendamento gratuito' },
  { icon: 'paw-print' as const, text: 'Cadastro de pets ilimitado' },
  { icon: 'star' as const, text: 'Avaliação de atendimentos' },
] as const;

const VET_PLANS = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    period: 'para sempre',
    highlight: false,
    features: [
      'Perfil público básico',
      'Até 5 consultas/mês',
      'Avaliações de tutores',
    ],
    cta: 'Começar grátis',
  },
  {
    name: 'Pro',
    price: 'R$ 49',
    period: 'por mês',
    highlight: true,
    features: [
      'Consultas ilimitadas',
      'Prioridade na busca',
      'Agenda online completa',
      'Relatórios de desempenho',
    ],
    cta: 'Assinar Pro',
  },
  {
    name: 'Clínica',
    price: 'R$ 149',
    period: 'por mês',
    highlight: false,
    features: [
      'Tudo do Pro',
      'Múltiplos profissionais',
      'Gestão de equipe',
      'Suporte prioritário',
    ],
    cta: 'Assinar Clínica',
  },
] as const;

export default function PlanosPage() {
  return (
    <main>
      <section style={{ padding: '72px 24px 56px', textAlign: 'center' }}>
        <p style={{
          fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand)',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12,
        }}>
          Planos e preços
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text)',
          letterSpacing: '-0.02em', marginBottom: 16, lineHeight: 1.1,
        }}>
          Transparência em cada plano
        </h1>
        <p style={{
          fontSize: '1.0625rem', color: 'var(--text-secondary)',
          lineHeight: 1.65, maxWidth: 540, margin: '0 auto',
        }}>
          Para tutores, a PetNalia é sempre gratuita. Veterinários têm opções de plano para crescer no ritmo que preferem.
        </p>
      </section>

      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            background: 'var(--teal-50)',
            border: '1px solid var(--teal-200)',
            borderRadius: 'var(--radius-xl)',
            padding: '40px 48px',
            marginBottom: 64,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
              <div style={{ maxWidth: 480 }}>
                <p style={{
                  fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
                }}>
                  Para tutores
                </p>
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: '1.625rem', color: 'var(--text)', letterSpacing: '-0.015em', marginBottom: 12,
                }}>
                  Grátis para sempre
                </h2>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 24 }}>
                  Tutores nunca pagam nada na PetNalia. Busque veterinários, agende consultas e cuide dos seus pets sem custo algum.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {TUTOR_BENEFITS.map(({ icon, text }) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon name={icon} size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <p style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: '3rem', color: 'var(--brand)', letterSpacing: '-0.03em', lineHeight: 1,
                }}>
                  R$ 0
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>para sempre</p>
                <Link href="/cadastro" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="md" iconRight="arrow-right">
                    Criar conta gratuita
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{
              fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand)',
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
            }}>
              Para veterinários
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '1.625rem', color: 'var(--text)', letterSpacing: '-0.015em', marginBottom: 10,
            }}>
              Comece grátis, cresça quando quiser
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              Sem cartão de crédito para começar.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {VET_PLANS.map(({ name, price, period, highlight, features, cta }) => (
              <div key={name} style={{
                padding: '32px 28px',
                background: highlight ? 'var(--brand)' : 'var(--surface)',
                border: `1px solid ${highlight ? 'var(--brand)' : 'var(--border)'}`,
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
                <p style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '1rem',
                  color: highlight ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)',
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

                <Link href="/cadastro?role=veterinarian" style={{ textDecoration: 'none', display: 'block' }}>
                  <Button
                    variant={highlight ? 'accent' : 'outline'}
                    size="md"
                    block
                  >
                    {cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
