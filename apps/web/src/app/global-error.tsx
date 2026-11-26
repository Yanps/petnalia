'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@petnalia/ui';
import '@petnalia/ui/styles';

import { StatusPage } from '@/components/feedback/status-page';
import { reportError } from '@/lib/observability';

// Replaces the root layout when it fails, so it renders its own <html>/<body> and styles.
export default function GlobalError({
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
    <html lang="pt-BR">
      <body>
        <StatusPage
          icon="alert-triangle"
          eyebrow="Algo deu errado"
          title="A PetNalia está com instabilidade"
          description="Tivemos um problema do nosso lado. Tente novamente em alguns instantes."
        >
          <Button variant="primary" onClick={reset}>
            Tentar novamente
          </Button>
          <Link href="/" className="vn-btn vn-btn--secondary">
            Voltar ao início
          </Link>
        </StatusPage>
      </body>
    </html>
  );
}
