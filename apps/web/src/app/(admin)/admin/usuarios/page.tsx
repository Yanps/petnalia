import type { Metadata } from 'next';
import type { AdminUserListItem } from '@petnalia/types';
import { getSession, getToken } from '@/lib/auth';
import { UsersList } from '@/components/admin/users-list';

export const metadata: Metadata = { title: 'Usuários — Admin' };

const API = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

async function fetchUsers(token: string): Promise<AdminUserListItem[]> {
  try {
    const res = await fetch(`${API}/v1/admin/users?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { items: AdminUserListItem[] };
    return json.items ?? [];
  } catch {
    return [];
  }
}

export default async function UsuariosPage() {
  const session = await getSession();
  const token = await getToken();
  const users = token ? await fetchUsers(token) : [];

  return (
    <main className="pn-page" style={{ padding: '40px 40px 60px', maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 6,
        }}>
          Usuários
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Gerencie contas de tutores, veterinários e administradores.
        </p>
      </div>

      <UsersList initialUsers={users} currentUserId={session?.userId ?? ''} token={token ?? ''} />
    </main>
  );
}
