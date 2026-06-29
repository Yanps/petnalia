'use client';

import { useTransition, useState } from 'react';
import Link from 'next/link';
import { Button, Icon } from '@petnalia/ui';
import { registerAction } from './actions';

type Role = 'TUTOR' | 'VETERINARIAN';

const ROLES: { id: Role; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'TUTOR',
    label: 'Sou tutor',
    description: 'Quero cuidar do meu pet',
    icon: <Icon name="heart-handshake" size={20} />,
  },
  {
    id: 'VETERINARIAN',
    label: 'Sou veterinário',
    description: 'Quero atender pets',
    icon: <Icon name="stethoscope" size={20} />,
  },
];

export function RegisterForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [role, setRole] = useState<Role>('TUTOR');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    formData.set('role', role);
    startTransition(async () => {
      try {
        await registerAction(formData);
      } catch {
        setError('Não foi possível criar sua conta. Tente novamente.');
      }
    });
  }

  return (
    <div style={{ width: '100%', maxWidth: 440 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '1.625rem', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8,
        }}>
          Crie sua conta
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Gratuito para tutores, sem cartão de crédito.
        </p>
      </div>

      <div style={{
        background: 'white', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)', padding: '32px',
        boxShadow: 'var(--shadow-md)',
      }}>
        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {ROLES.map(({ id, label, description, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setRole(id)}
              style={{
                padding: '14px 12px', borderRadius: 'var(--radius-md)',
                border: `2px solid ${role === id ? 'var(--brand)' : 'var(--border)'}`,
                background: role === id ? 'var(--teal-50)' : 'var(--surface)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <span style={{ color: role === id ? 'var(--brand)' : 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                {icon}
              </span>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: role === id ? 'var(--brand)' : 'var(--text)', margin: 0 }}>
                {label}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {description}
              </p>
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 'var(--radius-md)',
            background: 'var(--error-50)', border: '1px solid var(--error-100)',
            marginBottom: 20,
          }}>
            <Icon name="alert-circle" size={16} style={{ color: 'var(--error-500)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--error-600)' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
              Nome completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Seu nome"
              disabled={pending}
              style={{
                width: '100%', padding: '10px 14px',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                fontSize: '0.9375rem', color: 'var(--text)',
                fontFamily: 'var(--font-sans)', background: 'var(--surface)',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label htmlFor="reg-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
              E-mail
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              placeholder="seu@email.com.br"
              disabled={pending}
              style={{
                width: '100%', padding: '10px 14px',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                fontSize: '0.9375rem', color: 'var(--text)',
                fontFamily: 'var(--font-sans)', background: 'var(--surface)',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label htmlFor="reg-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
              Senha
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              placeholder="Mínimo 8 caracteres"
              disabled={pending}
              style={{
                width: '100%', padding: '10px 14px',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                fontSize: '0.9375rem', color: 'var(--text)',
                fontFamily: 'var(--font-sans)', background: 'var(--surface)',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" block disabled={pending} style={{ marginTop: 4 }}>
            {pending ? 'Criando conta...' : 'Criar conta grátis'}
          </Button>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            Ao cadastrar-se, você concorda com os{' '}
            <Link href="/termos" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>termos de uso</Link>
            {' '}e a{' '}
            <Link href="/privacidade" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>política de privacidade</Link>.
          </p>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Já tem conta?{' '}
          <Link href="/entrar" style={{ color: 'var(--brand)', fontWeight: 500, textDecoration: 'none' }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
