import React from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'busy' | 'offline';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly src?: string | undefined;
  readonly name?: string;
  readonly fullName?: string;
  readonly size?: AvatarSize;
  readonly status?: AvatarStatus;
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase();
}

export function Avatar({ src, name, fullName, size = 'md', status, className = '', ...rest }: AvatarProps): React.JSX.Element {
  const who = name ?? fullName ?? '';
  const cls = ['vn-avatar', `vn-avatar--${size}`, className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {src
        ? <img src={src} alt={who} />
        : <span>{initials(who)}</span>
      }
      {status && (
        <span className={`vn-avatar__status vn-avatar__status--${status}`} aria-label={status} />
      )}
    </span>
  );
}
