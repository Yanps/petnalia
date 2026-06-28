import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function VetLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== 'VETERINARIAN') {
    redirect('/entrar');
  }
  return <>{children}</>;
}
