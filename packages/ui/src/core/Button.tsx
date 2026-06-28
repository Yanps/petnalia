import React from 'react';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly block?: boolean;
  readonly iconLeft?: IconName;
  readonly iconRight?: IconName;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  iconLeft,
  iconRight,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}: ButtonProps): React.JSX.Element {
  const cls = [
    'vn-btn',
    `vn-btn--${variant}`,
    size !== 'md' && `vn-btn--${size}`,
    block && 'vn-btn--block',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={cls} disabled={disabled} {...rest}>
      {iconLeft && <Icon name={iconLeft} className="vn-btn__icon" />}
      {children}
      {iconRight && <Icon name={iconRight} className="vn-btn__icon" />}
    </button>
  );
}
