import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Para veterinários — PetNalia',
};

export const revalidate = 86400;

export default function ParaVeterinariosPage() {
  return (
    <main>
      <h1>Para veterinários</h1>
      {/* TODO: landing page — benefits, CTA to register */}
    </main>
  );
}
