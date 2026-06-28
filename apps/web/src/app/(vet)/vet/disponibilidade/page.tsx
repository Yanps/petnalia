import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Disponibilidade' };

export default function DisponibilidadePage() {
  return (
    <main>
      <h1>Disponibilidade</h1>
      {/* TODO: AvailabilityCalendar, slot management */}
    </main>
  );
}
