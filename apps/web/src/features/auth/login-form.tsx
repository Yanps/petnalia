'use client';

import { useTransition, useState } from 'react';
import Link from 'next/link';
import { Button, Icon } from '@petnalia/ui';
import { loginAction } from './actions';

export function LoginForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await loginAction(formData);
      } catch {
        setError('E-mail ou senha inválidos. Tente novamente.');
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
          Bem-vindo de volta
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Entre na sua conta PetNalia
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
                transition: 'border-color 0.15s',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>
                Senha
              </label>
              <Link href="/recuperar-senha" style={{ fontSize: '0.8125rem', color: 'var(--brand)', textDecoration: 'none' }}>
                Esqueci a senha
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Mínimo 8 caracteres"
                disabled={pending}
                style={{
                  width: '100%', padding: '10px 44px 10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: '0.9375rem', color: 'var(--text)',
                  fontFamily: 'var(--font-sans)',
                  background: 'var(--surface)',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex', padding: 2,
                }}
                tabIndex={-1}
              >
                <Icon name={showPassword ? 'x' : 'check'} size={16} />
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" block disabled={pending}>
            {pending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Não tem conta?{' '}
          <Link href="/cadastro" style={{ color: 'var(--brand)', fontWeight: 500, textDecoration: 'none' }}>
            Cadastre-se grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
