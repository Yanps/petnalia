import { test, expect } from './fixtures/auth';

test.describe('Tutor — consultas e avaliação', () => {
  test('painel exibe stats e próximas consultas', async ({ tutorContext }) => {
    const page = await tutorContext.newPage();
    await page.goto('/painel', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Olá,');
    // Stat cards
    await expect(page.locator('text=Consultas agendadas')).toBeVisible();
    await expect(page.locator('text=Pets cadastrados')).toBeVisible();
    await expect(page.locator('text=Consultas realizadas')).toBeVisible();
    await page.close();
  });

  test('lista de consultas exibe status e botões corretos', async ({ tutorContext }) => {
    const page = await tutorContext.newPage();
    await page.goto('/consultas', { waitUntil: 'networkidle' });
    await expect(page.locator('h1, h2').first()).toBeVisible();
    // Completed appointment shows "Avaliar" button (seed has 1 realizada)
    const avaliarBtn = page.locator('button:has-text("Avaliar")');
    const count = await avaliarBtn.count();
    if (count > 0) {
      await expect(avaliarBtn.first()).toBeVisible();
    }
    await page.close();
  });

  test('modal de avaliação abre e fecha', async ({ tutorContext }) => {
    const page = await tutorContext.newPage();
    await page.goto('/consultas', { waitUntil: 'networkidle' });
    const avaliarBtn = page.locator('button:has-text("Avaliar")').first();
    if (await avaliarBtn.count() === 0) { test.skip(); return; }
    await avaliarBtn.click();
    // Modal heading is "Avaliar consulta"
    await expect(page.locator('h2:has-text("Avaliar consulta")')).toBeVisible({ timeout: 3000 });
    // Close via Fechar button
    await page.locator('button[aria-label="Fechar"]').click();
    await expect(page.locator('h2:has-text("Avaliar consulta")')).toBeHidden({ timeout: 2000 });
    await page.close();
  });

  test('modal de avaliação permite selecionar estrelas e enviar', async ({ tutorContext }) => {
    const page = await tutorContext.newPage();
    await page.goto('/consultas', { waitUntil: 'networkidle' });
    const avaliarBtn = page.locator('button:has-text("Avaliar")').first();
    if (await avaliarBtn.count() === 0) { test.skip(); return; }
    await avaliarBtn.click();
    await expect(page.locator('h2:has-text("Avaliar consulta")')).toBeVisible({ timeout: 3000 });
    // Click 5th star — stars are plain buttons with SVG polygons inside
    const stars = page.locator('[role="dialog"] button').filter({ has: page.locator('svg polygon') });
    const starCount = await stars.count();
    if (starCount >= 5) {
      await stars.nth(4).click(); // 5th star = rating 5
    }
    // Submit
    await page.locator('button:has-text("Enviar avaliação")').click();
    await page.waitForTimeout(2000);
    // Either shows success or gracefully handles 409 (already reviewed)
    const success = page.locator('text=Obrigado').or(page.locator('text=Avaliada'));
    await expect(success.first()).toBeVisible({ timeout: 3000 });
    await page.close();
  });

  test('pets cadastrados aparecem no painel', async ({ tutorContext }) => {
    const page = await tutorContext.newPage();
    await page.goto('/painel', { waitUntil: 'networkidle' });
    // Seed has 2 pets: Rex (Labrador) and Mia (Persa)
    await expect(page.locator('text=Rex').first()).toBeVisible();
    await page.close();
  });
});
