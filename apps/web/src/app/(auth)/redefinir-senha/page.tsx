import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/features/auth/reset-password-form';

export const metadata: Metadata = { title: 'Redefinir senha' };

interface RedefinirSenhaPageProps {
  readonly searchParams: Promise<{ token?: string }>;
}

export default async function RedefinirSenhaPage({ searchParams }: RedefinirSenhaPageProps) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token ?? ''} />;
}
