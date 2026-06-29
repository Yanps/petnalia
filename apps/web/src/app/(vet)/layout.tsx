import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { VetShell } from '@/components/dashboard/vet-shell';

export default async function VetLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== 'VETERINARIAN') {
    redirect('/entrar');
  }
  return (
    <div style={{ minHeight: '100vh' }}>
      <VetShell session={session}>{children}</VetShell>
    </div>
  );
}
