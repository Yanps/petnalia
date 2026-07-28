import { test, expect } from './fixtures/auth';

test.describe('Veterinário — onboarding e painel', () => {
  test('login redireciona para /vet/painel', async ({ vetContext }) => {
    const page = await vetContext.newPage();
    await page.goto('/vet/painel', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/vet\/painel/);
    await expect(page.locator('h1')).toContainText('Olá, Dra. Beatriz');
    await page.close();
  });

  test('painel exibe stats e sidebar de navegação', async ({ vetContext }) => {
    const page = await vetContext.newPage();
    await page.goto('/vet/painel', { waitUntil: 'networkidle' });
    await expect(page.locator('text=Consultas esta semana')).toBeVisible();
    await expect(page.locator('text=Avaliação média')).toBeVisible();
    await expect(page.locator('text=Novos clientes')).toBeVisible();
    // Sidebar nav links (first match = sidebar, second could be card buttons)
    await expect(page.locator('a[href="/vet/disponibilidade"]').first()).toBeVisible();
    await expect(page.locator('a[href="/vet/perfil"]').first()).toBeVisible();
    await expect(page.locator('a[href="/vet/assinatura"]').first()).toBeVisible();
    await page.close();
  });

  test('vet acessa página de disponibilidade', async ({ vetContext }) => {
    const page = await vetContext.newPage();
    await page.goto('/vet/disponibilidade', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/vet\/disponibilidade/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await page.close();
  });

  test('vet acessa página de perfil', async ({ vetContext }) => {
    const page = await vetContext.newPage();
    await page.goto('/vet/perfil', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/vet\/perfil/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await page.close();
  });

  test('vet acessa página de assinatura', async ({ vetContext }) => {
    const page = await vetContext.newPage();
    await page.goto('/vet/assinatura', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/vet\/assinatura/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await page.close();
  });

  test('vet acessa área de atendimento e ajusta o raio', async ({ vetContext }) => {
    const page = await vetContext.newPage();
    await page.goto('/vet/area-atendimento', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/vet\/area-atendimento/);
    await expect(page.locator('h1')).toContainText('Área de atendimento');

    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible();
    await slider.focus();
    await slider.press('ArrowRight');
    await slider.press('ArrowRight');

    const saveButton = page.getByRole('button', { name: /Salvar raio de atendimento/ });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await expect(page.locator('text=Salvo')).toBeVisible({ timeout: 5000 });
    await page.close();
  });

  test('sidebar tem link para área de atendimento', async ({ vetContext }) => {
    const page = await vetContext.newPage();
    await page.goto('/vet/painel', { waitUntil: 'networkidle' });
    await expect(page.locator('a[href="/vet/area-atendimento"]').first()).toBeVisible();
    await page.close();
  });

  test('vet não acessa rotas de tutor', async ({ vetContext }) => {
    const page = await vetContext.newPage();
    await page.goto('/painel');
    await expect(page).toHaveURL(/\/entrar/);
    await page.close();
  });

  test('mobile: drawer de navegação abre e fecha', async ({ vetContext }) => {
    const page = await vetContext.newPage();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/vet/painel', { waitUntil: 'networkidle' });
    // Hamburger visible on mobile
    const hamburger = page.locator('.pn-mobile-bar button[aria-label="Abrir menu"]');
    await expect(hamburger).toBeVisible();
    await hamburger.click();
    // Sidebar visible
    const sidebar = page.locator('.pn-sidebar');
    await expect(sidebar).toHaveClass(/open/);
    // Backdrop visible
    await expect(page.locator('.pn-drawer-overlay')).toHaveClass(/open/);
    // Close via backdrop
    await page.locator('.pn-drawer-overlay').click();
    await expect(sidebar).not.toHaveClass(/open/);
    await page.close();
  });
});
