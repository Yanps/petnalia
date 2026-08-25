'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, Button, Icon } from '@petnalia/ui';
import type { Session } from '@/lib/auth';
import { logoutAction } from '@/features/auth/actions';

interface VetShellProps {
  readonly session: Session;
  readonly verificationStatus: string | null;
  readonly children: React.ReactNode;
}

const NAV = [
  { href: '/vet/painel', icon: 'home' as const, label: 'Painel' },
  { href: '/vet/consultas', icon: 'calendar' as const, label: 'Consultas', requiresVerified: true },
  { href: '/vet/disponibilidade', icon: 'clock' as const, label: 'Disponibilidade', requiresVerified: true },
  { href: '/vet/perfil', icon: 'user' as const, label: 'Meu perfil' },
  { href: '/vet/area-atendimento', icon: 'map-pin' as const, label: 'Área de atendimento', requiresVerified: true },
  { href: '/vet/assinatura', icon: 'star' as const, label: 'Assinatura', requiresVerified: true },
] as const;

function VerificationBanner({ status }: { status: string }) {
  if (status === 'pending') {
    return (
      <div
        className="pn-verification-banner"
        style={{
          padding: '12px 40px',
          background: '#fefce8',
          borderBottom: '1px solid #fef08a',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: '0.875rem', color: '#713f12',
        }}
      >
        <Icon name="clock" size={16} style={{ flexShrink: 0 }} />
        <span>
          <strong>Conta em análise.</strong> Nossa equipe está verificando seu CRMV. Você será notificado por e-mail em até 24h.
        </span>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div
        className="pn-verification-banner"
        style={{
          padding: '12px 40px',
          background: '#fef2f2',
          borderBottom: '1px solid #fecaca',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: '0.875rem', color: '#7f1d1d',
        }}
      >
        <Icon name="alert-circle" size={16} style={{ flexShrink: 0 }} />
        <span>
          <strong>Verificação não aprovada.</strong> Confira seu e-mail para saber o motivo e entre em contato se precisar de ajuda.
        </span>
      </div>
    );
  }

  return null;
}

export function VetShell({ session, verificationStatus, children }: VetShellProps) {
  const pathname = usePathname();
  const isVerified = verificationStatus === 'verified';
  const [drawerOpen, setDrawerOpen] = useState(false);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {verificationStatus && verificationStatus !== 'verified' && (
        <VerificationBanner status={verificationStatus} />
      )}

      {/* Mobile top bar */}
      <div className="pn-mobile-bar">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'var(--brand)', display: 'grid', placeItems: 'center',
          }}>
            <Icon name="stethoscope" size={14} style={{ color: '#fff' }} />
          </span>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '1.0625rem', color: 'var(--brand)',
          }}>
            PetNalia
          </span>
        </Link>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menu"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', padding: 6,
            borderRadius: 8, display: 'flex', alignItems: 'center',
          }}
        >
          <Icon name="menu" size={22} />
        </button>
      </div>

      {/* Drawer backdrop */}
      <div
        className={`pn-drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={closeDrawer}
      />

      <div className="pn-shell-row" style={{ display: 'flex', flex: 1 }}>
        <aside
          className={`pn-sidebar${drawerOpen ? ' open' : ''}`}
          style={{
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
          }}
        >
          <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            {/* Close button — visible only when drawer is open on mobile */}
            {drawerOpen && (
              <button
                onClick={closeDrawer}
                aria-label="Fechar menu"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 4,
                  borderRadius: 6, display: 'flex', alignItems: 'center',
                }}
              >
                <Icon name="x" size={18} />
              </button>
            )}
          </div>

          <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV.map(({ href, icon, label, ...rest }) => {
              const requiresVerified = 'requiresVerified' in rest ? rest.requiresVerified : false;
              const locked = requiresVerified && !isVerified;
              const active = !locked && (pathname === href || pathname.startsWith(href + '/'));

              return locked ? (
                <div
                  key={href}
                  title="Disponível após verificação do CRMV"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-muted)',
                    borderLeft: '3px solid transparent',
                    fontSize: '0.9375rem',
                    cursor: 'not-allowed',
                    opacity: 0.5,
                  }}
                >
                  <Icon name={icon} size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  {label}
                </div>
              ) : (
                <Link key={href} href={href} style={{ textDecoration: 'none' }} onClick={closeDrawer}>
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
            <form action={logoutAction} style={{ width: '100%' }}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                iconLeft="arrow-right"
                style={{ justifyContent: 'flex-start', width: '100%', color: 'var(--text-secondary)' }}
              >
                Sair
              </Button>
            </form>
          </div>
        </aside>

        <main style={{ flex: 1, minWidth: 0, background: 'var(--surface-2)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
