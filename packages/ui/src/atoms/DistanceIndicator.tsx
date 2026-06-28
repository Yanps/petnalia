import React from 'react';
import { Icon } from '../core/Icon';

export type DistanceSize = 'sm' | 'md';

export interface DistanceIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly km: number | string;
  readonly label?: string | false;
  readonly size?: DistanceSize;
}

export function DistanceIndicator({ km, label = 'de você', size = 'sm', className = '', style, ...rest }: DistanceIndicatorProps): React.JSX.Element {
  const fs = size === 'md' ? 'var(--small-size)' : 'var(--caption-size)';
  const iconSize = size === 'md' ? 15 : 13;
  const text = typeof km === 'number' ? `${km.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km` : km;
  return (
    <span
      className={['vn-distance', className].filter(Boolean).join(' ')}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: fs, color: 'var(--text-secondary)', fontWeight: 'var(--fw-medium)', ...style }}
      {...rest}
    >
      <Icon name="map-pin" size={iconSize} style={{ color: 'var(--brand)' }} />
      {text}
      {label && <span style={{ color: 'var(--text-muted)', fontWeight: 'var(--fw-regular)' }}>· {label}</span>}
    </span>
  );
}
