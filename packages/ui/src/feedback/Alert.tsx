import React from 'react';
import { Icon, type IconName } from '../core/Icon';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const VARIANT_ICONS: Record<AlertVariant, IconName> = {
  info:    'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  error:   'alert-circle',
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly variant?: AlertVariant;
  readonly title?: string;
  readonly icon?: IconName;
}

export function Alert({ variant = 'info', title, children, icon, className = '', ...rest }: AlertProps): React.JSX.Element {
  const iconName = icon ?? VARIANT_ICONS[variant];
  return (
    <div role="alert" className={['vn-alert', `vn-alert--${variant}`, className].filter(Boolean).join(' ')} {...rest}>
      {iconName && <Icon name={iconName} className="vn-alert__icon" />}
      <div className="vn-alert__body">
        {title && <div className="vn-alert__title">{title}</div>}
        {children && <div className="vn-alert__desc">{children}</div>}
      </div>
    </div>
  );
}
