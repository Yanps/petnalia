import type { Metadata } from 'next';

import type { AdminAppointmentListItem, AppointmentStatus } from '@petnalia/types';

import { AppointmentsStatusFilter } from '@/components/admin/appointments-status-filter';
import { AppointmentsTable } from '@/components/admin/appointments-table';
import { getToken } from '@/lib/auth';

export const metadata: Metadata = { title: 'Consultas — Admin' };

const API = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

async function fetchAppointments(token: string, status?: string): Promise<AdminAppointmentListItem[]> {
  try {
    const query = new URLSearchParams({ limit: '50' });
    if (status) query.set('status', status);

    const res = await fetch(`${API}/v1/admin/appointments?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { items: AdminAppointmentListItem[] };
    return json.items ?? [];
  } catch {
    return [];
  }
}

interface AdminConsultasPageProps {
  readonly searchParams: Promise<{ status?: AppointmentStatus }>;
}

export default async function AdminConsultasPage({ searchParams }: AdminConsultasPageProps) {
  const { status } = await searchParams;
  const token = await getToken();
  const appointments = token ? await fetchAppointments(token, status) : [];

  return (
    <main className="pn-page" style={{ padding: '40px 40px 60px', maxWidth: 900 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 16, marginBottom: 32, flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 6,
          }}>
            Consultas
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            Acompanhe todas as consultas agendadas na plataforma.
          </p>
        </div>

        <AppointmentsStatusFilter current={status ?? ''} />
      </div>

      <AppointmentsTable appointments={appointments} />
    </main>
  );
}
