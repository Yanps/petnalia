'use server';

import { getToken } from '@/lib/auth';

const API = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

export async function createCheckoutSession(plan: 'pro' | 'clinic'): Promise<{ url: string } | { error: string }> {
  const token = await getToken();
  if (!token) return { error: 'Sessão expirada. Faça login novamente.' };

  try {
    const res = await fetch(`${API}/v1/subscriptions/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: { message?: string } };
      return { error: data.error?.message ?? 'Erro ao iniciar pagamento.' };
    }

    const data = (await res.json()) as { url: string };
    return { url: data.url };
  } catch {
    return { error: 'Erro de conexão. Tente novamente.' };
  }
}

export async function cancelSubscription(): Promise<{ success: boolean } | { error: string }> {
  const token = await getToken();
  if (!token) return { error: 'Sessão expirada. Faça login novamente.' };

  try {
    const res = await fetch(`${API}/v1/subscriptions/cancel`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: { message?: string } };
      return { error: data.error?.message ?? 'Erro ao cancelar assinatura.' };
    }

    return { success: true };
  } catch {
    return { error: 'Erro de conexão. Tente novamente.' };
  }
}
