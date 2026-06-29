import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { VetProfilePublicResponse } from '@petnalia/types';
import { VetProfile } from '@/components/vet/vet-profile';
import { api, ApiError } from '@/lib/api-client';

interface VetPageProps {
  readonly params: Promise<{ slug: string }>;
}

async function getVetProfile(slug: string): Promise<VetProfilePublicResponse | null> {
  try {
    return await api.get<VetProfilePublicResponse>(`/v1/veterinarians/${slug}`, {
      next: { revalidate: 60 },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: VetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vet = await getVetProfile(slug);
  if (!vet) return { title: 'Veterinário não encontrado' };

  const specialtyLabel = vet.specialties[0]?.name ?? 'Veterinário';
  return {
    title: `${vet.fullName} — ${specialtyLabel} | PetNalia`,
    description: vet.bio?.slice(0, 155) ?? `Agende uma consulta com ${vet.fullName} em ${vet.baseCity}.`,
  };
}

export default async function VetPage({ params }: VetPageProps) {
  const { slug } = await params;
  const vet = await getVetProfile(slug);

  if (!vet) notFound();

  return (
    <main style={{ flex: 1, background: 'var(--surface-2)' }}>
      <VetProfile vet={vet} />
    </main>
  );
}
