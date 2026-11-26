import type { Metadata } from 'next';

import { Icon } from '@petnalia/ui';

import { CancelButton } from '@/features/subscriptions/cancel-button';
import { CheckoutButton } from '@/features/subscriptions/checkout-button';
import { getToken } from '@/lib/auth';

export const metadata: Metadata = { title: 'Assinatura — PetNalia' };

const API = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

interface SubscriptionData {
  readonly id: string;
  readonly plan: string;
  readonly status: string;
  readonly cancelAtPeriodEnd: boolean;
}

async function fetchSubscription(token: string): Promise<SubscriptionData | null> {
  try {
    const res = await fetch(`${API}/v1/subscriptions/me`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    });
    if (res.status === 404 || res.status === 204) return null;
    if (!res.ok) return null;
    return (await res.json()) as SubscriptionData;
  } catch {
    return null;
  }
}

function StatusBadge({ status, cancelAtPeriodEnd }: { status: string; cancelAtPeriodEnd: boolean }) {
  if (cancelAtPeriodEnd) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 12px', borderRadius: 'var(--radius-full)',
        background: '#fef3c7', color: '#92400e',
        fontSize: '0.75rem', fontWeight: 600,
      }}>
        <Icon name="clock" size={12} />
        Cancelamento agendado
      </span>
    );
  }

  const map: Record<string, { bg: string; color: string; label: string }> = {
    active: { bg: '#dcfce7', color: '#14532d', label: 'Ativo' },
    trialing: { bg: '#dbeafe', color: '#1e3a5f', label: 'Período de teste' },
    past_due: { bg: '#fef2f2', color: '#7f1d1d', label: 'Pagamento pendente' },
    cancelled: { bg: '#f3f4f6', color: '#374151', label: 'Cancelado' },
  };

  const style = map[status] ?? map['cancelled']!;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 'var(--radius-full)',
      background: style.bg, color: style.color,
      fontSize: '0.75rem', fontWeight: 600,
    }}>
      {style.label}
    </span>
  );
}

const PLANS = [
  {
    key: 'free' as const,
    name: 'Grátis',
    price: 'R$ 0',
    period: 'para sempre',
    features: [
      'Perfil público básico',
      'Até 5 consultas/mês',
      'Avaliações de tutores',
    ],
  },
  {
    key: 'pro' as const,
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
    key: 'clinic' as const,
    name: 'Clínica',
    price: 'R$ 149',
    period: 'por mês',
    features: [
      'Tudo do Pro',
      'Múltiplos profissionais',
      'Gestão de equipe',
      'Suporte prioritário',
    ],
  },
] as const;

export default async function AssinaturaPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const token = await getToken();
  const subscription = token ? await fetchSubscription(token) : null;

  const activePlan =
    subscription?.status === 'active' || subscription?.status === 'trialing'
      ? subscription.plan
      : 'free';

  return (
    <div className="pn-page" style={{ padding: '40px 40px 60px' }}>
      {params.success === 'true' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '16px 20px', marginBottom: 24,
          background: '#dcfce7', border: '1px solid #86efac',
          borderRadius: 'var(--radius-lg)', color: '#14532d',
        }}>
          <Icon name="check-circle" size={18} />
          <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
            Assinatura ativada com sucesso! Seja bem-vindo ao plano premium.
          </span>
        </div>
      )}

      {params.cancelled === 'true' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '16px 20px', marginBottom: 24,
          background: '#f3f4f6', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)',
        }}>
          <Icon name="x" size={18} />
          <span style={{ fontSize: '0.9375rem' }}>
            Pagamento cancelado. Seu plano não foi alterado.
          </span>
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>
          Assinatura
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            Escolha o plano ideal para o seu volume de atendimentos.
          </p>
          {subscription && (
            <StatusBadge
              status={subscription.status}
              cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
            />
          )}
        </div>
      </div>

      <div className="pn-grid-3" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 960,
      }}>
        {PLANS.map(({ key, name, price, period, features, ...rest }) => {
          const highlight = 'highlight' in rest && rest.highlight === true;
          const isCurrent = activePlan === key;

          return (
            <div key={key} style={{
              padding: '32px 28px',
              background: highlight ? 'var(--brand)' : 'var(--surface)',
              border: `1px solid ${isCurrent ? 'var(--brand)' : highlight ? 'var(--brand)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-xl)',
              position: 'relative',
              outline: isCurrent ? '2px solid var(--brand)' : 'none',
            }}>
              {highlight && !isCurrent && (
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
              {isCurrent && (
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
                color: highlight ? 'rgba(255,255,255,0.8)' : isCurrent ? 'var(--brand)' : 'var(--text-secondary)',
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

              {isCurrent ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{
                    display: 'block', textAlign: 'center',
                    padding: '10px 0', fontSize: '0.9375rem',
                    fontWeight: 600, color: 'var(--brand)',
                  }}>
                    Plano atual
                  </span>
                  {subscription && key !== 'free' && !subscription.cancelAtPeriodEnd && (
                    <CancelButton />
                  )}
                  {subscription?.cancelAtPeriodEnd && key !== 'free' && (
                    <p style={{
                      fontSize: '0.8125rem', color: 'var(--text-muted)',
                      textAlign: 'center',
                    }}>
                      Ativo até o fim do período
                    </p>
                  )}
                </div>
              ) : key === 'free' ? (
                <span style={{
                  display: 'block', textAlign: 'center',
                  padding: '10px 0', fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                }}>
                  Plano gratuito
                </span>
              ) : (
                <CheckoutButton
                  plan={key}
                  variant={highlight ? 'accent' : 'outline'}
                  label={`Assinar ${name}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
