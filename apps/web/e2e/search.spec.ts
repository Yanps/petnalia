import { test, expect } from '@playwright/test';

import { trackUnfinishedRequests, waitForHydration } from './fixtures/api';

// These pages run against a production build, where Next.js prefetches routes in the
// background: never wait for 'networkidle' here — wait for hydration before interacting.
test.describe('Busca de veterinários', () => {
  let unfinishedRequests: () => string = () => '';

  test.beforeEach(({ page }) => {
    unfinishedRequests = trackUnfinishedRequests(page);
  });

  test.afterEach(async ({ page: _page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach('requisicoes-sem-resposta', { body: unfinishedRequests(), contentType: 'text/plain' });
    }
  });

  test('landing page exibe veterinários e pet sitters em destaque num carrossel', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Profissionais disponíveis agora')).toBeVisible();
    // 3 VetCards + 2 PetSitterCards in a single scroll row, sharing the .vn-vetcard hook class
    const cards = page.locator('.vn-vetcard');
    await expect(cards).toHaveCount(5);
    // Names should not be just initials — at least 5 chars visible
    const firstName = await cards.first().locator('h3').textContent();
    expect(firstName?.length ?? 0).toBeGreaterThan(5);
    // All cards share one flex row, so they must all render at the same height
    // (no ragged heights when a vet's specialty text wraps to two lines, etc.)
    const heights = await cards.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
    const [firstHeight = 0, ...rest] = heights;
    for (const h of rest) expect(Math.abs(h - firstHeight)).toBeLessThan(1);
  });

  test('página de busca carrega com resultados', async ({ page }) => {
    await page.goto('/busca?lat=-23.5505&lng=-46.6333');
    await expect(page.locator('text=Veterinários próximos')).toBeVisible();
    await expect(page.locator('.vn-vetcard')).not.toHaveCount(0);
  });

  test('filtro de raio atualiza resultados', async ({ page }) => {
    await page.goto('/busca?lat=-23.5505&lng=-46.6333');
    // Click the 50km radio inside the desktop aside (mobile panel is hidden)
    const radius = page.locator('.pn-search-filters label:has-text("50 km")');
    await waitForHydration(radius);
    await radius.click();
    await page.waitForURL(/raio=50/, { timeout: 15_000 });
    await expect(page).toHaveURL(/raio=50/);
  });

  test('filtro de especialidade atualiza URL', async ({ page }) => {
    await page.goto('/busca?lat=-23.5505&lng=-46.6333');
    // Click the Ortopedia checkbox (last in the list)
    const specialty = page.locator('.pn-search-filters input[type="checkbox"]').last();
    await waitForHydration(specialty);
    await specialty.click();
    await page.waitForURL(/especialidade=/, { timeout: 15_000 });
    await expect(page).toHaveURL(/especialidade=/);
  });

  test('desktop: apenas um painel de filtros visível', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/busca?lat=-23.5505&lng=-46.6333');
    // Mobile toggle button must be hidden on desktop
    const toggleBtn = page.locator('.pn-filter-toggle-btn');
    await waitForHydration(toggleBtn);
    await expect(toggleBtn).toBeHidden();
    // Exactly one filters panel visible (the Suspense skeleton shares the class)
    await expect(page.locator('.pn-search-filters').filter({ visible: true })).toHaveCount(1);
  });

  test('mobile: toggle abre e fecha painel de filtros', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/busca?lat=-23.5505&lng=-46.6333');
    const toggleBtn = page.locator('.pn-filter-toggle-btn');
    await waitForHydration(toggleBtn);
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
    await page.goto('/');
    const specialty = page.locator('input[placeholder="Especialidade"]');
    await waitForHydration(specialty);
    await specialty.fill('Cardiologia');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/busca/, { timeout: 15_000 });
  });

  test('aba Pet sitter mostra só o campo de local', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input[placeholder="Especialidade"]')).toBeVisible();

    const petSitterTab = page.locator('button:has-text("Pet sitter")');
    await waitForHydration(petSitterTab);
    await petSitterTab.click();
    await expect(page.locator('input[placeholder="Especialidade"]')).toBeHidden();
    await expect(page.locator('input[placeholder="Cidade ou região"]')).toBeVisible();
  });

  test('busca por pet sitter retorna resultados', async ({ page }) => {
    await page.goto('/busca?tipo=pet-sitter');
    await expect(page.locator('h1')).toContainText('Pet sitters próximos');
    await expect(page.locator('body')).toContainText(/pet sitter(s)? encontrado/);
  });
});
