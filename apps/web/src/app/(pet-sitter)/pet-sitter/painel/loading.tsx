import { Skeleton } from '@petnalia/ui';

export default function Loading() {
  return (
    <div className="pn-page" style={{ padding: '40px 40px 60px' }} role="status" aria-label="Carregando painel...">
      <div style={{ marginBottom: 40 }}>
        <Skeleton width={220} height={30} style={{ marginBottom: 8 }} />
        <Skeleton width={320} height={15} />
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '28px 28px',
        maxWidth: 520,
      }}>
        <Skeleton width={130} height={17} style={{ marginBottom: 20 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Skeleton circle height={15} />
              <Skeleton width={160} height={13} />
            </div>
          ))}
        </div>
        <Skeleton width={150} height={32} radius="var(--radius-md)" />
      </div>
    </div>
  );
}
