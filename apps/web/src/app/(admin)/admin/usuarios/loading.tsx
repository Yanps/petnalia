import { Skeleton } from '@petnalia/ui';

function UserRowSkeleton() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '18px 20px', marginBottom: 12,
    }}>
      <div>
        <Skeleton width={140} height={16} style={{ marginBottom: 6 }} />
        <Skeleton width={180} height={13} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <Skeleton width={80} height={14} />
        <Skeleton width={60} height={22} radius={100} />
        <Skeleton width={80} height={13} />
        <Skeleton width={90} height={34} radius="var(--radius-md)" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="pn-page" style={{ padding: '40px 40px 60px', maxWidth: 900 }} role="status" aria-label="Carregando usuários...">
      <div style={{ marginBottom: 32 }}>
        <Skeleton width={110} height={30} style={{ marginBottom: 8 }} />
        <Skeleton width={340} height={15} />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <UserRowSkeleton key={i} />
      ))}
    </main>
  );
}
