import { Skeleton } from '@petnalia/ui';

export default function Loading() {
  return (
    <main className="pn-page" style={{ padding: '40px 40px 60px' }} role="status" aria-label="Carregando área de atendimento...">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <Skeleton width={260} height={30} style={{ marginBottom: 8 }} />
          <Skeleton width={440} height={15} />
        </div>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '32px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Skeleton width={100} height={16} />
            <Skeleton width={60} height={18} />
          </div>
          <Skeleton width="100%" height={6} radius={100} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={220} radius="var(--radius-lg)" style={{ marginBottom: 24 }} />
          <Skeleton width={210} height={40} radius="var(--radius-md)" />
        </div>
      </div>
    </main>
  );
}
