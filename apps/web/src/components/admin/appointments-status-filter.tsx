'use client';

import { useRouter } from 'next/navigation';
import type { AppointmentStatus } from '@petnalia/types';

const STATUS_OPTIONS: { value: '' | AppointmentStatus; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'requested', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'pending', label: 'Em análise' },
  { value: 'completed', label: 'Realizada' },
  { value: 'cancelled', label: 'Cancelada' },
];

export function AppointmentsStatusFilter({ current }: { readonly current: string }) {
  const router = useRouter();

  return (
    <select
      value={current}
      onChange={(e) => {
        const value = e.target.value;
        router.push(value ? `/admin/consultas?status=${value}` : '/admin/consultas');
      }}
      aria-label="Filtrar por status"
      style={{
        padding: '8px 12px', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)', fontSize: '0.875rem',
        fontFamily: 'var(--font-sans)', color: 'var(--text)',
        background: 'var(--surface)', outline: 'none',
      }}
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}
