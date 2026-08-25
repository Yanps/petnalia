import { Skeleton } from '@petnalia/ui';

function FlaggedSitterCardSkeleton() {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Skeleton width={140} height={16} />
          <Skeleton width={90} height={20} radius="var(--radius-full)" />
        </div>
        <Skeleton width="80%" height={13} style={{ marginBottom: 6 }} />
        <Skeleton width={100} height={12} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <Skeleton width={110} height={36} radius="var(--radius-md)" />
        <Skeleton width={130} height={36} radius="var(--radius-md)" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="pn-page" style={{ padding: '40px 40px 60px', maxWidth: 860 }} role="status" aria-label="Carregando pet sitters sinalizados...">
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <Skeleton width={280} height={30} style={{ marginBottom: 8 }} />
          <Skeleton width={420} height={15} />
        </div>
        <Skeleton width={110} height={16} />
      </div>
      <FlaggedSitterCardSkeleton />
      <FlaggedSitterCardSkeleton />
    </main>
  );
}
