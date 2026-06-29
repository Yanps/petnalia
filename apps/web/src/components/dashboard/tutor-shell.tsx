'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, Button, Icon } from '@petnalia/ui';
import type { Session } from '@/lib/auth';

interface TutorShellProps {
  readonly session: Session;
  readonly children: React.ReactNode;
}

const NAV = [
  { href: '/painel', icon: 'home' as const, label: 'Painel' },
  { href: '/consultas', icon: 'calendar' as const, label: 'Consultas' },
  { href: '/pets', icon: 'paw-print' as const, label: 'Meus pets' },
  { href: '/perfil', icon: 'user' as const, label: 'Meu perfil' },
] as const;

export function TutorShell({ session, children }: TutorShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 240,
        flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '24px 20px 20px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span style={{
              width: 32, height: 32, borderRadius: 'var(--radius-md)',
              background: 'var(--brand)', display: 'grid', placeItems: 'center',
            }}>
              <Icon name="stethoscope" size={16} style={{ color: '#fff' }} />
            </span>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '1.125rem', color: 'var(--brand)', letterSpacing: '-0.01em',
            }}>
              PetNalia
            </span>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ href, icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: active ? 'var(--teal-50)' : 'transparent',
                  color: active ? 'var(--brand)' : 'var(--text-secondary)',
                  borderLeft: active ? '3px solid var(--brand)' : '3px solid transparent',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.9375rem',
                  transition: 'background 0.12s, color 0.12s',
                  cursor: 'pointer',
                }}>
                  <Icon name={icon} size={18} style={{ color: active ? 'var(--brand)' : 'var(--text-secondary)', flexShrink: 0 }} />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={session.name} size="sm" />
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: '0.875rem', fontWeight: 600,
                color: 'var(--text)', whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {session.name}
              </p>
              <p style={{
                fontSize: '0.75rem', color: 'var(--text-muted)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {session.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconLeft="arrow-right"
            onClick={() => router.push('/entrar')}
            style={{ justifyContent: 'flex-start', width: '100%', color: 'var(--text-secondary)' }}
          >
            Sair
          </Button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, background: 'var(--surface-2)' }}>
        {children}
      </main>
    </div>
  );
}
