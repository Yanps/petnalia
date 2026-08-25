import type { Metadata } from 'next';
import Link from 'next/link';
import type { Appointment, Pet } from '@petnalia/types';
import { Button, Icon } from '@petnalia/ui';

import { getSession, getToken } from '@/lib/auth';

export const metadata: Metadata = { title: 'Painel' };

const API = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐶',
  cat: '🐱',
  bird: '🦜',
  rabbit: '🐰',
  other: '🐾',
};

const STATUS_LABEL: Record<Appointment['status'], string> = {
  requested: 'Pendente',
  confirmed: 'Confirmada',
  pending: 'Em análise',
  completed: 'Realizada',
  cancelled: 'Cancelada',
};

const MODALITY_LABEL: Record<string, string> = {
  home: 'Domiciliar',
  online: 'Teleconsulta',
};

async function safeFetch<T>(url: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function formatScheduledAt(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

export default async function TutorPainelPage() {
  const [session, token] = await Promise.all([getSession(), getToken()]);
  const name = session!.name;

  const [appointments, pets] = await Promise.all([
    token ? safeFetch<Appointment[]>(`${API}/v1/appointments`, token) : null,
    token ? safeFetch<Pet[]>(`${API}/v1/pets`, token) : null,
  ]);

  const allAppointments = appointments ?? [];
  const allPets = pets ?? [];

  const upcoming = allAppointments
    .filter((a) => a.status === 'requested' || a.status === 'confirmed')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3);

  const completedCount = allAppointments.filter((a) => a.status === 'completed').length;

  const stats = [
    { label: 'Consultas agendadas', value: String(upcoming.length), icon: 'calendar' as const },
    { label: 'Pets cadastrados', value: String(allPets.length), icon: 'paw-print' as const },
    { label: 'Consultas realizadas', value: String(completedCount), icon: 'check-circle' as const },
  ];

  return (
    <div className="pn-page" style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
          marginBottom: 6,
        }}>
          Olá, {name}
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Bem-vindo ao seu painel. Aqui você acompanha suas consultas e pets.
        </p>
      </div>

      <div className="pn-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
        {stats.map(({ label, value, icon }) => (
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

      <div className="pn-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Próximas consultas */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '1.0625rem', color: 'var(--text)',
            }}>
              Próximas consultas
            </h2>
            {upcoming.length > 0 && (
              <Link href="/consultas" style={{ fontSize: '0.8125rem', color: 'var(--brand)', textDecoration: 'none' }}>
                Ver todas
              </Link>
            )}
          </div>

          {upcoming.length === 0 ? (
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
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.map((appt) => (
                <div key={appt.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                      {formatScheduledAt(appt.scheduledAt)}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {MODALITY_LABEL[appt.modality] ?? appt.modality}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    padding: '2px 8px', borderRadius: 100,
                    background: appt.status === 'confirmed' ? '#f0fdfa' : '#fef3c7',
                    color: appt.status === 'confirmed' ? '#0d9488' : '#d97706',
                  }}>
                    {STATUS_LABEL[appt.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seus pets */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '1.0625rem', color: 'var(--text)',
            }}>
              Seus pets
            </h2>
            {allPets.length > 0 && (
              <Link href="/pets" style={{ fontSize: '0.8125rem', color: 'var(--brand)', textDecoration: 'none' }}>
                Gerenciar
              </Link>
            )}
          </div>

          {allPets.length === 0 ? (
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
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allPets.slice(0, 4).map((pet) => (
                <div key={pet.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>
                    {SPECIES_EMOJI[pet.species] ?? '🐾'}
                  </span>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{pet.name}</p>
                    {pet.breed && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pet.breed}</p>
                    )}
                  </div>
                </div>
              ))}
              {allPets.length > 4 && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: 4 }}>
                  e mais {allPets.length - 4} pet{allPets.length - 4 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
