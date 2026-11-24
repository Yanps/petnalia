import { API_URL, approveVet, newVet, registerVet, stripeSignature, uiLogin } from './fixtures/api';
import { test, expect } from './fixtures/auth';

/**
 * Critical flow: subscription activation. Stripe Checkout itself is external, so the test
 * covers what PetNalia owns: the signed `checkout.session.completed` webhook activating
 * the plan (idempotently) and the page the vet returns to after paying.
 *
 * Needs the same STRIPE_WEBHOOK_SECRET the API runs with.
 */
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

test.describe('Assinatura do veterinário', () => {
  test.skip(!WEBHOOK_SECRET, 'defina STRIPE_WEBHOOK_SECRET (o mesmo da API) para rodar');

  test('webhook do Stripe ativa o plano Pro e a página de retorno confirma', async ({ browser, request }) => {
    const vet = newVet();
    const vetId = await registerVet(request, vet);
    await approveVet(request, vetId);

    const context = await browser.newContext();
    const page = await context.newPage();
    await uiLogin(page, vet.email, vet.password);

    const currentPlan = page.locator('.pn-grid-3 > div').filter({ hasText: 'Plano atual' });
    await page.goto('/vet/assinatura');
    await expect(currentPlan.locator('p').first()).toHaveText('Grátis');

    const id = Date.now();
    const payload = JSON.stringify({
      id: `evt_e2e_${id}`,
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: `cs_e2e_${id}`,
          object: 'checkout.session',
          customer: `cus_e2e_${id}`,
          subscription: `sub_e2e_${id}`,
          metadata: { vetId, plan: 'pro' },
        },
      },
    });
    const send = () =>
      request.post(`${API_URL}/v1/subscriptions/webhook`, {
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': stripeSignature(payload, WEBHOOK_SECRET!),
        },
        data: payload,
      });

    expect((await send()).status()).toBe(200);
    // Stripe delivers at least once — a redelivery must be a no-op.
    expect((await send()).status()).toBe(200);

    const forged = await request.post(`${API_URL}/v1/subscriptions/webhook`, {
      headers: { 'Content-Type': 'application/json', 'Stripe-Signature': 't=1,v1=forjada' },
      data: payload,
    });
    expect(forged.ok()).toBeFalsy();

    // Where Stripe sends the vet back after paying.
    await page.goto('/vet/assinatura?success=true');
    await expect(page.getByText('Assinatura ativada com sucesso!', { exact: false })).toBeVisible();
    await expect(currentPlan.locator('p').first()).toHaveText('Pro');
    await expect(page.getByText('Ativo', { exact: true })).toBeVisible();

    await context.close();
  });
});
