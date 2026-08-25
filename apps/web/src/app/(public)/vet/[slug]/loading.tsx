import { VetProfileSkeleton } from '@/components/vet/vet-profile-skeleton';

export default function Loading() {
  return (
    <main style={{ flex: 1, background: 'var(--surface-2)' }}>
      <VetProfileSkeleton />
    </main>
  );
}
