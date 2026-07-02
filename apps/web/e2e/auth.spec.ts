import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

async function doLogin(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/entrar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3500);
}

test.describe('Autenticação', () => {
  test('tutor faz login e vai para /painel', async ({ page }) => {
    await doLogin(page, 'ana@petnalia.com', 'petnalia123');
    await expect(page).toHaveURL(/\/painel/);
    await expect(page.locator('h1')).toContainText('Olá, Ana');
  });

  test('veterinário faz login e vai para /vet/painel', async ({ page }) => {
    await doLogin(page, 'dra.beatriz@petnalia.com', 'petnalia123');
    await expect(page).toHaveURL(/\/vet\/painel/);
    await expect(page.locator('h1')).toContainText('Olá, Dra. Beatriz');
  });

  test('admin faz login e vai para /admin/verificacao', async ({ page }) => {
    await doLogin(page, 'admin@petnalia.com', 'petnalia123');
    await expect(page).toHaveURL(/\/admin\//);
  });

  test('credenciais inválidas mostram erro', async ({ page }) => {
    await page.goto('/entrar', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.fill('input[name="email"]', 'naoexiste@petnalia.com');
    await page.fill('input[name="password"]', 'senhaerrada');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/entrar/);
    const errorMsg = page.locator('text=inválidos').or(page.locator('text=inválido'));
    await expect(errorMsg).toBeVisible({ timeout: 3000 });
  });

  test('rota protegida redireciona para /entrar sem sessão', async ({ page }) => {
    await page.goto('/painel');
    await expect(page).toHaveURL(/\/entrar/);
  });

  test('tutor não acessa rotas de veterinário', async ({ page }) => {
    // Login as tutor
    await doLogin(page, 'ana@petnalia.com', 'petnalia123');
    await expect(page).toHaveURL(/\/painel/);
    // Try vet route
    await page.goto('/vet/painel');
    await expect(page).toHaveURL(/\/entrar/);
  });

  test('logout redireciona para /entrar', async ({ page }) => {
    await doLogin(page, 'ana@petnalia.com', 'petnalia123');
    await expect(page).toHaveURL(/\/painel/);
    // Desktop: logout button in sidebar
    await page.click('button[type="submit"]:has-text("Sair"), form button:has-text("Sair")');
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/entrar/);
  });
});
