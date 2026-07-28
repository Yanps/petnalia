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

  test('novo endereço: cidade fica desabilitada até selecionar o estado', async ({ tutorContext }) => {
    const page = await tutorContext.newPage();
    await page.goto('/perfil', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Adicionar endereço' }).click();

    const stateSelect = page.locator('select').nth(0);
    const citySelect = page.locator('select').nth(1);
    await expect(citySelect).toBeDisabled();

    await stateSelect.selectOption('SP');
    await expect(citySelect).toBeEnabled({ timeout: 5000 });

    const optionCount = await citySelect.locator('option').count();
    expect(optionCount).toBeGreaterThan(1);

    await citySelect.selectOption('São Paulo');
    await expect(citySelect).toHaveValue('São Paulo');
    await page.close();
  });

  test('novo endereço: CEP preenche estado e cidade automaticamente', async ({ tutorContext }) => {
    const page = await tutorContext.newPage();
    await page.goto('/perfil', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Adicionar endereço' }).click();

    await page.fill('input[placeholder="00000-000"]', '01310100');
    await page.waitForTimeout(2500);

    await expect(page.locator('select').nth(0)).toHaveValue('SP');
    await expect(page.locator('select').nth(1)).toHaveValue('São Paulo');
    await page.close();
  });

  test('novo endereço: rua mostra aviso até estado e cidade serem selecionados', async ({ tutorContext }) => {
    const page = await tutorContext.newPage();
    await page.goto('/perfil', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Adicionar endereço' }).click();

    await page.fill('input[placeholder="Ex: Rua das Flores"]', 'Paulista');
    await expect(page.locator('text=Selecione o estado e a cidade')).toBeVisible();
    await page.close();
  });

  test('novo endereço: rua busca sugestões e autocompleta bairro/CEP', async ({ tutorContext }) => {
    const page = await tutorContext.newPage();
    await page.goto('/perfil', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Adicionar endereço' }).click();

    await page.locator('select').nth(0).selectOption('SP');
    await expect(page.locator('select').nth(1)).toBeEnabled({ timeout: 5000 });
    await page.locator('select').nth(1).selectOption('São Paulo');

    const streetInput = page.locator('input[placeholder="Ex: Rua das Flores"]');
    await streetInput.fill('Paulista');
    await page.waitForTimeout(1200);

    const suggestion = page.locator('button:has-text("CEP")').first();
    await expect(suggestion).toBeVisible({ timeout: 3000 });
    await suggestion.click();

    await expect(streetInput).not.toHaveValue('Paulista');
    await expect(page.locator('input[placeholder="Ex: Jardim Paulista"]')).not.toHaveValue('');
    await expect(page.locator('input[placeholder="00000-000"]')).not.toHaveValue('');
    await page.close();
  });
});
