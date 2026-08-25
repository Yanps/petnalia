import { Skeleton } from '@petnalia/ui';

function AppointmentRowSkeleton() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '18px 20px', marginBottom: 12,
    }}>
      <div>
        <Skeleton width={220} height={16} style={{ marginBottom: 6 }} />
        <Skeleton width={140} height={13} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <Skeleton width={110} height={14} />
        <Skeleton width={70} height={16} />
        <Skeleton width={80} height={22} radius={100} />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="pn-page" style={{ padding: '40px 40px 60px', maxWidth: 900 }} role="status" aria-label="Carregando consultas...">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <div>
          <Skeleton width={140} height={30} style={{ marginBottom: 8 }} />
          <Skeleton width={340} height={15} />
        </div>
        <Skeleton width={140} height={38} radius="var(--radius-md)" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <AppointmentRowSkeleton key={i} />
      ))}
    </main>
  );
}
