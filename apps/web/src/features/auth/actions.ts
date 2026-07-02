'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decodeJwt } from 'jose';
import { api } from '@/lib/api-client';
import { LoginSchema, RegisterSchema, RegisterVetSchema, ForgotPasswordSchema } from './schema';

interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
}

function roleToRedirect(role: unknown): string {
  const r = typeof role === 'string' ? role.toLowerCase() : '';
  if (r === 'veterinarian') return '/vet/painel';
  if (r === 'admin') return '/admin/verificacao';
  return '/painel';
}

export async function loginAction(formData: FormData) {
  const data = LoginSchema.parse({
    email:    formData.get('email'),
    password: formData.get('password'),
  });

  const tokens = await api.post<AuthTokens>('/v1/auth/login', data);

  const cookieStore = await cookies();
  cookieStore.set('petnalia_session', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15, // 15 min — short-lived access token
  });

  const claims = decodeJwt(tokens.accessToken);
  redirect(roleToRedirect(claims.role));
}

export async function registerAction(formData: FormData) {
  const role = formData.get('role');

  if (role === 'VETERINARIAN') {
    const data = RegisterVetSchema.parse({
      name:      formData.get('name'),
      email:     formData.get('email'),
      password:  formData.get('password'),
      crmv:      formData.get('crmv'),
      crmvState: formData.get('crmvState'),
    });
    await api.post('/v1/auth/register/veterinarian', {
      fullName:  data.name,
      email:     data.email,
      password:  data.password,
      crmv:      data.crmv,
      crmvState: data.crmvState.toUpperCase(),
    });
    redirect('/entrar?cadastro=pendente');
  } else {
    const data = RegisterSchema.parse({
      name:     formData.get('name'),
      email:    formData.get('email'),
      password: formData.get('password'),
      role,
    });
    await api.post('/v1/auth/register', {
      fullName: data.name,
      email:    data.email,
      password: data.password,
      role:     data.role.toLowerCase(),
    });
    redirect('/entrar');
  }
}

export async function forgotPasswordAction(formData: FormData) {
  const data = ForgotPasswordSchema.parse({ email: formData.get('email') });
  await api.post('/v1/auth/forgot-password', data);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('petnalia_session');
  redirect('/entrar');
}
