import { redirect } from 'next/navigation';
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
  return <>{children}</>;
}
