import { newVet, uiLogin, waitForHydration } from './fixtures/api';
import { test, expect } from './fixtures/auth';

// Smallest valid PNG (1×1, transparent) — stands in for the CRMV photo.
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

/**
 * Critical flow: a vet signs up, sends the CRMV photo (stored in S3/MinIO), and an admin
 * approves the account. A fresh vet per run keeps the test independent of the seed.
 */
test.describe('Onboarding do veterinário', () => {
  test('cadastro, envio do CRMV e aprovação pelo admin', async ({ browser, adminContext }) => {
    const vet = newVet();

    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Sign-up
    await page.goto('/cadastro');
    await waitForHydration(page.locator('form'));
    await page.getByText('Sou veterinário').click();
    await page.fill('#name', vet.fullName);
    await page.fill('#reg-email', vet.email);
    await page.fill('#reg-password', vet.password);
    await page.fill('#crmv', vet.crmv);
    await page.selectOption('#crmvState', vet.crmvState);
    await page.getByRole('button', { name: 'Cadastrar e aguardar verificação' }).click();
    await expect(page).toHaveURL(/\/entrar\?cadastro=pendente/, { timeout: 15_000 });

    // 2. First login: account under review, asked for the CRMV photo
    await uiLogin(page, vet.email, vet.password);
    await expect(page).toHaveURL(/\/vet\/painel/);
    await expect(page.getByText('Conta em análise.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Envie a foto do seu CRMV' })).toBeVisible();

    await waitForHydration(page.locator('input[type="file"]'));
    await page.locator('input[type="file"]').setInputFiles({
      name: 'crmv.png',
      mimeType: 'image/png',
      buffer: PNG_1X1,
    });
    await expect(page.getByText('Foto enviada com sucesso.')).toBeVisible({ timeout: 15_000 });

    // 3. Admin sees the new vet (with the photo) and approves
    const admin = await adminContext.newPage();
    await admin.goto('/admin/verificacao');
    const card = admin
      .getByText(vet.email, { exact: true })
      .locator('xpath=ancestor::div[.//button[normalize-space()="Aprovar"]][1]');
    await expect(card.getByRole('img', { name: `CRMV de ${vet.fullName}` })).toBeVisible();
    await waitForHydration(card.getByRole('button', { name: 'Aprovar' }));
    await card.getByRole('button', { name: 'Aprovar' }).click();
    await expect(admin.getByText(vet.email, { exact: true })).toBeHidden({ timeout: 10_000 });

    // 4. The vet's account is no longer under review
    await page.reload();
    await expect(page.getByText('Conta em análise.')).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Envie a foto do seu CRMV' })).toBeHidden();

    await context.close();
  });
});
