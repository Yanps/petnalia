import { Skeleton } from '@petnalia/ui';

export function SearchFiltersSkeleton() {
  return (
    <aside
      className="pn-search-filters"
      role="status"
      aria-label="Carregando filtros..."
      style={{
        width: 240, flexShrink: 0,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px',
        position: 'sticky', top: 80,
      }}
    >
      <Skeleton width={64} height={13} style={{ marginBottom: 16 }} />

      <div style={{ marginBottom: 24 }}>
        <Skeleton width={72} height={13} style={{ marginBottom: 10 }} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Skeleton circle height={16} />
            <Skeleton width={48} height={14} />
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        <Skeleton width={90} height={13} style={{ marginBottom: 10 }} />
        <Skeleton width="100%" height={30} radius="var(--radius-md)" style={{ marginBottom: 12 }} />
        <div style={{ maxHeight: 260, overflow: 'hidden' }}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Skeleton width={16} height={16} radius={4} />
              <Skeleton width={100 + (i % 3) * 20} height={14} />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
