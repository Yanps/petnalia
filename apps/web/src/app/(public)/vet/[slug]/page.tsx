import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface VetProfilePageProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: VetProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  // TODO: fetch vet data and populate metadata
  return { title: `Veterinário ${slug}` };
}

export default async function VetProfilePage({ params }: VetProfilePageProps) {
  const { slug } = await params;
  if (!slug) notFound();
  return (
    <main>
      <h1>Perfil do veterinário</h1>
      {/* TODO: VetHero, ReviewList, AvailabilityCalendar, BookingSidebar */}
    </main>
  );
}
