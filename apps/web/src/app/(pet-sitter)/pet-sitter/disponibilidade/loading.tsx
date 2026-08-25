import { Skeleton } from '@petnalia/ui';

export default function Loading() {
  return (
    <div className="pn-page" style={{ padding: '40px 40px 60px' }} role="status" aria-label="Carregando disponibilidade...">
      <div style={{ marginBottom: 32 }}>
        <Skeleton width={190} height={30} style={{ marginBottom: 8 }} />
        <Skeleton width={380} height={15} />
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '24px', marginBottom: 20,
      }}>
        <Skeleton width={130} height={17} style={{ marginBottom: 20 }} />
        <div className="pn-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 16 }}>
          <div>
            <Skeleton width={50} height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={40} radius="var(--radius-md)" />
          </div>
          <div>
            <Skeleton width={40} height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={40} radius="var(--radius-md)" />
          </div>
        </div>
        <Skeleton width={150} height={36} radius="var(--radius-md)" />
      </div>

      <Skeleton width={150} height={44} radius="var(--radius-md)" />
    </div>
  );
}
