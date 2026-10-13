import { Skeleton, VetResultsGridSkeleton } from '@petnalia/ui';

import { SearchFiltersSkeleton } from '@/components/search/search-filters-skeleton';

export default function Loading() {
  return (
    <main style={{ flex: 1 }}>
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '20px 24px',
      }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)', padding: 16, maxWidth: 620,
          }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <Skeleton width={120} height={34} radius="var(--radius-md)" />
              <Skeleton width={110} height={34} radius="var(--radius-md)" />
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Skeleton width={220} height={40} radius="var(--radius-md)" style={{ flex: '1 1 220px' }} />
              <Skeleton width={220} height={40} radius="var(--radius-md)" style={{ flex: '1 1 220px' }} />
              <Skeleton width={110} height={40} radius="var(--radius-md)" />
            </div>
          </div>
        </div>
      </div>

      <div className="pn-search-layout" style={{
        maxWidth: 1152, margin: '0 auto', padding: '32px 24px',
        display: 'flex', gap: 32, alignItems: 'flex-start',
      }}>
        <SearchFiltersSkeleton />

        <div style={{ flex: 1, minWidth: 0 }} aria-busy="true" aria-label="Resultados da busca">
          <div style={{ marginBottom: 20 }}>
            <Skeleton width={200} height={22} style={{ marginBottom: 8 }} />
            <Skeleton width={140} height={14} />
          </div>
          <VetResultsGridSkeleton count={6} columns={2} />
        </div>
      </div>
    </main>
  );
}
