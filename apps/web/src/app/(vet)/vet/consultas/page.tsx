import type { Appointment } from '@petnalia/types';

import { getToken } from '@/lib/auth';
import { AppointmentsList } from '@/components/dashboard/appointments-list';

const API = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

async function fetchAppointments(token: string): Promise<Appointment[]> {
  try {
    const res = await fetch(`${API}/v1/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    return (await res.json()) as Appointment[];
  } catch {
    return [];
  }
}

export default async function VetConsultasPage() {
  const token = await getToken();
  const appointments = token ? await fetchAppointments(token) : [];

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
        }}>
          Consultas
        </h1>
      </div>

      <AppointmentsList
        initialAppointments={appointments}
        token={token ?? ''}
        role="veterinarian"
        emptyMessage="Nenhuma consulta agendada ainda."
      />
    </div>
  );
}
