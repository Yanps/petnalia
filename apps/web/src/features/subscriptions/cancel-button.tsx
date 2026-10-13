'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@petnalia/ui';

import { cancelSubscription } from './actions';

export function CancelButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    setError(null);

    const result = await cancelSubscription();

    if ('error' in result) {
      setError(result.error);
      setLoading(false);
      setConfirming(false);
      return;
    }

    router.refresh();
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Cancelar no final do período?
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" size="sm" block onClick={() => setConfirming(false)} disabled={loading}>
            Manter
          </Button>
          <Button variant="primary" size="sm" block onClick={() => void handleConfirm()} disabled={loading}>
            {loading ? 'Aguarde...' : 'Confirmar'}
          </Button>
        </div>
        {error && (
          <p style={{ fontSize: '0.8125rem', color: '#dc2626', textAlign: 'center' }}>{error}</p>
        )}
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" block onClick={() => setConfirming(true)}>
      Cancelar assinatura
    </Button>
  );
}
