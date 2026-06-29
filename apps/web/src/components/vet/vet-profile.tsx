'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Badge, Button, Icon, Rating, Separator } from '@petnalia/ui';
import type { VetProfilePublicResponse } from '@petnalia/types';

type Tab = 'sobre' | 'avaliacoes';

const TABS: { id: Tab; label: string }[] = [
  { id: 'sobre', label: 'Sobre' },
  { id: 'avaliacoes', label: 'Avaliações' },
];

const TIMES = ['08h00', '09h30', '11h00', '14h00', '15h30', '17h00', '19h00'];

interface Props {
  readonly vet: VetProfilePublicResponse;
}

export function VetProfile({ vet }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('sobre');
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [booked, setBooked] = useState(false);

  function handleBook() {
    if (!selectedTime) return;
    setBooked(true);
    setTimeout(() => router.push('/painel'), 2000);
  }

  const tabLabel = (t: Tab) =>
    t === 'avaliacoes' ? `Avaliações (${vet.totalReviews})` : TABS.find((x) => x.id === t)!.label;

  return (
    <div style={{ maxWidth: 1152, margin: '0 auto', padding: '40px 24px', display: 'flex', gap: 40, alignItems: 'flex-start' }}>
      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Início</a>
          <Icon name="chevron-right" size={14} />
          <a href="/busca" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Busca</a>
          <Icon name="chevron-right" size={14} />
          <span style={{ color: 'var(--text)' }}>{vet.fullName}</span>
        </nav>

        {/* Profile hero */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '32px',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                name={vet.fullName}
                {...(vet.avatarUrl ? { src: vet.avatarUrl } : {})}
                size="xl"
                style={{ width: 96, height: 96, fontSize: '2rem' }}
              />
              {vet.verificationStatus === 'verified' && (
                <span title="Verificado pela PetNalia" style={{
                  position: 'absolute', bottom: -4, right: -4,
                  width: 28, height: 28, borderRadius: 'var(--radius-full)',
                  background: 'var(--brand)', color: '#fff',
                  display: 'grid', placeItems: 'center',
                  border: '2px solid var(--surface)',
                }}>
                  <Icon name="shield-check" size={15} strokeWidth={2.5} />
                </span>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h1 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: '1.5rem', color: 'var(--text)', letterSpacing: '-0.015em', marginBottom: 4,
                  }}>
                    {vet.fullName}
                  </h1>
                  {vet.specialties.length > 0 && (
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                      {vet.specialties.map((s) => s.name).join(' · ')}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Rating value={vet.averageRating} count={vet.totalReviews} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {vet.crmv}-{vet.crmvState}
                    </span>
                    {vet.baseCity && (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        <Icon name="map-pin" size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                        {vet.baseCity}, {vet.baseState}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Badge variant="brand" icon="home">Visita domiciliar</Badge>
                {vet.verificationStatus === 'verified' && (
                  <Badge variant="success" icon="shield-check">Verificado</Badge>
                )}
                <Badge variant="neutral" icon="map-pin">Raio {vet.serviceRadiusKm} km</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '12px 20px', fontSize: '0.9375rem', fontWeight: 500,
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  color: tab === t.id ? 'var(--brand)' : 'var(--text-secondary)',
                  borderBottom: tab === t.id ? '2px solid var(--brand)' : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.15s',
                }}
              >
                {tabLabel(t.id)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Sobre */}
        {tab === 'sobre' && (
          <div>
            {vet.bio ? (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--text)', marginBottom: 12 }}>
                  Sobre
                </h2>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                  {vet.bio}
                </p>
              </>
            ) : (
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                Este veterinário ainda não adicionou uma bio.
              </p>
            )}

            {vet.specialties.length > 0 && (
              <>
                <Separator />
                <div style={{ marginTop: 24 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--text)', marginBottom: 12 }}>
                    Especialidades
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {vet.specialties.map((s) => (
                      <span key={s.id} style={{
                        padding: '6px 14px', borderRadius: 'var(--radius-full)',
                        fontSize: '0.875rem', fontWeight: 500,
                        background: 'var(--brand-subtle, var(--teal-50))',
                        color: 'var(--brand)',
                        border: '1px solid var(--teal-200)',
                      }}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab: Avaliações */}
        {tab === 'avaliacoes' && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <Icon name="star" size={40} style={{ marginBottom: 16, opacity: 0.4 }} />
            <p style={{ fontSize: '0.9375rem' }}>
              {vet.totalReviews === 0
                ? 'Nenhuma avaliação ainda.'
                : `${vet.totalReviews} avaliações · média ${vet.averageRating.toFixed(1)}`}
            </p>
          </div>
        )}
      </div>

      {/* Booking sidebar */}
      <aside style={{
        width: 316, flexShrink: 0,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '24px',
        position: 'sticky', top: 88,
      }}>
        {booked ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: 56, height: 56, background: 'var(--success-50)', borderRadius: 'var(--radius-full)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <Icon name="check-circle" size={28} style={{ color: 'var(--success-500)' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 8 }}>
              Consulta agendada!
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Redirecionando para o painel...
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text)', marginBottom: 16 }}>
              Agendar consulta
            </p>

            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
              Horários disponíveis
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
              {TIMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  style={{
                    padding: '8px 4px', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem', fontWeight: 500,
                    border: `1px solid ${selectedTime === t ? 'var(--brand)' : 'var(--border)'}`,
                    background: selectedTime === t ? 'var(--brand)' : 'var(--surface)',
                    color: selectedTime === t ? 'white' : 'var(--text)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="lg"
              block
              iconLeft="calendar"
              disabled={!selectedTime}
              onClick={handleBook}
            >
              {selectedTime ? `Agendar às ${selectedTime}` : 'Selecione um horário'}
            </Button>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
              Cancelamento gratuito até 24h antes
            </p>
          </>
        )}
      </aside>
    </div>
  );
}
