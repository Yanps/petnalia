'use client';

import { useState } from 'react';
import { Button } from '@petnalia/ui';
import { createCheckoutSession } from './actions';

interface CheckoutButtonProps {
  readonly plan: 'pro' | 'clinic';
  readonly variant: 'accent' | 'outline';
  readonly label: string;
}

export function CheckoutButton({ plan, variant, label }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const result = await createCheckoutSession(plan);

    if ('error' in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    window.location.href = result.url;
  }

  return (
    <div>
      <Button
        variant={variant}
        size="md"
        block
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? 'Aguarde...' : label}
      </Button>
      {error && (
        <p style={{
          marginTop: 8, fontSize: '0.8125rem',
          color: '#dc2626', textAlign: 'center',
        }}>
          {error}
        </p>
      )}
    </div>
  );
}
