import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReviewedPetSitterItem } from '@petnalia/types';
import { getToken } from '@/lib/auth';
import { ReviewedPetSittersList } from '@/components/admin/reviewed-pet-sitters-list';

export const metadata: Metadata = { title: 'Histórico de moderação — Admin' };

const API = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

async function fetchReviewedPetSitters(token: string): Promise<ReviewedPetSitterItem[]> {
  try {
    const res = await fetch(`${API}/v1/admin/pet-sitters/reviewed?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { items: ReviewedPetSitterItem[] };
    return json.items ?? [];
  } catch {
    return [];
  }
}

export default async function PetSittersHistoricoPage() {
  const token = await getToken();
  const sitters = token ? await fetchReviewedPetSitters(token) : [];

  return (
    <main className="pn-page" style={{ padding: '40px 40px 60px', maxWidth: 860 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 6,
            }}>
              Histórico de moderação
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              Perfis de pet sitter já revisados — violações confirmadas e sinalizações descartadas como falso positivo.
            </p>
          </div>
          <Link href="/admin/pet-sitters-sinalizados" style={{ fontSize: '0.875rem', color: 'var(--brand)', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            ← Sinalizados
          </Link>
        </div>
      </div>

      <ReviewedPetSittersList sitters={sitters} />
    </main>
  );
}
