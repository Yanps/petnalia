import { Skeleton } from '@petnalia/ui';

function PlanCardSkeleton() {
  return (
    <div style={{ padding: '32px 28px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
      <Skeleton width={60} height={14} style={{ marginBottom: 10 }} />
      <Skeleton width={90} height={30} style={{ marginBottom: 6 }} />
      <Skeleton width={70} height={13} style={{ marginBottom: 24 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Skeleton circle height={15} />
            <Skeleton width={140} height={14} />
          </div>
        ))}
      </div>
      <Skeleton width="100%" height={38} radius="var(--radius-md)" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="pn-page" style={{ padding: '40px 40px 60px' }} role="status" aria-label="Carregando assinatura...">
      <div style={{ marginBottom: 32 }}>
        <Skeleton width={140} height={30} style={{ marginBottom: 8 }} />
        <Skeleton width={320} height={15} />
      </div>

      <div className="pn-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 960 }}>
        <PlanCardSkeleton />
        <PlanCardSkeleton />
        <PlanCardSkeleton />
      </div>
    </div>
  );
}
