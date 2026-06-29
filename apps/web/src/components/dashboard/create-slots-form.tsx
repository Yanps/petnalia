'use client';

import { useState } from 'react';
import { Button, Icon } from '@petnalia/ui';

interface Slot {
  startsAt: string;
  endsAt: string;
}

interface Props {
  token: string;
}

function formatSlotLabel(slot: Slot): string {
  const s = new Date(slot.startsAt);
  const e = new Date(slot.endsAt);
  return `${s.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })} · ${s.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} – ${e.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

export function CreateSlotsForm({ token }: Props) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [addError, setAddError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  function addSlot() {
    setAddError('');
    if (!startsAt || !endsAt) {
      setAddError('Preencha a data/hora de início e fim.');
      return;
    }
    const s = new Date(startsAt);
    const e = new Date(endsAt);
    if (e <= s) {
      setAddError('O horário de fim deve ser após o início.');
      return;
    }
    setSlots((prev) => [...prev, { startsAt: s.toISOString(), endsAt: e.toISOString() }]);
    setStartsAt('');
    setEndsAt('');
  }

  function removeSlot(idx: number) {
    setSlots((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    if (slots.length === 0) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/availability/slots`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slots }),
      });
      if (!res.ok) throw new Error('Erro ao salvar horários.');
      const data = (await res.json()) as { created: number };
      setSuccess(`${data.created} horário(s) criado(s) com sucesso.`);
      setSlots([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9375rem',
    color: 'var(--text)',
    background: 'var(--surface)',
    width: '100%',
    outline: 'none',
    colorScheme: 'light',
  };

  return (
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
          Adicionar horário
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Início
            </label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Fim
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {addError && (
          <p style={{ fontSize: '0.875rem', color: '#dc2626', marginBottom: 10 }}>{addError}</p>
        )}

        <Button variant="secondary" size="sm" iconLeft="plus" onClick={addSlot}>
          Adicionar à lista
        </Button>

        {slots.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
              Horários a criar ({slots.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {slots.map((slot, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--teal-50)',
                    border: '1px solid var(--teal-200)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>
                    {formatSlotLabel(slot)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSlot(idx)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-secondary)', padding: 4,
                      display: 'grid', placeItems: 'center',
                    }}
                    aria-label="Remover horário"
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {success && (
        <div style={{
          padding: '10px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 'var(--radius-md)', color: '#16a34a',
          fontSize: '0.9rem', marginBottom: 12,
        }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{
          padding: '10px 16px', background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)', color: '#dc2626',
          fontSize: '0.9rem', marginBottom: 12,
        }}>
          {error}
        </div>
      )}

      <Button
        variant="primary"
        size="md"
        onClick={handleSubmit}
        disabled={slots.length === 0 || submitting}
      >
        {submitting ? 'Salvando...' : `Salvar ${slots.length > 0 ? `${slots.length} horário(s)` : 'horários'}`}
      </Button>
    </div>
  );
}
