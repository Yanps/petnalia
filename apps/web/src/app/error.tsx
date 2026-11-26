'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@petnalia/ui';

import { StatusPage } from '@/components/feedback/status-page';
import { reportError } from '@/lib/observability';

export default function RouteError({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <StatusPage
      icon="alert-triangle"
      eyebrow="Algo deu errado"
      title="Não foi possível carregar esta página"
      description="Tivemos um problema do nosso lado. Tente novamente em alguns instantes — se continuar, volte ao início."
    >
      <Button variant="primary" onClick={reset}>
        Tentar novamente
      </Button>
      <Link href="/" className="vn-btn vn-btn--secondary">
        Voltar ao início
      </Link>
    </StatusPage>
  );
}
