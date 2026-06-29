'use client';

import { useState } from 'react';
import { Icon } from '@petnalia/ui';

const DAYS = [
  { key: 'seg', label: 'Seg' },
  { key: 'ter', label: 'Ter' },
  { key: 'qua', label: 'Qua' },
  { key: 'qui', label: 'Qui' },
  { key: 'sex', label: 'Sex' },
  { key: 'sab', label: 'Sáb' },
  { key: 'dom', label: 'Dom' },
] as const;

type DayKey = (typeof DAYS)[number]['key'];

export default function DisponibilidadePage() {
  const [activeDays, setActiveDays] = useState<Set<DayKey>>(new Set());

  const toggle = (key: DayKey) => {
    setActiveDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>
          Disponibilidade
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Defina os dias em que você está disponível para atendimento.
        </p>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 36px',
          marginBottom: 16,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '1.0625rem', color: 'var(--text)', marginBottom: 20,
          }}>
            Dias disponíveis
          </h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8,
          }}>
            {DAYS.map(({ key, label }) => {
              const active = activeDays.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  disabled
                  onClick={() => toggle(key)}
                  aria-pressed={active}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 6, padding: '12px 8px',
                    background: active ? 'var(--teal-50)' : 'var(--surface-2)',
                    border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'not-allowed',
                    transition: 'background 0.12s, border-color 0.12s',
                  }}
                >
                  <span style={{
                    fontSize: '0.8125rem', fontWeight: 600,
                    color: active ? 'var(--brand)' : 'var(--text-secondary)',
                  }}>
                    {label}
                  </span>
                  <span style={{
                    width: 10, height: 10, borderRadius: 'var(--radius-full)',
                    background: active ? 'var(--brand)' : 'var(--border)',
                    display: 'block',
                    transition: 'background 0.12s',
                  }} />
                </button>
              );
            })}
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          background: 'var(--teal-50)',
          border: '1px solid var(--teal-200)',
          borderRadius: 'var(--radius-md)',
        }}>
          <Icon name="info" size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--brand)', fontWeight: 500 }}>
            Funcionalidade em breve
          </span>
        </div>
      </div>
    </div>
  );
}
