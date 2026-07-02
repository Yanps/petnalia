import { redirect } from 'next/navigation';
import { getSession, getToken } from '@/lib/auth';
import { VetShell } from '@/components/dashboard/vet-shell';

const API = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

async function fetchVerificationStatus(token: string): Promise<string | null> {
  try {
    const res = await fetch(`${API}/v1/veterinarians/me`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { verificationStatus?: string };
    return data.verificationStatus ?? null;
  } catch {
    return null;
  }
}

export default async function VetLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== 'VETERINARIAN') {
    redirect('/entrar');
  }

  const token = await getToken();
  const verificationStatus = token ? await fetchVerificationStatus(token) : null;

  return (
    <div style={{ minHeight: '100vh' }}>
      <VetShell session={session} verificationStatus={verificationStatus}>
        {children}
      </VetShell>
    </div>
  );
}
