import React from 'react';

export type PriceTagSize = 'sm' | 'md' | 'lg';

export interface PriceTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly amount: number | string;
  readonly currency?: string;
  readonly from?: boolean;
  readonly unit?: string;
  readonly size?: PriceTagSize;
  readonly strike?: number | string;
}

const SIZE_PX: Record<PriceTagSize, number> = { sm: 15, md: 20, lg: 26 };

function fmt(v: number | string): string {
  return typeof v === 'number' ? v.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) : v;
}

export function PriceTag({ amount, currency = 'R$', from = false, unit, size = 'md', strike, className = '', style, ...rest }: PriceTagProps): React.JSX.Element {
  const fs = SIZE_PX[size];
  return (
    <span
      className={['vn-pricetag', className].filter(Boolean).join(' ')}
      style={{ display: 'inline-flex', alignItems: 'baseline', gap: 'var(--space-1)', ...style }}
      {...rest}
    >
      {from && (
        <span style={{ fontSize: 'var(--caption-size)', color: 'var(--text-muted)', fontWeight: 'var(--fw-medium)' }}>A partir de</span>
      )}
      {strike !== undefined && (
        <span style={{ fontSize: fs * 0.7, color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 'var(--fw-medium)' }}>{currency} {fmt(strike)}</span>
      )}
      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: fs, color: 'var(--text)', letterSpacing: '-0.01em' }}>
        {currency} {fmt(amount)}
      </span>
      {unit && <span style={{ fontSize: 'var(--caption-size)', color: 'var(--text-muted)' }}>/ {unit}</span>}
    </span>
  );
}
