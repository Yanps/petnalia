import React from 'react';

export interface CalendarDayProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly dow?: string;
  readonly day: number | string;
  readonly selected?: boolean;
  readonly today?: boolean;
  readonly available?: boolean;
}

export function CalendarDay({ dow, day, selected = false, today = false, disabled = false, available = false, onClick, className = '', ...rest }: CalendarDayProps): React.JSX.Element {
  const bg = selected ? 'var(--brand)' : 'var(--surface)';
  const fg = selected ? '#fff' : disabled ? 'var(--text-disabled)' : 'var(--text)';
  const border = selected ? 'var(--brand)' : today ? 'var(--brand-border)' : 'var(--border)';
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      aria-current={today ? 'date' : undefined}
      onClick={onClick}
      className={['vn-calday', className].filter(Boolean).join(' ')}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        padding: '8px 0', minWidth: 48, borderRadius: 'var(--radius-md)',
        border: `1.5px solid ${border}`, background: bg,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all var(--motion-fast) var(--ease-standard)',
      }}
      {...rest}
    >
      {dow && (
        <span style={{ fontSize: 11, fontWeight: 600, color: selected ? 'rgba(255,255,255,0.82)' : 'var(--text-muted)' }}>{dow}</span>
      )}
      <span style={{ fontSize: 17, fontWeight: 700, color: fg }}>{day}</span>
      <span style={{ width: 5, height: 5, borderRadius: '9999px', background: available && !selected ? 'var(--accent)' : 'transparent' }} />
    </button>
  );
}
