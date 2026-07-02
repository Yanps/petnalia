import type { Metadata } from 'next';
import type { PendingVetItem } from '@petnalia/types';
import { getToken } from '@/lib/auth';
import { PendingVetsList } from '@/components/admin/pending-vets-list';

export const metadata: Metadata = { title: 'Verificação de CRMV' };

const API = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

async function fetchPendingVets(token: string): Promise<PendingVetItem[]> {
  try {
    const res = await fetch(`${API}/v1/admin/veterinarians/pending?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: PendingVetItem[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function VerificacaoPage() {
  const token = await getToken();
  const vets = token ? await fetchPendingVets(token) : [];

  return (
    <main style={{ padding: '40px 40px 60px', maxWidth: 860 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 6,
        }}>
          Verificação de veterinários
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Revise os CRMVs cadastrados e aprove ou recuse cada solicitação.
        </p>
      </div>

      <PendingVetsList initialVets={vets} token={token ?? ''} />
    </main>
  );
}
