'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Avatar, Button, Icon } from '@petnalia/ui';

import { logoutAction } from '@/features/auth/actions';
import type { Session } from '@/lib/auth';

const NAV = [
  { href: '/busca', label: 'Buscar veterinários' },
  { href: '/para-veterinarios', label: 'Para veterinários' },
  { href: '/planos', label: 'Planos' },
] as const;

function dashboardHref(role: Session['role']): string {
  switch (role) {
    case 'TUTOR': return '/painel';
    case 'VETERINARIAN': return '/vet/painel';
    case 'PET_SITTER': return '/pet-sitter/painel';
    case 'ADMIN': return '/admin/verificacao';
  }
}

interface HeaderProps {
  readonly session?: Session | null;
}

export function Header({ session = null }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky', top: 0,
      zIndex: 'var(--z-sticky)' as string,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow-xs)',
    }}>
      <div style={{
        maxWidth: 1152, margin: '0 auto', padding: '0 24px',
        height: 64, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 32,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <span style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'var(--brand)', display: 'grid', placeItems: 'center',
          }}>
            <Icon name="paw-print" size={18} style={{ color: '#fff' }} />
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--text)', letterSpacing: '-0.01em' }}>
            Pet<span style={{ color: 'var(--brand)' }}>Nalia</span>
          </span>
        </Link>

        <nav className="pn-header-nav" style={{ display: 'flex', alignItems: 'center', gap: 28, flex: 1 }}>
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} style={{
              fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
              color: pathname.startsWith(href) ? 'var(--brand)' : 'var(--text-secondary)',
              transition: 'color 0.15s',
            }}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="pn-header-auth" style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {session ? (
            <>
              <Link href={dashboardHref(session.role)} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <Avatar name={session.name} size="sm" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{session.name}</span>
              </Link>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm">Sair</Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/entrar" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="sm">Entrar</Button>
              </Link>
              <Link href="/cadastro" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm">Cadastrar-se</Button>
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — visible only on mobile via CSS */}
        <button
          className="pn-header-hamburger"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          style={{
            padding: '6px', borderRadius: 8,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name={open ? 'x' : 'menu'} size={22} />
        </button>
      </div>

      {open && (
        <div style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          padding: '16px 24px 20px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} style={{
              fontSize: '0.9375rem', fontWeight: 500, textDecoration: 'none',
              color: 'var(--text)',
            }}>
              {label}
            </Link>
          ))}
          {session ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <Link href={dashboardHref(session.role)} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <Avatar name={session.name} size="sm" />
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)' }}>{session.name}</span>
              </Link>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm" block>Sair</Button>
              </form>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <Link href="/entrar" style={{ flex: 1, textDecoration: 'none' }}>
                <Button variant="outline" size="sm" block>Entrar</Button>
              </Link>
              <Link href="/cadastro" style={{ flex: 1, textDecoration: 'none' }}>
                <Button variant="primary" size="sm" block>Cadastrar-se</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
