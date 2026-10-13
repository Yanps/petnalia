import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { getSession } from '@/lib/auth';

export default async function PublicLayout({ children }: { readonly children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header session={session} />
      {children}
      <Footer />
    </div>
  );
}
