import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly interactive?: boolean;
  readonly flat?: boolean;
  readonly pad?: boolean;
  readonly as?: React.ElementType;
}

export function Card({ children, interactive = false, flat = false, pad = false, as: Tag = 'div', className = '', ...rest }: CardProps): React.JSX.Element {
  const cls = [
    'vn-card',
    interactive && 'vn-card--interactive',
    flat && 'vn-card--flat',
    pad && 'vn-card--pad',
    className,
  ].filter(Boolean).join(' ');
  const El: React.ElementType = Tag;
  return <El className={cls} {...rest}>{children}</El>;
}

export interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ children, className = '', ...rest }: CardSectionProps): React.JSX.Element {
  return <div className={['vn-card__header', className].filter(Boolean).join(' ')} {...rest}>{children}</div>;
}

export function CardBody({ children, className = '', ...rest }: CardSectionProps): React.JSX.Element {
  return <div className={['vn-card__body', className].filter(Boolean).join(' ')} {...rest}>{children}</div>;
}

export function CardFooter({ children, className = '', ...rest }: CardSectionProps): React.JSX.Element {
  return <div className={['vn-card__footer', className].filter(Boolean).join(' ')} {...rest}>{children}</div>;
}
