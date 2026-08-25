'use client';

import { useState } from 'react';
import { Button, Icon } from '@petnalia/ui';
import { PET_SITTER_SERVICE_LABELS, type PetSitterBooking } from '@petnalia/types';

import { PetSitterReviewModal } from './pet-sitter-review-modal';

const STATUS_LABEL: Record<PetSitterBooking['status'], string> = {
  requested: 'Pendente',
  confirmed: 'Confirmada',
  completed: 'Realizada',
  cancelled: 'Cancelada',
};

const STATUS_COLOR: Record<PetSitterBooking['status'], string> = {
  requested: '#d97706',
  confirmed: '#0d9488',
  completed: '#16a34a',
  cancelled: '#dc2626',
};

const STATUS_BG: Record<PetSitterBooking['status'], string> = {
  requested: '#fef3c7',
  confirmed: '#f0fdfa',
  completed: '#f0fdf4',
  cancelled: '#fef2f2',
};

const TABS = ['Todas', 'Agendadas', 'Realizadas', 'Canceladas'] as const;
type Tab = (typeof TABS)[number];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function filterByTab(bookings: PetSitterBooking[], tab: Tab): PetSitterBooking[] {
  if (tab === 'Todas') return bookings;
  if (tab === 'Agendadas') return bookings.filter((b) => b.status === 'requested' || b.status === 'confirmed');
  if (tab === 'Realizadas') return bookings.filter((b) => b.status === 'completed');
  return bookings.filter((b) => b.status === 'cancelled');
}

interface Props {
  initialBookings: PetSitterBooking[];
  token: string;
  role: 'tutor' | 'pet_sitter';
  emptyMessage: string;
  emptyAction?: React.ReactNode;
}

export function PetSitterBookingsList({ initialBookings, token, role, emptyMessage, emptyAction }: Props) {
  const [bookings, setBookings] = useState<PetSitterBooking[]>(initialBookings);
  const [activeTab, setActiveTab] = useState<Tab>('Todas');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const visible = filterByTab(bookings, activeTab);

  async function transition(id: string, action: 'confirm' | 'cancel' | 'complete', errorMessage: string) {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/pet-sitter-bookings/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        ...(action === 'cancel' ? { body: JSON.stringify({}) } : {}),
      });
      if (!res.ok) throw new Error(errorMessage);
      const updated = (await res.json()) as PetSitterBooking;
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setUpdatingId(null);
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
          {visible.map((booking) => (
            <div
              key={booking.id}
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
                    color: STATUS_COLOR[booking.status],
                    background: STATUS_BG[booking.status],
                    padding: '2px 10px', borderRadius: 100,
                  }}>
                    {STATUS_LABEL[booking.status]}
                  </span>
                  <span style={{
                    fontSize: '0.8125rem', color: 'var(--text-secondary)',
                    background: 'var(--surface-2)', padding: '2px 10px', borderRadius: 100,
                  }}>
                    {PET_SITTER_SERVICE_LABELS[booking.service]}
                  </span>
                </div>
                <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                  {formatDate(booking.scheduledAt)}
                </p>
                {booking.notes && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {booking.notes}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                {role === 'pet_sitter' && booking.status === 'requested' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => transition(booking.id, 'confirm', 'Erro ao confirmar reserva.')}
                    disabled={updatingId === booking.id}
                  >
                    Confirmar
                  </Button>
                )}
                {role === 'pet_sitter' && booking.status === 'confirmed' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => transition(booking.id, 'complete', 'Erro ao concluir reserva.')}
                    disabled={updatingId === booking.id}
                  >
                    Concluir
                  </Button>
                )}
                {(booking.status === 'requested' || booking.status === 'confirmed') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => transition(booking.id, 'cancel', 'Erro ao cancelar reserva.')}
                    disabled={updatingId === booking.id}
                  >
                    {updatingId === booking.id ? 'Cancelando...' : 'Cancelar'}
                  </Button>
                )}
                {role === 'tutor' && booking.status === 'completed' && (
                  reviewedIds.has(booking.id) ? (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: '0.8125rem', fontWeight: 600, color: '#16a34a',
                    }}>
                      <Icon name="check-circle" size={14} style={{ color: '#16a34a' }} />
                      Avaliada
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReviewingId(booking.id)}
                    >
                      Avaliar
                    </Button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewingId && (
        <PetSitterReviewModal
          bookingId={reviewingId}
          token={token}
          onSuccess={() => {
            setReviewedIds((prev) => new Set(prev).add(reviewingId));
            setReviewingId(null);
          }}
          onClose={() => setReviewingId(null)}
        />
      )}
    </div>
  );
}
