import React from 'react';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly orientation?: 'horizontal' | 'vertical';
}

export function Separator({ orientation = 'horizontal', className = '', style, ...rest }: SeparatorProps): React.JSX.Element {
  const cls = ['vn-sep', orientation === 'vertical' ? 'vn-sep--v' : 'vn-sep--h', className].filter(Boolean).join(' ');
  return <div role="separator" aria-orientation={orientation} className={cls} style={style} {...rest} />;
}
