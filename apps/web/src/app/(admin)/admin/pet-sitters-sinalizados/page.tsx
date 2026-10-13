import type { Metadata } from 'next';
import Link from 'next/link';

import type { FlaggedPetSitterItem } from '@petnalia/types';

import { FlaggedPetSittersList } from '@/components/admin/flagged-pet-sitters-list';
import { getToken } from '@/lib/auth';

export const metadata: Metadata = { title: 'Pet sitters sinalizados — Admin' };

const API = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

async function fetchFlaggedPetSitters(token: string): Promise<FlaggedPetSitterItem[]> {
  try {
    const res = await fetch(`${API}/v1/admin/pet-sitters/flagged?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { items: FlaggedPetSitterItem[] };
    return json.items ?? [];
  } catch {
    return [];
  }
}

export default async function PetSittersSinalizadosPage() {
  const token = await getToken();
  const sitters = token ? await fetchFlaggedPetSitters(token) : [];

  return (
    <main className="pn-page" style={{ padding: '40px 40px 60px', maxWidth: 860 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 6,
            }}>
              Pet sitters sinalizados
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              Perfis com termos suspeitos de serviço veterinário na bio. O pet sitter não é avisado até você confirmar a violação.
            </p>
          </div>
          <Link href="/admin/pet-sitters-historico" style={{ fontSize: '0.875rem', color: 'var(--brand)', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Ver histórico →
          </Link>
        </div>
      </div>

      <FlaggedPetSittersList initialSitters={sitters} token={token ?? ''} />
    </main>
  );
}
