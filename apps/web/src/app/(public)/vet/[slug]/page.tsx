import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Review, VetProfilePublicResponse } from '@petnalia/types';
import { VetProfile } from '@/components/vet/vet-profile';
import { api, ApiError } from '@/lib/api-client';
import { getSession, getToken } from '@/lib/auth';

interface VetPageProps {
  readonly params: Promise<{ slug: string }>;
}

interface VetReviewsResponse {
  data: Review[];
  total: number;
  page: number;
  limit: number;
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

async function getVetReviews(veterinarianId: string): Promise<Review[]> {
  try {
    const res = await api.get<VetReviewsResponse>(
      `/v1/reviews?veterinarianId=${veterinarianId}&page=1&limit=10`,
      { next: { revalidate: 60 } },
    );
    return res.data;
  } catch {
    return [];
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
  const [vet, session, token] = await Promise.all([
    getVetProfile(slug),
    getSession(),
    getToken(),
  ]);

  if (!vet) notFound();

  const reviews = await getVetReviews(vet.id);

  return (
    <main style={{ flex: 1, background: 'var(--surface-2)' }}>
      <VetProfile
        vet={vet}
        initialReviews={reviews}
        session={session}
        token={token}
      />
    </main>
  );
}
