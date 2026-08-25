import { Skeleton } from '@petnalia/ui';

function ReviewedSitterCardSkeleton() {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Skeleton width={140} height={16} />
        <Skeleton width={110} height={20} radius="var(--radius-full)" />
        <Skeleton width={90} height={20} radius="var(--radius-full)" />
      </div>
      <Skeleton width="70%" height={13} style={{ marginBottom: 6 }} />
      <Skeleton width={110} height={12} />
    </div>
  );
}

export default function Loading() {
  return (
    <main className="pn-page" style={{ padding: '40px 40px 60px', maxWidth: 860 }} role="status" aria-label="Carregando histórico de moderação...">
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <Skeleton width={280} height={30} style={{ marginBottom: 8 }} />
          <Skeleton width={460} height={15} />
        </div>
        <Skeleton width={100} height={16} />
      </div>
      <ReviewedSitterCardSkeleton />
      <ReviewedSitterCardSkeleton />
    </main>
  );
}
