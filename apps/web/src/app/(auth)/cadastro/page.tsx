import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from '@/features/auth/register-form';

export const metadata: Metadata = { title: 'Criar conta' };

export default function CadastroPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
