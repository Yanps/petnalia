import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly width?: number | string;
  readonly height?: number | string;
  readonly radius?: number | string;
  readonly circle?: boolean;
}

export function Skeleton({ width, height = 16, radius, circle = false, className = '', style, ...rest }: SkeletonProps): React.JSX.Element {
  const s: React.CSSProperties = {
    width: circle ? height : width,
    height,
    borderRadius: circle ? '9999px' : radius,
    ...style,
  };
  return <div className={['vn-skel', className].filter(Boolean).join(' ')} style={s} {...rest} />;
}
