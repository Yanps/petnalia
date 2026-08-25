import { Skeleton } from '@petnalia/ui';

function AppointmentCardSkeleton() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px', background: 'var(--surface)',
      border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      marginBottom: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Skeleton width={70} height={20} radius={100} />
          <Skeleton width={80} height={20} radius={100} />
        </div>
        <Skeleton width={200} height={16} style={{ marginBottom: 6 }} />
        <Skeleton width={260} height={14} />
      </div>
      <Skeleton width={90} height={32} radius="var(--radius-md)" style={{ flexShrink: 0 }} />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="pn-page" style={{ padding: '40px 40px 60px' }} role="status" aria-label="Carregando consultas...">
      <div style={{ marginBottom: 32 }}>
        <Skeleton width={140} height={30} />
      </div>
      <AppointmentCardSkeleton />
      <AppointmentCardSkeleton />
      <AppointmentCardSkeleton />
    </div>
  );
}
