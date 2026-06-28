import React from 'react';
import { Icon, type IconName } from './Icon';

export type BadgeVariant = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'solid';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly variant?: BadgeVariant;
  readonly icon?: IconName;
  readonly pill?: boolean;
  readonly solid?: boolean;
}

export function Badge({ children, variant = 'neutral', icon, pill = false, solid = false, className = '', ...rest }: BadgeProps): React.JSX.Element {
  const cls = [
    'vn-badge',
    `vn-badge--${variant}`,
    pill && 'vn-badge--pill',
    solid && 'vn-badge--solid',
    className,
  ].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
}
