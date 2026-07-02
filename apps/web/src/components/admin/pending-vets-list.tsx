'use client';

import { useState, useTransition } from 'react';
import { Button, Icon } from '@petnalia/ui';
import type { PendingVetItem } from '@petnalia/types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function approveVet(vetId: string, token: string): Promise<void> {
  const res = await fetch(`${API}/v1/admin/veterinarians/${vetId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Falha ao aprovar veterinário.');
}

async function rejectVet(vetId: string, reason: string, token: string): Promise<void> {
  const res = await fetch(`${API}/v1/admin/veterinarians/${vetId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Falha ao recusar veterinário.');
}

interface Props {
  initialVets: PendingVetItem[];
  token: string;
}

export function PendingVetsList({ initialVets, token }: Props) {
  const [vets, setVets] = useState(initialVets);
  const [pending, startTransition] = useTransition();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  function handleApprove(vetId: string) {
    setActionError(null);
    startTransition(async () => {
      try {
        await approveVet(vetId, token);
        setVets((prev) => prev.filter((v) => v.id !== vetId));
      } catch {
        setActionError('Erro ao aprovar veterinário. Tente novamente.');
      }
    });
  }

  function handleRejectConfirm(vetId: string) {
    if (!rejectReason.trim()) return;
    setActionError(null);
    startTransition(async () => {
      try {
        await rejectVet(vetId, rejectReason.trim(), token);
        setVets((prev) => prev.filter((v) => v.id !== vetId));
        setRejectingId(null);
        setRejectReason('');
      } catch {
        setActionError('Erro ao recusar veterinário. Tente novamente.');
      }
    });
  }

  if (vets.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '64px 24px',
        color: 'var(--text-muted)', fontSize: '0.9375rem',
      }}>
        <Icon name="check-circle" size={32} style={{ display: 'block', margin: '0 auto 12px', color: 'var(--success-500)' }} />
        Nenhum veterinário aguardando verificação.
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
        {vets.map((vet) => (
          <div key={vet.id} style={{
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '1rem', margin: '0 0 4px' }}>
                  {vet.fullName}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
                  {vet.email}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                  CRMV {vet.crmvState}: <strong>{vet.crmv}</strong>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Cadastrado em {new Date(vet.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {rejectingId !== vet.id ? (
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pending}
                    onClick={() => { setRejectingId(vet.id); setRejectReason(''); }}
                  >
                    Recusar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={pending}
                    onClick={() => handleApprove(vet.id)}
                  >
                    Aprovar
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 280 }}>
                  <textarea
                    rows={2}
                    placeholder="Motivo da recusa (obrigatório)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    disabled={pending}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)', fontSize: '0.875rem',
                      fontFamily: 'var(--font-sans)', resize: 'vertical', boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="ghost" size="sm" disabled={pending} onClick={() => setRejectingId(null)}>
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={pending || !rejectReason.trim()}
                      onClick={() => handleRejectConfirm(vet.id)}
                    >
                      Confirmar recusa
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
