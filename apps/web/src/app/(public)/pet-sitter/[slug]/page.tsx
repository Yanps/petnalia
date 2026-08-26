import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { PetSitterProfilePublicResponse, PetSitterReview } from '@petnalia/types';
import { PetSitterProfile } from '@/components/search/pet-sitter-profile';
import { api, ApiError } from '@/lib/api-client';
import { getSession, getToken } from '@/lib/auth';

interface PetSitterPageProps {
  readonly params: Promise<{ slug: string }>;
}

interface PetSitterReviewsResponse {
  data: PetSitterReview[];
  total: number;
  page: number;
  limit: number;
}

async function getPetSitterProfile(slug: string): Promise<PetSitterProfilePublicResponse | null> {
  try {
    return await api.get<PetSitterProfilePublicResponse>(`/v1/pet-sitters/${slug}`, {
      next: { revalidate: 60 },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

async function getPetSitterReviews(petSitterId: string): Promise<PetSitterReview[]> {
  try {
    const res = await api.get<PetSitterReviewsResponse>(
      `/v1/pet-sitter-reviews?petSitterId=${petSitterId}&page=1&limit=10`,
      { next: { revalidate: 60 } },
    );
    return res.data;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PetSitterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sitter = await getPetSitterProfile(slug);
  if (!sitter) return { title: 'Pet sitter não encontrado' };

  return {
    title: `${sitter.fullName} — Pet sitter | PetNalia`,
    description: sitter.bio?.slice(0, 155) ?? `Reserve com ${sitter.fullName} em ${sitter.baseCity}.`,
  };
}

export default async function PetSitterPage({ params }: PetSitterPageProps) {
  const { slug } = await params;
  const [sitter, session, token] = await Promise.all([
    getPetSitterProfile(slug),
    getSession(),
    getToken(),
  ]);

  if (!sitter) notFound();

  const reviews = await getPetSitterReviews(sitter.id);

  return (
    <main style={{ flex: 1, background: 'var(--surface-2)' }}>
      <PetSitterProfile
        sitter={sitter}
        initialReviews={reviews}
        session={session}
        token={token}
      />
    </main>
  );
}
