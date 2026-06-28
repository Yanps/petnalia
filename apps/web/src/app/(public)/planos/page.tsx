import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planos',
};

export const revalidate = 3600;

export default function PlanosPage() {
  return (
    <main>
      <h1>Planos</h1>
      {/* TODO: subscription pricing cards */}
    </main>
  );
}
