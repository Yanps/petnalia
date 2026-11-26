import { redirect } from 'next/navigation';

import { TutorShell } from '@/components/dashboard/tutor-shell';
import { getSession } from '@/lib/auth';

export default async function TutorLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== 'TUTOR') {
    redirect('/entrar');
  }
  return (
    <div style={{ minHeight: '100vh' }}>
      <TutorShell session={session}>{children}</TutorShell>
    </div>
  );
}
