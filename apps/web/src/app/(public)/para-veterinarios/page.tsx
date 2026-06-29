import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Icon } from '@petnalia/ui';

export const metadata: Metadata = {
  title: 'Para veterinários — PetNalia',
  description: 'Amplie sua carteira de clientes, controle sua agenda e receba pelos atendimentos. Tudo em uma só plataforma.',
};

export const revalidate = 86400;

const BENEFITS = [
  {
    icon: 'user' as const,
    title: 'Novos clientes todo mês',
    text: 'Apareça para tutores que buscam atendimento na sua região. Você define o raio de atuação.',
  },
  {
    icon: 'calendar' as const,
    title: 'Agenda online',
    text: 'Gerencie sua disponibilidade em poucos cliques. Receba confirmações automáticas.',
  },
  {
    icon: 'shield-check' as const,
    title: 'Perfil verificado',
    text: 'Seu CRMV é validado pela equipe PetNalia. Tutores sabem que estão em boas mãos.',
  },
  {
    icon: 'star' as const,
    title: 'Reputação construída',
    text: 'Avaliações reais de tutores aumentam sua visibilidade na plataforma.',
  },
] as const;

const STEPS = [
  {
    num: '01',
    title: 'Crie sua conta',
    text: 'Cadastro gratuito em menos de 5 minutos. Informe seu CRMV e dados profissionais.',
  },
  {
    num: '02',
    title: 'Monte seu perfil',
    text: 'Adicione especialidades, bio, foto e defina sua área de atuação.',
  },
  {
    num: '03',
    title: 'Receba consultas',
    text: 'Tutores te encontram na busca e agendam diretamente. Você confirma e vai ao atendimento.',
  },
] as const;

const PLANS = [
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
  },
] as const;

export default function ParaVeterinariosPage() {
  return (
    <main>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, var(--teal-800) 0%, var(--teal-600) 55%, var(--teal-500) 100%)',
        padding: '96px 24px 80px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <Badge variant="brand" icon="stethoscope" style={{ marginBottom: 24, background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}>
            Para veterinários
          </Badge>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1,
            color: '#fff', letterSpacing: '-0.02em',
            marginBottom: 20,
          }}>
            Amplie sua carteira de clientes sem sair de casa
          </h1>

          <p style={{
            fontSize: '1.125rem', color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.65, marginBottom: 40, maxWidth: 520, margin: '0 auto 40px',
          }}>
            A PetNalia conecta você a tutores que precisam de atendimento domiciliar e telemedicina — na sua cidade, na sua agenda.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/cadastro?role=veterinarian" style={{ textDecoration: 'none' }}>
              <Button variant="accent" size="lg" iconRight="arrow-right">
                Começar grátis
              </Button>
            </Link>
            <a href="#como-funciona" style={{ textDecoration: 'none' }}>
              <Button
                variant="ghost"
                size="lg"
                style={{ color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                Ver como funciona
              </Button>
            </a>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 52, flexWrap: 'wrap' }}>
            {[
              { value: '1.400+', label: 'veterinários ativos' },
              { value: '4.8★', label: 'avaliação média' },
              { value: 'R$ 3.200', label: 'renda média mensal' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#fff', marginBottom: 4 }}>
                  {value}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Por que PetNalia
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.015em',
            }}>
              Tudo que você precisa para crescer
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {BENEFITS.map(({ icon, title, text }) => (
              <div key={title} style={{
                padding: '28px 24px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                  background: 'var(--brand-subtle, var(--teal-50))',
                  display: 'grid', placeItems: 'center', marginBottom: 16,
                }}>
                  <Icon name={icon} size={22} style={{ color: 'var(--brand)' }} />
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '1rem', color: 'var(--text)', marginBottom: 8,
                }}>
                  {title}
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" style={{ padding: '80px 24px', background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Simples assim
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.015em',
            }}>
              Como funciona
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STEPS.map(({ num, title, text }, i) => (
              <div key={num} style={{ display: 'flex', gap: 32, alignItems: 'flex-start', position: 'relative', paddingBottom: i < STEPS.length - 1 ? 40 : 0 }}>
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', left: 23, top: 52, bottom: 0,
                    width: 2, background: 'var(--border)',
                  }} />
                )}
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-full)',
                  background: 'var(--brand)', color: '#fff',
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.875rem',
                  position: 'relative', zIndex: 1,
                }}>
                  {num}
                </div>
                <div style={{ paddingTop: 10 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: '1.125rem', color: 'var(--text)', marginBottom: 6,
                  }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Planos
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.015em', marginBottom: 12,
            }}>
              Comece grátis, cresça quando quiser
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              Sem cartão de crédito para começar.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {PLANS.map(({ name, price, period, highlight, features }) => (
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
                    background: 'var(--accent)', color: '#fff',
                    padding: '4px 14px', borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                  }}>
                    Mais popular
                  </span>
                )}
                <p style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '1rem', color: highlight ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)',
                  marginBottom: 8,
                }}>
                  {name}
                </p>
                <p style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: '2rem', color: highlight ? '#fff' : 'var(--text)',
                  letterSpacing: '-0.02em', marginBottom: 4,
                }}>
                  {price}
                </p>
                <p style={{ fontSize: '0.8125rem', color: highlight ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginBottom: 24 }}>
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
                      <span style={{ fontSize: '0.9375rem', color: highlight ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }}>
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
                    {name === 'Grátis' ? 'Começar grátis' : 'Assinar'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '80px 24px',
        background: 'var(--surface-2)',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '2rem', color: 'var(--text)',
            letterSpacing: '-0.02em', marginBottom: 16,
          }}>
            Pronto para começar?
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 32 }}>
            Crie seu perfil gratuito hoje e apareça para tutores que buscam veterinário na sua cidade.
          </p>
          <Link href="/cadastro?role=veterinarian" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg" iconRight="arrow-right">
              Criar perfil gratuito
            </Button>
          </Link>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 16 }}>
            Sem cartão de crédito · Cancelamento a qualquer momento
          </p>
        </div>
      </section>
    </main>
  );
}
