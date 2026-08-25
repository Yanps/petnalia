import React from 'react';
import { Card } from '../core/Card';
import { Skeleton } from '../core/Skeleton';

export function PetSitterCardSkeleton(): React.JSX.Element {
  return (
    <Card className="vn-vetcard" role="status" aria-label="Carregando pet sitter...">
      <div style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-5)', flex: 1 }}>
        <Skeleton circle height={72} style={{ flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
            <Skeleton width="60%" height={18} />
            <Skeleton width={64} height={14} style={{ flexShrink: 0 }} />
          </div>
          <Skeleton width="40%" height={14} style={{ marginTop: 6 }} />
          <Skeleton width="90%" height={14} style={{ marginTop: 10 }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            <Skeleton width={100} height={22} radius="var(--radius-full)" />
            <Skeleton width={80} height={22} radius="var(--radius-full)" />
          </div>
        </div>
      </div>
    </Card>
  );
}
