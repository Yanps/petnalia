import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function PublicLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
