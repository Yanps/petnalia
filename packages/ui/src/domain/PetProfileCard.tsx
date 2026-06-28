import React from 'react';
import { Card } from '../core/Card';
import { Badge } from '../core/Badge';
import { Icon } from '../core/Icon';

export interface PetVital {
  readonly k: string;
  readonly v?: string | undefined;
}

export interface PetProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly name: string;
  readonly species?: string;
  readonly breed?: string;
  readonly ageLabel?: string;
  readonly weight?: string;
  readonly sex?: string;
  readonly photo?: string;
  readonly neutered?: boolean;
  readonly microchip?: boolean;
}

export function PetProfileCard({
  name,
  species = 'Cão',
  breed,
  ageLabel,
  weight,
  sex,
  photo,
  neutered,
  microchip,
  className = '',
  ...rest
}: PetProfileCardProps): React.JSX.Element {
  const vitals: readonly PetVital[] = [
    { k: 'Idade', v: ageLabel },
    { k: 'Peso', v: weight },
    { k: 'Espécie', v: species },
  ];

  return (
    <Card pad className={className} {...rest}>
      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
        <div style={{
          width: 64, height: 64, flexShrink: 0, borderRadius: 'var(--radius-lg)',
          overflow: 'hidden', background: 'var(--brand-subtle)', display: 'grid', placeItems: 'center',
          color: 'var(--brand-active)',
        }}>
          {photo
            ? <img src={photo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Icon name="paw-print" size={30} />
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--h4-size)', fontWeight: 'var(--fw-semibold)', color: 'var(--text)' }}>{name}</h3>
            {sex && <Badge variant="neutral" pill>{sex}</Badge>}
          </div>
          <p style={{ margin: '2px 0 0', fontSize: 'var(--small-size)', color: 'var(--text-secondary)' }}>
            {species}{breed ? ` · ${breed}` : ''}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
        {vitals.map((m) => (
          <div key={m.k} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
            <div style={{ fontSize: 'var(--caption-size)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 'var(--fw-semibold)' }}>{m.k}</div>
            <div style={{ fontSize: 'var(--small-size)', color: 'var(--text)', fontWeight: 'var(--fw-medium)', marginTop: 2 }}>{m.v ?? '—'}</div>
          </div>
        ))}
      </div>

      {(neutered ?? microchip) && (
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
          {neutered && <Badge variant="success" icon="check-circle">Castrado</Badge>}
          {microchip && <Badge variant="brand" icon="shield-check">Microchipado</Badge>}
        </div>
      )}
    </Card>
  );
}
