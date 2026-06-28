import React from 'react';
import { Icon, type IconName } from '../core/Icon';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly icon?: IconName;
  readonly selected?: boolean;
  readonly onRemove?: (e: React.MouseEvent) => void;
}

export function Chip({ children, icon, selected = false, onRemove, disabled = false, className = '', ...rest }: ChipProps): React.JSX.Element {
  const cls = ['vn-chip', selected && 'vn-chip--selected', className].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} aria-pressed={selected} disabled={disabled} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
      {onRemove && (
        <span
          className="vn-chip__remove"
          role="button"
          aria-label="Remover"
          onClick={(e) => { e.stopPropagation(); onRemove(e); }}
        >
          <Icon name="x" size={14} />
        </span>
      )}
    </button>
  );
}
