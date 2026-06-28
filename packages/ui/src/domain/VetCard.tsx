import React from 'react';
import { Card } from '../core/Card';
import { Avatar } from '../core/Avatar';
import { Badge } from '../core/Badge';
import { Rating } from '../core/Rating';
import { Button } from '../core/Button';
import { Icon } from '../core/Icon';

export interface VetCardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly name: string;
  readonly specialty?: string;
  readonly photo?: string;
  readonly rating?: number;
  readonly reviews?: number;
  readonly distance?: number;
  readonly homeVisit?: boolean;
  readonly online?: boolean;
  readonly nextAvailable?: string;
  readonly price?: string;
  readonly verified?: boolean;
  readonly onSchedule?: React.MouseEventHandler<HTMLButtonElement>;
}

export function VetCard({
  name,
  specialty,
  photo,
  rating,
  reviews,
  distance,
  homeVisit = false,
  online = false,
  nextAvailable,
  price,
  verified = false,
  onSchedule,
  className = '',
  ...rest
}: VetCardProps): React.JSX.Element {
  return (
    <Card interactive className={['vn-vetcard', className].filter(Boolean).join(' ')} {...rest}>
      <div style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-5)' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar src={photo} name={name} size="xl" />
          {verified && (
            <span title="Verificado" style={{
              position: 'absolute', bottom: -2, right: -2, width: 24, height: 24,
              background: 'var(--brand)', color: '#fff', borderRadius: 'var(--radius-full)',
              display: 'grid', placeItems: 'center', border: '2px solid var(--surface)',
            }}>
              <Icon name="shield-check" size={14} strokeWidth={2.5} />
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0, font: `var(--fw-semibold) var(--h4-size)/var(--h4-line) var(--font-sans)`, color: 'var(--text)', letterSpacing: 'var(--h4-track)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</h3>
              {specialty && <p style={{ margin: '2px 0 0', fontSize: 'var(--small-size)', color: 'var(--text-secondary)' }}>{specialty}</p>}
            </div>
            {typeof rating === 'number' && <Rating value={rating} count={reviews} />}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            {homeVisit && <Badge variant="brand" icon="home">Visita domiciliar</Badge>}
            {online && <Badge variant="accent" icon="video">Online</Badge>}
            {typeof distance === 'number' && <Badge variant="neutral" icon="map-pin">{distance.toFixed(1)} km</Badge>}
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)',
        borderTop: '1px solid var(--border)', background: 'var(--surface-2)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          {nextAvailable && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--small-size)', color: 'var(--text)', fontWeight: 'var(--fw-medium)' }}>
              <Icon name="clock" size={15} style={{ color: 'var(--accent)' }} />{nextAvailable}
            </span>
          )}
          {price && <span style={{ fontSize: 'var(--caption-size)', color: 'var(--text-muted)' }}>{price}</span>}
        </div>
        <Button variant="primary" size="sm" iconLeft="calendar" onClick={onSchedule}>Agendar</Button>
      </div>
    </Card>
  );
}
