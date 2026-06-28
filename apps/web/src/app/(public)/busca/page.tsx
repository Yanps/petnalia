import type { Metadata } from 'next';

// TODO: populate metadata from search params
export const metadata: Metadata = {
  title: 'Buscar veterinários',
};

interface SearchPageProps {
  readonly searchParams: Promise<{
    q?: string;
    cidade?: string;
    especialidade?: string;
    raio?: string;
  }>;
}

export default async function BuscaPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  return (
    <main>
      <h1>Buscar veterinários</h1>
      {/* TODO: SearchBar + FilterDrawer + ResultsGrid */}
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </main>
  );
}
