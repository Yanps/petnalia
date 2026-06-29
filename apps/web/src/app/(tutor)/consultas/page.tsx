import Link from 'next/link';
import { Button } from '@petnalia/ui';
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

export default async function TutorConsultasPage() {
  const token = await getToken();
  const appointments = token ? await fetchAppointments(token) : [];

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
        }}>
          Minhas consultas
        </h1>
      </div>

      <AppointmentsList
        initialAppointments={appointments}
        token={token ?? ''}
        role="tutor"
        emptyMessage="Você ainda não tem consultas."
        emptyAction={
          <Link href="/busca" style={{ textDecoration: 'none', marginTop: 4 }}>
            <Button variant="primary" size="md" iconRight="arrow-right">
              Buscar veterinário
            </Button>
          </Link>
        }
      />
    </div>
  );
}
