import { createHmac } from 'node:crypto';

import { expect, type APIRequestContext, type Page } from '@playwright/test';

/**
 * Direct API calls for test setup (fresh users, slots, admin actions) so each flow test
 * starts from its own data and can be re-run against the same database.
 */
export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:4000';

export const SEED_PASSWORD = 'petnalia123';

/** Unique suffix per run — keeps e-mails/CRMVs unique across re-runs on the same DB. */
export function runId(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export async function apiLogin(request: APIRequestContext, email: string, password: string): Promise<string> {
  const res = await request.post(`${API_URL}/v1/auth/login`, { data: { email, password } });
  expect(res.ok(), `login ${email}: ${res.status()}`).toBeTruthy();
  const { accessToken } = (await res.json()) as { accessToken: string };
  return accessToken;
}

export interface NewVet {
  readonly fullName: string;
  readonly email: string;
  readonly password: string;
  readonly crmv: string;
  readonly crmvState: string;
}

export function newVet(): NewVet {
  const id = runId();
  return {
    fullName: `Dra. E2E ${id}`,
    email: `vet.e2e.${id}@petnalia.com`,
    password: 'senha12345',
    crmv: id.slice(-7),
    crmvState: 'SP',
  };
}

/** Registers a vet through the API and returns their vet profile id. */
export async function registerVet(request: APIRequestContext, vet: NewVet): Promise<string> {
  const res = await request.post(`${API_URL}/v1/auth/register/veterinarian`, { data: vet });
  expect(res.ok(), `register vet: ${res.status()}`).toBeTruthy();
  const { accessToken } = (await res.json()) as { accessToken: string };
  return vetProfileId(request, accessToken);
}

export async function vetProfileId(request: APIRequestContext, token: string): Promise<string> {
  const res = await request.get(`${API_URL}/v1/veterinarians/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok(), `vet profile: ${res.status()}`).toBeTruthy();
  const { id } = (await res.json()) as { id: string };
  return id;
}

export async function approveVet(request: APIRequestContext, vetId: string): Promise<void> {
  const adminToken = await apiLogin(request, 'admin@petnalia.com', SEED_PASSWORD);
  const res = await request.post(`${API_URL}/v1/admin/veterinarians/${vetId}/approve`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  expect(res.status(), 'approve vet').toBe(204);
}

/** Creates one 30-minute open slot for the vet that owns `token`. */
export async function createSlot(request: APIRequestContext, token: string, startsAt: Date): Promise<void> {
  const endsAt = new Date(startsAt.getTime() + 30 * 60_000);
  const res = await request.post(`${API_URL}/v1/availability/slots`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { slots: [{ startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() }] },
  });
  expect(res.ok(), `create slot: ${res.status()}`).toBeTruthy();
}

/** Signs a payload the way Stripe does (`Stripe-Signature: t=…,v1=…`). */
export function stripeSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

/** Logs in through the UI, the same way the shared fixtures do. */
export async function uiLogin(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/entrar', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith('/entrar'), { timeout: 15_000 });
}
