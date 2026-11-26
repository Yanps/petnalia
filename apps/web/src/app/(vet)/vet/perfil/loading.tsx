import { Skeleton } from '@petnalia/ui';

export default function Loading() {
  return (
    <div style={{ padding: '40px 40px 60px' }} role="status" aria-label="Carregando perfil...">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <Skeleton width={230} height={30} />
        </div>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '32px 36px',
          display: 'flex', flexDirection: 'column', gap: 28,
        }}>
          <div style={{ paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <Skeleton width={160} height={17} style={{ marginBottom: 8 }} />
            <Skeleton width={120} height={14} style={{ marginBottom: 20 }} />
            <Skeleton circle height={72} />
          </div>

          <div>
            <Skeleton width={60} height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={90} radius="var(--radius-md)" />
          </div>

          <div>
            <Skeleton width={170} height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={44} radius="var(--radius-md)" />
          </div>

          <div>
            <Skeleton width={130} height={14} style={{ marginBottom: 8 }} />
            <Skeleton width={300} height={13} style={{ marginBottom: 12 }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} style={{ flex: '1 1 220px' }}>
                  <Skeleton width={130} height={14} style={{ marginBottom: 8 }} />
                  <Skeleton width="100%" height={44} radius="var(--radius-md)" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Skeleton width={120} height={14} style={{ marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Skeleton width={100} height={30} radius="var(--radius-full)" />
              <Skeleton width={90} height={30} radius="var(--radius-full)" />
              <Skeleton width={110} height={30} radius="var(--radius-full)" />
            </div>
          </div>

          <Skeleton width={150} height={40} radius="var(--radius-md)" />
        </div>
      </div>
    </div>
  );
}
