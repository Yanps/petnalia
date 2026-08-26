import { PetSitterProfileSkeleton } from '@/components/search/pet-sitter-profile-skeleton';

export default function Loading() {
  return (
    <main style={{ flex: 1, background: 'var(--surface-2)' }}>
      <PetSitterProfileSkeleton />
    </main>
  );
}
