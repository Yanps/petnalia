import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Verificação de CRMV' };

export default function VerificacaoPage() {
  return (
    <main>
      <h1>Verificação de veterinários</h1>
      {/* TODO: pending CRMV verifications list, approve/reject actions */}
    </main>
  );
}
