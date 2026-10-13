import { CreateSlotsForm } from '@/components/dashboard/create-slots-form';
import { getToken } from '@/lib/auth';

export default async function DisponibilidadePage() {
  const token = await getToken();

  return (
    <div className="pn-page" style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>
          Disponibilidade
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Adicione os horários em que você está disponível para atendimento.
        </p>
      </div>

      <CreateSlotsForm token={token ?? ''} />
    </div>
  );
}
