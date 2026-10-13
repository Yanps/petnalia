'use client';

import Link from 'next/link';
import { useTransition, useState } from 'react';

import { Button, Icon } from '@petnalia/ui';

import { resetPasswordAction } from './actions';

export function ResetPasswordForm({ token }: { readonly token: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);

    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    const confirmPassword = (e.currentTarget.elements.namedItem('confirmPassword') as HTMLInputElement).value;
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await resetPasswordAction(formData);
      } catch {
        setError('Este link é inválido ou expirou. Solicite um novo.');
      }
    });
  }

  if (!token) {
    return (
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Link de redefinição inválido ou incompleto.
        </p>
        <Link href="/recuperar-senha" style={{ color: 'var(--brand)', fontWeight: 500, textDecoration: 'none' }}>
          Solicitar novo link
        </Link>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '1.625rem', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8,
        }}>
          Escolha uma nova senha
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Sua nova senha deve ter no mínimo 8 caracteres
        </p>
      </div>

      <div style={{
        background: 'white', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)', padding: '32px',
        boxShadow: 'var(--shadow-md)',
      }}>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <input type="hidden" name="token" value={token} />

          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
              Nova senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              disabled={pending}
              style={{
                width: '100%', padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                fontSize: '0.9375rem', color: 'var(--text)',
                fontFamily: 'var(--font-sans)',
                background: 'var(--surface)',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              placeholder="Repita a senha"
              disabled={pending}
              style={{
                width: '100%', padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                fontSize: '0.9375rem', color: 'var(--text)',
                fontFamily: 'var(--font-sans)',
                background: 'var(--surface)',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" block disabled={pending}>
            {pending ? 'Redefinindo...' : 'Redefinir senha'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Lembrou a senha?{' '}
          <Link href="/entrar" style={{ color: 'var(--brand)', fontWeight: 500, textDecoration: 'none' }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
