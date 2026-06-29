'use client';

import { Button, Icon } from '@petnalia/ui';

export default function PetsPage() {
  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 32,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
        }}>
          Meus pets
        </h1>
        <Button variant="primary" size="md" iconLeft="plus" onClick={() => {}}>
          Adicionar pet
        </Button>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 16, padding: '60px 24px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 'var(--radius-full)',
          background: 'var(--teal-50)', display: 'grid', placeItems: 'center',
        }}>
          <Icon name="paw-print" size={30} style={{ color: 'var(--brand)' }} />
        </div>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
            Nenhum pet cadastrado.
          </p>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Adicione seu primeiro pet para facilitar o agendamento de consultas.
          </p>
        </div>
        <Button variant="primary" size="md" iconLeft="plus" onClick={() => {}} style={{ marginTop: 4 }}>
          Adicionar pet
        </Button>
      </div>
    </div>
  );
}
