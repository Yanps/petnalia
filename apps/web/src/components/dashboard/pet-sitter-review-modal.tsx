'use client';

import { useState } from 'react';

import { Button, Icon } from '@petnalia/ui';

interface PetSitterReviewModalProps {
  bookingId: string;
  onSuccess: () => void;
  onClose: () => void;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div
      style={{ display: 'flex', gap: 6 }}
      onMouseLeave={() => setHovered(0)}
      role="radiogroup"
      aria-label="Nota"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            transition: 'transform 0.1s',
            transform: hovered === n ? 'scale(1.15)' : 'scale(1)',
          }}
        >
          <svg
            width={32}
            height={32}
            viewBox="0 0 24 24"
            fill={n <= active ? '#f59e0b' : 'none'}
            stroke={n <= active ? '#f59e0b' : 'var(--border)'}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

const RATING_LABEL: Record<number, string> = {
  1: 'Péssimo',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente',
};

export function PetSitterReviewModal({ bookingId, onSuccess, onClose }: PetSitterReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError('Selecione uma nota de 1 a 5 estrelas.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/pet-sitter-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          rating,
          text: text.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: { message?: string; code?: string } };
        const code = data.error?.code;
        if (code === 'PET_SITTER_REVIEW_ALREADY_EXISTS') {
          setError('Esta reserva já foi avaliada.');
        } else {
          setError(data.error?.message ?? 'Não foi possível enviar a avaliação.');
        }
        return;
      }
      setDone(true);
      setTimeout(onSuccess, 1200);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 1000,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Avaliar reserva"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 36px',
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {done ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#dcfce7', display: 'grid', placeItems: 'center',
              margin: '0 auto 16px',
            }}>
              <Icon name="check-circle" size={28} style={{ color: '#16a34a' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--text)', marginBottom: 6 }}>
              Avaliação enviada!
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Obrigado pelo seu feedback.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '1.125rem', color: 'var(--text)',
              }}>
                Avaliar reserva
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 4, borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{
                  display: 'block', fontSize: '0.875rem', fontWeight: 600,
                  color: 'var(--text)', marginBottom: 12,
                }}>
                  Nota *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <StarRating value={rating} onChange={setRating} />
                  {rating > 0 && (
                    <span style={{ fontSize: '0.875rem', color: '#f59e0b', fontWeight: 600 }}>
                      {RATING_LABEL[rating]}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: '0.875rem', fontWeight: 600,
                  color: 'var(--text)', marginBottom: 6,
                }}>
                  Comentário
                  <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                    (opcional — {text.length}/1000)
                  </span>
                </label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Conte como foi o cuidado com seu pet..."
                  style={{
                    width: '100%', padding: '10px 14px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9375rem', color: 'var(--text)',
                    boxSizing: 'border-box',
                    outline: 'none', resize: 'vertical',
                    lineHeight: 1.6, fontFamily: 'inherit',
                  }}
                />
              </div>

              {error && (
                <p style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: -8 }}>
                  {error}
                </p>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <Button type="button" variant="ghost" size="md" onClick={onClose} style={{ flex: 1 }}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={submitting || rating === 0} style={{ flex: 1 }}>
                  {submitting ? 'Enviando...' : 'Enviar avaliação'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
}
