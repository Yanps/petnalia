import { Badge } from '@petnalia/ui';
import type { AdminAppointmentListItem } from '@petnalia/types';

const STATUS_LABEL: Record<AdminAppointmentListItem['status'], string> = {
  requested: 'Pendente',
  confirmed: 'Confirmada',
  pending: 'Em análise',
  completed: 'Realizada',
  cancelled: 'Cancelada',
};

const STATUS_VARIANT: Record<AdminAppointmentListItem['status'], 'warning' | 'brand' | 'info' | 'success' | 'error'> = {
  requested: 'warning',
  confirmed: 'brand',
  pending: 'info',
  completed: 'success',
  cancelled: 'error',
};

const MODALITY_LABEL: Record<AdminAppointmentListItem['modality'], string> = {
  home: 'Domiciliar',
  online: 'Telemedicina',
};

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface Props {
  readonly appointments: AdminAppointmentListItem[];
}

export function AppointmentsTable({ appointments }: Props) {
  if (appointments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
        Nenhuma consulta encontrada.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {appointments.map((appt) => (
        <div key={appt.id} style={{
          background: 'white', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9375rem', margin: '0 0 4px' }}>
              {appt.tutorName} → {appt.vetName}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              {appt.petName} · {MODALITY_LABEL[appt.modality]}
            </p>
          </div>

          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
            {new Date(appt.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
          </span>

          <span style={{ fontSize: '0.875rem', color: 'var(--text)', fontWeight: 500, flexShrink: 0 }}>
            {formatPrice(appt.priceCents)}
          </span>

          <Badge variant={STATUS_VARIANT[appt.status]}>{STATUS_LABEL[appt.status]}</Badge>
        </div>
      ))}
    </div>
  );
}
