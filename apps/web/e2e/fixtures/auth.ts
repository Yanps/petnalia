import { test as base, type BrowserContext } from '@playwright/test';

const CREDS = {
  tutor: { email: 'ana@petnalia.com', password: 'petnalia123' },
  vet: { email: 'dra.beatriz@petnalia.com', password: 'petnalia123' },
  admin: { email: 'admin@petnalia.com', password: 'petnalia123' },
} as const;

async function login(context: BrowserContext, role: keyof typeof CREDS) {
  const page = await context.newPage();
  await page.goto('/entrar', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });
  await page.waitForTimeout(1500); // React hydration
  await page.fill('input[name="email"]', CREDS[role].email);
  await page.fill('input[name="password"]', CREDS[role].password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  await page.close();
}

export const test = base.extend<{
  tutorContext: BrowserContext;
  vetContext: BrowserContext;
  adminContext: BrowserContext;
}>({
  tutorContext: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    await login(ctx, 'tutor');
    await use(ctx);
    await ctx.close();
  },
  vetContext: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    await login(ctx, 'vet');
    await use(ctx);
    await ctx.close();
  },
  adminContext: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    await login(ctx, 'admin');
    await use(ctx);
    await ctx.close();
  },
});

export { expect } from '@playwright/test';
