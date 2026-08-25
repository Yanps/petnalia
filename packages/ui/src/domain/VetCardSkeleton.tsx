import React from 'react';
import { Card } from '../core/Card';
import { Skeleton } from '../core/Skeleton';

export function VetCardSkeleton(): React.JSX.Element {
  return (
    <Card className="vn-vetcard" role="status" aria-label="Carregando veterinário...">
      <div style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-5)', flex: 1 }}>
        <Skeleton circle height={72} style={{ flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Skeleton width="70%" height={18} />
              <Skeleton width="45%" height={14} style={{ marginTop: 6 }} />
            </div>
            <Skeleton width={64} height={14} style={{ flexShrink: 0 }} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            <Skeleton width={104} height={22} radius="var(--radius-full)" />
            <Skeleton width={70} height={22} radius="var(--radius-full)" />
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)',
        borderTop: '1px solid var(--border)', background: 'var(--surface-2)',
      }}>
        <Skeleton width={90} height={14} />
        <Skeleton width={96} height={32} radius="var(--radius-md)" />
      </div>
    </Card>
  );
}
