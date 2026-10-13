import type { Metadata } from 'next';

import type { PetSitterBooking } from '@petnalia/types';

import { PetSitterBookingsList } from '@/components/dashboard/pet-sitter-bookings-list';
import { getToken } from '@/lib/auth';

export const metadata: Metadata = { title: 'Reservas — Pet sitter' };

const API = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

async function fetchBookings(token: string): Promise<PetSitterBooking[]> {
  try {
    const res = await fetch(`${API}/v1/pet-sitter-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    return (await res.json()) as PetSitterBooking[];
  } catch {
    return [];
  }
}

export default async function PetSitterReservasPage() {
  const token = await getToken();
  const bookings = token ? await fetchBookings(token) : [];

  return (
    <div className="pn-page" style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
        }}>
          Reservas
        </h1>
      </div>

      <PetSitterBookingsList
        initialBookings={bookings}
        token={token ?? ''}
        role="pet_sitter"
        emptyMessage="Nenhuma reserva ainda."
      />
    </div>
  );
}
