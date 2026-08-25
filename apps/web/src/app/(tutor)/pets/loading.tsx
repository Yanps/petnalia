import { Skeleton } from '@petnalia/ui';

function PetCardSkeleton() {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)', padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Skeleton circle height={32} />
        <div>
          <Skeleton width={90} height={16} style={{ marginBottom: 6 }} />
          <Skeleton width={60} height={13} />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div style={{ padding: '40px 40px 60px' }} role="status" aria-label="Carregando pets...">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <Skeleton width={160} height={30} />
        <Skeleton width={150} height={40} radius="var(--radius-md)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        <PetCardSkeleton />
        <PetCardSkeleton />
        <PetCardSkeleton />
      </div>
    </div>
  );
}
