import type { Metadata } from 'next';
import Link from 'next/link';

import { StatusPage } from '@/components/feedback/status-page';

export const metadata: Metadata = {
  title: 'Página não encontrada',
  robots: { index: false },
};

export default function NotFound(): React.JSX.Element {
  return (
    <StatusPage
      icon="map-pin"
      eyebrow="Erro 404"
      title="Não encontramos esta página"
      description="O endereço pode ter mudado ou o perfil não está mais disponível. Você pode voltar ao início ou buscar um profissional perto de você."
    >
      <Link href="/" className="vn-btn vn-btn--primary">
        Voltar ao início
      </Link>
      <Link href="/busca" className="vn-btn vn-btn--secondary">
        Buscar profissionais
      </Link>
    </StatusPage>
  );
}
