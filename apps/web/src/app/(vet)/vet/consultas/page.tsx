'use client';

import { useState } from 'react';
import { Icon } from '@petnalia/ui';

const TABS = ['Todas', 'Agendadas', 'Realizadas', 'Canceladas'] as const;
type Tab = (typeof TABS)[number];

export default function VetConsultasPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Todas');

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
        }}>
          Consultas
        </h1>
      </div>

      <div style={{
        display: 'flex', gap: 4,
        borderBottom: '1px solid var(--border)',
        marginBottom: 32,
      }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--brand)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--brand)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab ? 600 : 400,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'color 0.12s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 16, padding: '48px 24px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 'var(--radius-full)',
          background: 'var(--teal-50)', display: 'grid', placeItems: 'center',
        }}>
          <Icon name="calendar" size={26} style={{ color: 'var(--brand)' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
            Nenhuma consulta agendada ainda.
          </p>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            Complete seu perfil para começar a receber consultas de tutores.
          </p>
        </div>
      </div>
    </div>
  );
}
