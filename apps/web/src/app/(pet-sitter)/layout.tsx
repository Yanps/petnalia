import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { PetSitterShell } from '@/components/dashboard/pet-sitter-shell';

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
