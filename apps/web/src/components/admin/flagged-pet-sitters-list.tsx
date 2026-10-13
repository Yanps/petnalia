'use client';

import { useState, useTransition } from 'react';

import type { FlaggedPetSitterItem } from '@petnalia/types';
import { Badge, Button } from '@petnalia/ui';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function confirmViolation(id: string, moderatorNote: string, token: string): Promise<void> {
  const res = await fetch(`${API}/v1/admin/pet-sitters/${id}/confirm-violation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ moderatorNote }),
  });
  if (!res.ok) throw new Error('Falha ao confirmar violação.');
}

async function dismissFlag(id: string, token: string): Promise<void> {
  const res = await fetch(`${API}/v1/admin/pet-sitters/${id}/dismiss`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Falha ao descartar sinalização.');
}

interface Props {
  readonly initialSitters: FlaggedPetSitterItem[];
  readonly token: string;
}

export function FlaggedPetSittersList({ initialSitters, token }: Props) {
  const [sitters, setSitters] = useState(initialSitters);
  const [pending, startTransition] = useTransition();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [moderatorNote, setModeratorNote] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  function handleDismiss(id: string) {
    setActionError(null);
    startTransition(async () => {
      try {
        await dismissFlag(id, token);
        setSitters((prev) => prev.filter((s) => s.id !== id));
      } catch {
        setActionError('Erro ao descartar sinalização. Tente novamente.');
      }
    });
  }

  function handleConfirm(id: string) {
    if (!moderatorNote.trim()) return;
    setActionError(null);
    startTransition(async () => {
      try {
        await confirmViolation(id, moderatorNote.trim(), token);
        setSitters((prev) => prev.filter((s) => s.id !== id));
        setConfirmingId(null);
        setModeratorNote('');
      } catch {
        setActionError('Erro ao confirmar violação. Tente novamente.');
      }
    });
  }

  if (sitters.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
        Nenhum perfil de pet sitter sinalizado no momento.
      </div>
    );
  }

  return (
    <div>
      {actionError && (
        <div style={{
          marginBottom: 16, padding: '12px 16px', borderRadius: 'var(--radius-md)',
          background: 'var(--error-50)', border: '1px solid var(--error-100)',
          fontSize: '0.875rem', color: 'var(--error-600)',
        }}>
          {actionError}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sitters.map((sitter) => (
          <div key={sitter.id} style={{
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '1rem', margin: 0 }}>
                    {sitter.fullName}
                  </p>
                  {sitter.flagReason && <Badge variant="warning">termo: {sitter.flagReason}</Badge>}
                  {sitter.violationCount > 0 && (
                    <Badge variant="error">
                      reincidente · {sitter.violationCount} {sitter.violationCount === 1 ? 'violação confirmada' : 'violações confirmadas'}
                    </Badge>
                  )}
                </div>
                {sitter.bio && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 4px', lineHeight: 1.5 }}>
                    {sitter.bio}
                  </p>
                )}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Sinalizado em {new Date(sitter.updatedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {confirmingId !== sitter.id ? (
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pending}
                    onClick={() => handleDismiss(sitter.id)}
                  >
                    Não é violação
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={pending}
                    onClick={() => { setConfirmingId(sitter.id); setModeratorNote(''); }}
                  >
                    Confirmar violação
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 280 }}>
                  <textarea
                    rows={2}
                    placeholder="O que o pet sitter precisa corrigir? (obrigatório, vai no e-mail para ele)"
                    value={moderatorNote}
                    onChange={(e) => setModeratorNote(e.target.value)}
                    disabled={pending}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)', fontSize: '0.875rem',
                      fontFamily: 'var(--font-sans)', resize: 'vertical', boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="ghost" size="sm" disabled={pending} onClick={() => setConfirmingId(null)}>
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={pending || !moderatorNote.trim()}
                      onClick={() => handleConfirm(sitter.id)}
                    >
                      Confirmar e notificar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
