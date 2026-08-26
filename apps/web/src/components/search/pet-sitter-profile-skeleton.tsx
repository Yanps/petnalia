import { Icon, Skeleton } from '@petnalia/ui';

export function PetSitterProfileSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando perfil do pet sitter..."
      className="pn-vet-profile-layout"
      style={{ maxWidth: 1152, margin: '0 auto', padding: '40px 24px', display: 'flex', gap: 40, alignItems: 'flex-start' }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <span>Início</span>
          <Icon name="chevron-right" size={14} />
          <span>Busca</span>
          <Icon name="chevron-right" size={14} />
          <Skeleton width={90} height={13} />
        </nav>

        {/* Profile hero */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '32px',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <Skeleton circle height={96} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Skeleton width={220} height={22} style={{ marginBottom: 8 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <Skeleton width={90} height={14} />
                <Skeleton width={110} height={13} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Skeleton width={120} height={24} radius="var(--radius-full)" />
                <Skeleton width={100} height={24} radius="var(--radius-full)" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 28, display: 'flex', gap: 24, paddingBottom: 12 }}>
          <Skeleton width={48} height={16} />
          <Skeleton width={96} height={16} />
        </div>

        {/* Content */}
        <Skeleton width={64} height={14} style={{ marginBottom: 12 }} />
        <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="90%" height={14} style={{ marginBottom: 24 }} />
        <Skeleton width={110} height={14} style={{ marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Skeleton width={100} height={28} radius="var(--radius-full)" />
          <Skeleton width={90} height={28} radius="var(--radius-full)" />
        </div>
      </div>

      {/* Booking sidebar */}
      <aside style={{
        width: 316, flexShrink: 0,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '24px',
      }}>
        <Skeleton width={130} height={18} style={{ marginBottom: 16 }} />
        <Skeleton width={100} height={13} style={{ marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width={44} height={52} radius="var(--radius-md)" />
          ))}
        </div>
        <Skeleton width="100%" height={14} />
      </aside>
    </div>
  );
}
