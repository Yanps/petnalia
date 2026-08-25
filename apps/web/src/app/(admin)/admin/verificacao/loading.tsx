import { Skeleton } from '@petnalia/ui';

function PendingVetCardSkeleton() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Skeleton width={56} height={56} radius="var(--radius-md)" />
        <div>
          <Skeleton width={160} height={16} style={{ marginBottom: 6 }} />
          <Skeleton width={180} height={13} style={{ marginBottom: 6 }} />
          <Skeleton width={100} height={13} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <Skeleton width={80} height={36} radius="var(--radius-md)" />
        <Skeleton width={80} height={36} radius="var(--radius-md)" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="pn-page" style={{ padding: '40px 40px 60px', maxWidth: 860 }} role="status" aria-label="Carregando verificações...">
      <div style={{ marginBottom: 32 }}>
        <Skeleton width={280} height={30} style={{ marginBottom: 8 }} />
        <Skeleton width={380} height={15} />
      </div>
      <PendingVetCardSkeleton />
      <PendingVetCardSkeleton />
    </main>
  );
}
