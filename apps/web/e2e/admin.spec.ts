import { test, expect } from './fixtures/auth';

test.describe('Admin — verificação de veterinários', () => {
  test('admin acessa painel de verificação', async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto('/admin/verificacao', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/admin\/verificacao/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await page.close();
  });

  test('admin vê lista de veterinários pendentes', async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto('/admin/verificacao', { waitUntil: 'networkidle' });
    // Shows pending vet rows (with CRMV + Aprovar) or the empty-state message
    const vetRow = page.getByText('CRMV').or(page.getByText('Aprovar'));
    const emptyState = page.getByText('aguardando verificação');
    const hasContent = (await vetRow.count()) > 0 || (await emptyState.count()) > 0;
    expect(hasContent).toBe(true);
    await page.close();
  });

  test('tutor não acessa rotas de admin', async ({ tutorContext }) => {
    const page = await tutorContext.newPage();
    await page.goto('/admin/verificacao');
    await expect(page).toHaveURL(/\/entrar/);
    await page.close();
  });
});
