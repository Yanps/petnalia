import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Usuários — Admin' };

export default function UsuariosPage() {
  return (
    <main>
      <h1>Usuários</h1>
      {/* TODO: users table, role management, account suspension */}
    </main>
  );
}
