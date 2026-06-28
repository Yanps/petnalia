import React from 'react';
import { Icon } from './Icon';

export interface RatingProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly value?: number;
  readonly count?: number | undefined;
  readonly showValue?: boolean;
  readonly size?: number;
}

export function Rating({ value = 0, count, showValue = true, size = 16, className = '', ...rest }: RatingProps): React.JSX.Element {
  return (
    <span className={['vn-rating', className].filter(Boolean).join(' ')} {...rest}>
      {showValue && <span className="vn-rating__value">{value.toFixed(1)}</span>}
      <Icon name="star" size={size} className="vn-rating__star" style={{ fill: 'currentColor' }} />
      {typeof count === 'number' && (
        <span className="vn-rating__count">({count.toLocaleString('pt-BR')})</span>
      )}
    </span>
  );
}
