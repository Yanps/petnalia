import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Painel — Veterinário' };

export default function VetPainelPage() {
  return (
    <main>
      <h1>Painel do veterinário</h1>
      {/* TODO: upcoming appointments, ratings summary, availability status */}
    </main>
  );
}
