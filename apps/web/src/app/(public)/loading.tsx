import { Skeleton } from '@petnalia/ui';

export default function Loading() {
  return (
    <main role="status" aria-label="Carregando...">
      <section style={{
        background: 'linear-gradient(160deg, var(--teal-50) 0%, var(--teal-100) 15%, white 60%)',
        padding: '80px 24px 72px',
      }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ maxWidth: 640 }}>
            <Skeleton width={220} height={28} radius="var(--radius-full)" style={{ marginBottom: 20 }} />
            <Skeleton width="100%" height={44} style={{ marginBottom: 10 }} />
            <Skeleton width="80%" height={44} style={{ marginBottom: 10 }} />
            <Skeleton width="60%" height={44} style={{ marginBottom: 20 }} />
            <Skeleton width="100%" height={20} style={{ marginBottom: 6 }} />
            <Skeleton width="70%" height={20} style={{ marginBottom: 36 }} />

            <Skeleton width="100%" height={140} radius="var(--radius-xl)" style={{ maxWidth: 620 }} />

            <div style={{ display: 'flex', gap: 28, marginTop: 32 }}>
              <Skeleton width={130} height={16} />
              <Skeleton width={150} height={16} />
              <Skeleton width={160} height={16} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
