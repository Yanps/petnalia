import { redirect } from 'next/navigation';

import { PetSitterShell } from '@/components/dashboard/pet-sitter-shell';
import { getSession } from '@/lib/auth';

export default async function PetSitterLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== 'PET_SITTER') {
    redirect('/entrar');
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <PetSitterShell session={session}>
        {children}
      </PetSitterShell>
    </div>
  );
}
