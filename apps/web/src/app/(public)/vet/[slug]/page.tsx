import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findVetBySlug } from '@/data/mock-vets';
import { VetProfile } from '@/components/vet/vet-profile';

interface VetPageProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: VetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vet = findVetBySlug(slug);
  if (!vet) return { title: 'Veterinário não encontrado' };
  return {
    title: `${vet.name} — ${vet.specialty}`,
    description: vet.about.slice(0, 155),
  };
}

export default async function VetPage({ params }: VetPageProps) {
  const { slug } = await params;
  const vet = findVetBySlug(slug);

  if (!vet) notFound();

  return (
    <main style={{ flex: 1, background: 'var(--surface-2)' }}>
      <VetProfile vet={vet} />
    </main>
  );
}
