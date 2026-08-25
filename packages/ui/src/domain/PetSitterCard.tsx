import React from 'react';
import { Card } from '../core/Card';
import { Avatar } from '../core/Avatar';
import { Badge } from '../core/Badge';
import { Rating } from '../core/Rating';
import { Button } from '../core/Button';
import { Icon, type IconName } from '../core/Icon';

export type PetSitterServiceTag = 'hospedagem' | 'passeio' | 'day_care' | 'visita_domiciliar';

const SERVICE_LABEL: Record<PetSitterServiceTag, string> = {
  hospedagem: 'Hospedagem',
  passeio: 'Passeio',
  day_care: 'Day care',
  visita_domiciliar: 'Visita domiciliar',
};

const SERVICE_ICON: Record<PetSitterServiceTag, IconName> = {
  hospedagem: 'home',
  passeio: 'paw-print',
  day_care: 'clock',
  visita_domiciliar: 'map-pin',
};

export interface PetSitterCardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly name: string;
  readonly photo?: string;
  readonly bio?: string;
  readonly services: readonly PetSitterServiceTag[];
  readonly distance?: number;
  readonly city?: string;
  readonly rating?: number;
  readonly reviews?: number;
  readonly onViewMore?: React.MouseEventHandler<HTMLButtonElement>;
  readonly viewMoreLabel?: string;
}

export function PetSitterCard({
  name,
  photo,
  bio,
  services,
  distance,
  city,
  rating,
  reviews,
  onViewMore,
  viewMoreLabel = 'Ver mais',
  className = '',
  ...rest
}: PetSitterCardProps): React.JSX.Element {
  return (
    <Card interactive className={['vn-vetcard', className].filter(Boolean).join(' ')} {...rest}>
      <div style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-5)', flex: 1 }}>
        <Avatar src={photo} name={name} size="xl" style={{ flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
            <h3 style={{
              margin: 0, font: `var(--fw-semibold) var(--body-size)/var(--body-line) var(--font-sans)`,
              color: 'var(--text)', letterSpacing: 'var(--h4-track)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {name}
            </h3>
            {typeof rating === 'number' && <span style={{ flexShrink: 0 }}><Rating value={rating} count={reviews} /></span>}
          </div>

          {(city || typeof distance === 'number') && (
            <p style={{ margin: '2px 0 0', fontSize: 'var(--small-size)', color: 'var(--text-secondary)' }}>
              {city}
              {city && typeof distance === 'number' && ' · '}
              {typeof distance === 'number' && `${distance.toFixed(1)} km`}
            </p>
          )}

          {bio && (
            <p style={{
              margin: 'var(--space-2) 0 0', fontSize: 'var(--small-size)', color: 'var(--text-secondary)',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {bio}
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            {services.map((s) => (
              <Badge key={s} variant="neutral" icon={SERVICE_ICON[s]}>{SERVICE_LABEL[s]}</Badge>
            ))}
          </div>
        </div>
      </div>

      {onViewMore && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)',
          borderTop: '1px solid var(--border)', background: 'var(--surface-2)',
        }}>
          <Button variant="primary" size="sm" iconLeft="paw-print" onClick={onViewMore}>{viewMoreLabel}</Button>
        </div>
      )}
    </Card>
  );
}
