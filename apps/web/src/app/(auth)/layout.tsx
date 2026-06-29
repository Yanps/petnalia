import Link from 'next/link';
import { Icon } from '@petnalia/ui';

export default function AuthLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, var(--teal-50) 0%, var(--slate-50) 50%, white 100%)',
      display: 'flex', flexDirection: 'column',
    }}>
      <header style={{ padding: '20px 24px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'var(--brand)', display: 'grid', placeItems: 'center',
          }}>
            <Icon name="paw-print" size={16} style={{ color: '#fff' }} />
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
            Pet<span style={{ color: 'var(--brand)' }}>Nalia</span>
          </span>
        </Link>
      </header>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px',
      }}>
        {children}
      </div>
    </div>
  );
}
