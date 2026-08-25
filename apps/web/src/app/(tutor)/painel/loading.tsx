import { Skeleton } from '@petnalia/ui';

function StatCardSkeleton() {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)', padding: '24px 28px',
      display: 'flex', alignItems: 'flex-start', gap: 16,
    }}>
      <Skeleton width={44} height={44} radius="var(--radius-lg)" style={{ flexShrink: 0 }} />
      <div>
        <Skeleton width={40} height={30} style={{ marginBottom: 6 }} />
        <Skeleton width={110} height={13} />
      </div>
    </div>
  );
}

function ListPanelSkeleton() {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)', padding: '28px 28px',
    }}>
      <Skeleton width={140} height={17} style={{ marginBottom: 20 }} />
      {[0, 1].map((i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', background: 'var(--surface-2)',
          borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
          marginBottom: 10,
        }}>
          <div>
            <Skeleton width={140} height={14} style={{ marginBottom: 6 }} />
            <Skeleton width={80} height={12} />
          </div>
          <Skeleton width={70} height={20} radius={100} />
        </div>
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <div className="pn-page" style={{ padding: '40px 40px 60px' }} role="status" aria-label="Carregando painel...">
      <div style={{ marginBottom: 40 }}>
        <Skeleton width={220} height={30} style={{ marginBottom: 8 }} />
        <Skeleton width={340} height={15} />
      </div>

      <div className="pn-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="pn-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <ListPanelSkeleton />
        <ListPanelSkeleton />
      </div>
    </div>
  );
}
