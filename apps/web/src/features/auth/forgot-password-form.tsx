'use client';

import { useTransition, useState } from 'react';
import Link from 'next/link';
import { Button, Icon } from '@petnalia/ui';
import { forgotPasswordAction } from './actions';

export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await forgotPasswordAction(formData);
        setSent(true);
      } catch {
        setError('Não foi possível enviar o e-mail. Tente novamente.');
      }
    });
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '1.625rem', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8,
        }}>
          Recuperar senha
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Informe seu e-mail e enviaremos um link para redefinir sua senha
        </p>
      </div>

      <div style={{
        background: 'white', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)', padding: '32px',
        boxShadow: 'var(--shadow-md)',
      }}>
        {sent ? (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '14px 16px', borderRadius: 'var(--radius-md)',
            background: 'var(--teal-50)', border: '1px solid var(--teal-100)',
          }}>
            <Icon name="check" size={16} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.5 }}>
              Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha em breve.
            </span>
          </div>
        ) : (
          <>
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
              <div>
                <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com.br"
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
                {pending ? 'Enviando...' : 'Enviar link de recuperação'}
              </Button>
            </form>
          </>
        )}

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
