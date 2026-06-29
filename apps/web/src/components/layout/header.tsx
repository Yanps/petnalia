'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button, Icon } from '@petnalia/ui';

const NAV = [
  { href: '/busca', label: 'Buscar veterinários' },
  { href: '/para-veterinarios', label: 'Para veterinários' },
  { href: '/planos', label: 'Planos' },
] as const;

export function Header() {
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

        <nav style={{ display: 'flex', alignItems: 'center', gap: 28, flex: 1 }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <Link href="/entrar" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm">Entrar</Button>
          </Link>
          <Link href="/cadastro" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="sm">Cadastrar-se</Button>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            style={{
              display: 'none',
              padding: '6px', borderRadius: 8,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <Icon name={open ? 'x' : 'menu'} size={20} />
          </button>
        </div>
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
          <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <Link href="/entrar" style={{ flex: 1, textDecoration: 'none' }}>
              <Button variant="outline" size="sm" block>Entrar</Button>
            </Link>
            <Link href="/cadastro" style={{ flex: 1, textDecoration: 'none' }}>
              <Button variant="primary" size="sm" block>Cadastrar-se</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
