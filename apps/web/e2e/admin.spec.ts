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

test.describe('Admin — gestão de usuários', () => {
  test('admin vê lista de usuários com ações de suspender/reativar', async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto('/admin/usuarios', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Usuários');

    const userRow = page.getByText('Suspender').or(page.getByText('Reativar'));
    const emptyState = page.getByText('Nenhum usuário encontrado');
    const hasContent = (await userRow.count()) > 0 || (await emptyState.count()) > 0;
    expect(hasContent).toBe(true);
    await page.close();
  });

  test('admin suspende e reativa um usuário', async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto('/admin/usuarios', { waitUntil: 'networkidle' });

    // Scope to a specific, known seeded tutor to avoid touching other rows
    const row = page.locator('[data-testid="user-row"]').filter({ hasText: 'ana@petnalia.com' });
    await expect(row).toBeVisible();

    await row.getByRole('button', { name: 'Suspender' }).click();
    await page.waitForTimeout(1500);
    await expect(row.getByRole('button', { name: 'Reativar' })).toBeVisible();

    // Revert to leave seed data clean for other tests
    await row.getByRole('button', { name: 'Reativar' }).click();
    await page.waitForTimeout(1500);
    await expect(row.getByRole('button', { name: 'Suspender' })).toBeVisible();
    await page.close();
  });

  test('tutor não acessa /admin/usuarios', async ({ tutorContext }) => {
    const page = await tutorContext.newPage();
    await page.goto('/admin/usuarios');
    await expect(page).toHaveURL(/\/entrar/);
    await page.close();
  });
});

test.describe('Admin — consultas', () => {
  test('admin vê listagem de consultas', async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto('/admin/consultas', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Consultas');

    const row = page.getByText('Domiciliar').or(page.getByText('Telemedicina'));
    const emptyState = page.getByText('Nenhuma consulta encontrada');
    const hasContent = (await row.count()) > 0 || (await emptyState.count()) > 0;
    expect(hasContent).toBe(true);
    await page.close();
  });

  test('filtro de status atualiza a URL', async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto('/admin/consultas', { waitUntil: 'networkidle' });
    await page.selectOption('select[aria-label="Filtrar por status"]', 'confirmed');
    await expect(page).toHaveURL(/status=confirmed/);
    await page.close();
  });

  test('tutor não acessa /admin/consultas', async ({ tutorContext }) => {
    const page = await tutorContext.newPage();
    await page.goto('/admin/consultas');
    await expect(page).toHaveURL(/\/entrar/);
    await page.close();
  });
});
