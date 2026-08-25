import { Skeleton } from '@petnalia/ui';

export default function Loading() {
  return (
    <div className="pn-page" style={{ padding: '40px 40px 60px' }} role="status" aria-label="Carregando perfil...">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <Skeleton width={160} height={30} />
        </div>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '32px 36px', marginBottom: 24,
        }}>
          <Skeleton width={170} height={19} style={{ marginBottom: 20 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <Skeleton width={110} height={14} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={40} radius="var(--radius-md)" />
            </div>
            <div>
              <Skeleton width={60} height={14} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={40} radius="var(--radius-md)" />
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '32px 36px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Skeleton width={150} height={18} />
            <Skeleton width={130} height={36} radius="var(--radius-md)" />
          </div>
          {[0, 1].map((i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', marginBottom: 12,
            }}>
              <Skeleton width={36} height={36} radius="var(--radius-md)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Skeleton width={90} height={13} style={{ marginBottom: 6 }} />
                <Skeleton width={220} height={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
