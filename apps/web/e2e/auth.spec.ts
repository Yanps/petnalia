import { test, expect, type Page } from '@playwright/test';

async function doLogin(page: Page, email: string, password: string) {
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

  test('pet sitter faz login e vai para /pet-sitter/painel', async ({ page }) => {
    await doLogin(page, 'carla.sitter@petnalia.com', 'petnalia123');
    await expect(page).toHaveURL(/\/pet-sitter\/painel/);
    await expect(page.locator('h1')).toContainText('Olá, Carla Mendonça');
  });

  test('cadastro como pet sitter cria conta e permite editar perfil', async ({ page }) => {
    const email = `sitter.e2e.${Date.now()}@petnalia.com`;

    await page.goto('/cadastro', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.click('text=Sou pet sitter');
    await page.fill('#name', 'Sitter E2E');
    await page.fill('#reg-email', email);
    await page.fill('#reg-password', 'senha12345');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);
    await expect(page).toHaveURL(/\/entrar/);

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'senha12345');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);
    await expect(page).toHaveURL(/\/pet-sitter\/painel/);

    await page.click('text=Meu perfil');
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/pet-sitter\/perfil/);

    await page.fill('textarea', 'Bio de teste via Playwright.');
    await page.click('text=Passeio');
    await page.fill('#baseCity', 'São Paulo');
    await page.selectOption('#baseState', 'SP');
    await page.click('button[type="submit"]:has-text("Salvar")');
    await expect(page.locator('text=Perfil atualizado com sucesso')).toBeVisible({ timeout: 5000 });
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

  test('link "Esqueci a senha" leva a /recuperar-senha', async ({ page }) => {
    await page.goto('/entrar', { waitUntil: 'networkidle' });
    await page.click('a[href="/recuperar-senha"]');
    await expect(page).toHaveURL(/\/recuperar-senha/);
  });

  test('recuperar-senha mostra confirmação após enviar e-mail existente', async ({ page }) => {
    await page.goto('/recuperar-senha', { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', 'ana@petnalia.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=receberá um link')).toBeVisible({ timeout: 5000 });
  });

  test('recuperar-senha mostra confirmação mesmo para e-mail inexistente (evita enumeração)', async ({ page }) => {
    await page.goto('/recuperar-senha', { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', 'naoexiste@petnalia.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=receberá um link')).toBeVisible({ timeout: 5000 });
  });

  test('redefinir-senha sem token mostra link inválido', async ({ page }) => {
    await page.goto('/redefinir-senha', { waitUntil: 'networkidle' });
    await expect(page.locator('text=Link de redefinição inválido')).toBeVisible();
  });

  test('redefinir-senha com token mostra formulário de nova senha', async ({ page }) => {
    await page.goto('/redefinir-senha?token=qualquer-coisa', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Escolha uma nova senha');
  });

  test('redefinir-senha valida que as senhas coincidem', async ({ page }) => {
    await page.goto('/redefinir-senha?token=token-de-teste', { waitUntil: 'networkidle' });
    await page.fill('input[name="password"]', 'senhaNova123');
    await page.fill('input[name="confirmPassword"]', 'senhaDiferente123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=não coincidem')).toBeVisible({ timeout: 3000 });
  });
});
