'use client';

import { useState } from 'react';
import { Button, Icon } from '@petnalia/ui';
import type { Appointment } from '@petnalia/types';

const STATUS_LABEL: Record<Appointment['status'], string> = {
  requested: 'Pendente',
  confirmed: 'Confirmada',
  pending: 'Em análise',
  completed: 'Realizada',
  cancelled: 'Cancelada',
};

const STATUS_COLOR: Record<Appointment['status'], string> = {
  requested: '#d97706',
  confirmed: '#0d9488',
  pending: '#6366f1',
  completed: '#16a34a',
  cancelled: '#dc2626',
};

const STATUS_BG: Record<Appointment['status'], string> = {
  requested: '#fef3c7',
  confirmed: '#f0fdfa',
  pending: '#eef2ff',
  completed: '#f0fdf4',
  cancelled: '#fef2f2',
};


const TABS = ['Todas', 'Agendadas', 'Realizadas', 'Canceladas'] as const;
type Tab = (typeof TABS)[number];

const MODALITY_LABEL: Record<string, string> = {
  home: 'Domiciliar',
  online: 'Teleconsulta',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function filterByTab(appointments: Appointment[], tab: Tab): Appointment[] {
  if (tab === 'Todas') return appointments;
  if (tab === 'Agendadas') return appointments.filter((a) => a.status === 'requested' || a.status === 'confirmed');
  if (tab === 'Realizadas') return appointments.filter((a) => a.status === 'completed');
  return appointments.filter((a) => a.status === 'cancelled');
}

interface Props {
  initialAppointments: Appointment[];
  token: string;
  role: 'tutor' | 'veterinarian';
  emptyMessage: string;
  emptyAction?: React.ReactNode;
}

export function AppointmentsList({ initialAppointments, token, role, emptyMessage, emptyAction }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [activeTab, setActiveTab] = useState<Tab>('Todas');
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = filterByTab(appointments, activeTab);

  async function handleCancel(id: string) {
    setCancelling(id);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/appointments/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Erro ao cancelar consulta.');
      const updated = (await res.json()) as Appointment;
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setCancelling(null);
    }
  }

  async function handleConfirm(id: string) {
    setCancelling(id);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/appointments/${id}/confirm`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erro ao confirmar consulta.');
      const updated = (await res.json()) as Appointment;
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setCancelling(null);
    }
  }

  async function handleComplete(id: string) {
    setCancelling(id);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/appointments/${id}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erro ao concluir consulta.');
      const updated = (await res.json()) as Appointment;
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div>
      <div style={{
        display: 'flex', gap: 4,
        borderBottom: '1px solid var(--border)',
        marginBottom: 28,
      }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 16px', background: 'transparent', border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--brand)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--brand)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab ? 600 : 400,
              fontSize: '0.9375rem', cursor: 'pointer', marginBottom: -1,
              transition: 'color 0.12s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          padding: '10px 16px', background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)', color: '#dc2626',
          fontSize: '0.9rem', marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {visible.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 16, padding: '48px 24px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-full)',
            background: 'var(--teal-50)', display: 'grid', placeItems: 'center',
          }}>
            <Icon name="calendar" size={26} style={{ color: 'var(--brand)' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
              {emptyMessage}
            </p>
          </div>
          {emptyAction}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visible.map((appt) => (
            <div
              key={appt.id}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)', padding: '20px 24px',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{
                    fontSize: '0.8125rem', fontWeight: 600,
                    color: STATUS_COLOR[appt.status],
                    background: STATUS_BG[appt.status],
                    padding: '2px 10px', borderRadius: 100,
                  }}>
                    {STATUS_LABEL[appt.status]}
                  </span>
                  <span style={{
                    fontSize: '0.8125rem', color: 'var(--text-secondary)',
                    background: 'var(--surface-2)', padding: '2px 10px', borderRadius: 100,
                  }}>
                    {MODALITY_LABEL[appt.modality] ?? appt.modality}
                  </span>
                </div>
                <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                  {formatDate(appt.scheduledAt)}
                </p>
                {appt.notes && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {appt.notes}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {role === 'veterinarian' && appt.status === 'requested' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleConfirm(appt.id)}
                    disabled={cancelling === appt.id}
                  >
                    Confirmar
                  </Button>
                )}
                {role === 'veterinarian' && appt.status === 'confirmed' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleComplete(appt.id)}
                    disabled={cancelling === appt.id}
                  >
                    Concluir
                  </Button>
                )}
                {(appt.status === 'requested' || appt.status === 'confirmed') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancel(appt.id)}
                    disabled={cancelling === appt.id}
                  >
                    {cancelling === appt.id ? 'Cancelando...' : 'Cancelar'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
