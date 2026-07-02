import { test, expect } from '@playwright/test';

test.describe('Busca de veterinários', () => {
  test('landing page exibe veterinários em destaque', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('text=Veterinários disponíveis agora')).toBeVisible();
    // VetCards must show full name (not truncated)
    const cards = page.locator('.vn-vetcard');
    await expect(cards).toHaveCount(3);
    // Names should not be just initials — at least 5 chars visible
    const firstName = await cards.first().locator('h3').textContent();
    expect(firstName?.length ?? 0).toBeGreaterThan(5);
  });

  test('página de busca carrega com resultados', async ({ page }) => {
    await page.goto('/busca?lat=-23.5505&lng=-46.6333', { waitUntil: 'networkidle' });
    await expect(page.locator('text=Veterinários próximos')).toBeVisible();
    await expect(page.locator('.vn-vetcard')).not.toHaveCount(0);
  });

  test('filtro de raio atualiza resultados', async ({ page }) => {
    await page.goto('/busca?lat=-23.5505&lng=-46.6333', { waitUntil: 'networkidle' });
    // Click the 50km radio inside the desktop aside (mobile panel is hidden)
    await page.locator('.pn-search-filters label:has-text("50 km")').click();
    await page.waitForURL(/raio=50/, { timeout: 5000 });
    await expect(page).toHaveURL(/raio=50/);
  });

  test('filtro de especialidade atualiza URL', async ({ page }) => {
    await page.goto('/busca?lat=-23.5505&lng=-46.6333', { waitUntil: 'networkidle' });
    // Click the Ortopedia checkbox (last in the list)
    await page.locator('.pn-search-filters input[type="checkbox"]').last().click();
    await page.waitForURL(/especialidade=/, { timeout: 5000 });
    await expect(page).toHaveURL(/especialidade=/);
  });

  test('desktop: apenas um painel de filtros visível', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/busca?lat=-23.5505&lng=-46.6333', { waitUntil: 'networkidle' });
    // Mobile toggle button must be hidden on desktop
    const toggleBtn = page.locator('.pn-filter-toggle-btn');
    await expect(toggleBtn).toBeHidden();
    // Desktop aside is visible
    const aside = page.locator('.pn-search-filters');
    await expect(aside).toBeVisible();
  });

  test('mobile: toggle abre e fecha painel de filtros', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/busca?lat=-23.5505&lng=-46.6333', { waitUntil: 'networkidle' });
    const toggleBtn = page.locator('.pn-filter-toggle-btn');
    await expect(toggleBtn).toBeVisible();
    // Panel closed by default
    const panel = page.locator('.pn-filter-panel');
    await expect(panel).toBeHidden();
    // Open
    await toggleBtn.click();
    await expect(panel).toBeVisible();
    // Close
    await toggleBtn.click();
    await expect(panel).toBeHidden();
  });

  test('campo de busca redireciona para /busca', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.fill('input[type="search"], input[placeholder*="especialidade"], input[placeholder*="cidade"]', 'Cardiologia');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/busca/);
  });
});
