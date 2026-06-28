import React from 'react';

export type DotStatus = 'online' | 'busy' | 'offline' | 'emergency';

const TONE: Record<DotStatus, { color: string; label: string }> = {
  online:    { color: 'var(--green-500)',   label: 'Disponível agora' },
  busy:      { color: 'var(--warning-500)', label: 'Ocupado' },
  offline:   { color: 'var(--slate-400)',   label: 'Indisponível' },
  emergency: { color: 'var(--error-500)',   label: 'Emergência' },
};

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly status?: DotStatus;
  readonly label?: boolean | string;
  readonly pulse?: boolean;
  readonly size?: number;
}

export function StatusDot({ status = 'online', label, pulse = false, size = 8, className = '', style, ...rest }: StatusDotProps): React.JSX.Element {
  const t = TONE[status];
  const text = label === undefined ? null : (label === true ? t.label : label);
  return (
    <span
      className={['vn-statusdot', className].filter(Boolean).join(' ')}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', ...style }}
      {...rest}
    >
      <span style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {pulse && (
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '9999px',
            background: t.color, opacity: 0.4,
            animation: 'vn-ping 1.6s var(--ease-out) infinite',
          }} />
        )}
        <span style={{ position: 'relative', display: 'block', width: size, height: size, borderRadius: '9999px', background: t.color }} />
      </span>
      {text && (
        <span style={{ fontSize: 'var(--small-size)', color: 'var(--text-secondary)', fontWeight: 'var(--fw-medium)' }}>{text}</span>
      )}
    </span>
  );
}
