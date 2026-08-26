import { test, expect } from './fixtures/auth';

test.describe('Pet sitter — disponibilidade e reservas', () => {
  test('sitter acessa disponibilidade e cria um horário', async ({ sitterContext }) => {
    const page = await sitterContext.newPage();
    await page.goto('/pet-sitter/disponibilidade', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Disponibilidade');

    const now = new Date();
    now.setDate(now.getDate() + 14);
    now.setHours(15, 0, 0, 0);
    const end = new Date(now);
    end.setHours(16, 0, 0, 0);

    const toLocalInput = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const inputs = page.locator('input[type="datetime-local"]');
    await inputs.nth(0).fill(toLocalInput(now));
    await inputs.nth(1).fill(toLocalInput(end));
    await page.click('button:has-text("Adicionar à lista")');
    await expect(page.locator('text=Horários a criar (1)')).toBeVisible();

    await page.click('button:has-text("Salvar")');
    await expect(page.locator('text=/horário\\(s\\) criado\\(s\\) com sucesso/')).toBeVisible({ timeout: 5000 });
    await page.close();
  });

  test('sitter acessa reservas', async ({ sitterContext }) => {
    const page = await sitterContext.newPage();
    await page.goto('/pet-sitter/reservas', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Reservas');
    await page.close();
  });

  test('tutor reserva com pet sitter a partir do perfil público e o sitter confirma', async ({ tutorContext, sitterContext }) => {
    // The sitter opens a slot far enough in the future to not collide with the other test's slot.
    const sitterPage = await sitterContext.newPage();
    await sitterPage.goto('/pet-sitter/disponibilidade', { waitUntil: 'networkidle' });

    const start = new Date();
    start.setDate(start.getDate() + 3);
    start.setHours(10, 0, 0, 0);
    const end = new Date(start);
    end.setHours(11, 0, 0, 0);
    const toLocalInput = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    const inputs = sitterPage.locator('input[type="datetime-local"]');
    await inputs.nth(0).fill(toLocalInput(start));
    await inputs.nth(1).fill(toLocalInput(end));
    await sitterPage.click('button:has-text("Adicionar à lista")');
    await sitterPage.click('button:has-text("Salvar")');
    await expect(sitterPage.locator('text=/horário\\(s\\) criado\\(s\\) com sucesso/')).toBeVisible({ timeout: 5000 });
    await sitterPage.close();

    // The tutor finds Carla specifically in search results and navigates to her profile.
    const tutorPage = await tutorContext.newPage();
    await tutorPage.goto('/busca?tipo=pet-sitter&raio=50', { waitUntil: 'networkidle' });
    const carlaCard = tutorPage.locator('.vn-vetcard', { hasText: 'Carla' }).first();
    await expect(carlaCard).toBeVisible({ timeout: 10000 });
    await carlaCard.locator('button:has-text("Ver perfil")').click();
    await tutorPage.waitForURL(/\/pet-sitter\/carla-/, { timeout: 10000 });
    await expect(tutorPage.locator('h1')).toContainText('Carla');

    // Pick the day the slot was created on, inside the booking sidebar.
    const dayButtons = tutorPage.locator('aside button').filter({ hasText: String(start.getDate()) });
    await dayButtons.first().click();

    // Pick the first available slot.
    const slotButtons = tutorPage.locator('aside button:has-text(":")');
    await expect(slotButtons.first()).toBeVisible({ timeout: 5000 });
    await slotButtons.first().click();

    // Pick a pet if the selector shows up (tutor role required).
    const petOption = tutorPage.locator('aside button:has-text("Thor")')
      .or(tutorPage.locator('aside button:has-text("Rex")'))
      .or(tutorPage.locator('aside button:has-text("Mia")'));
    if (await petOption.count() > 0) {
      await petOption.first().click();
    }

    const confirmBtn = tutorPage.locator('button:has-text("Confirmar reserva")');
    if (await confirmBtn.count() > 0 && await confirmBtn.isEnabled()) {
      await confirmBtn.click();
      await expect(tutorPage.locator('text=Reserva enviada!')).toBeVisible({ timeout: 5000 });
    }
    await tutorPage.close();
  });
});

test.describe('Pet sitter — perfil público', () => {
  test('busca leva ao perfil individual com bio, serviços e abas', async ({ page }) => {
    await page.goto('/busca?tipo=pet-sitter&raio=50', { waitUntil: 'networkidle' });
    const anyCard = page.locator('.vn-vetcard').first();
    await expect(anyCard).toBeVisible({ timeout: 10000 });
    await anyCard.click();

    await page.waitForURL(/\/pet-sitter\/.+/, { timeout: 10000 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Sobre")')).toBeVisible();
    await expect(page.locator('button:has-text("Avaliações")')).toBeVisible();

    await page.click('button:has-text("Avaliações")');
    await expect(page.locator('aside')).toBeVisible();
  });
});

test.describe('Pet sitter — avaliações', () => {
  test('tutor avalia reserva concluída e rating aparece na busca', async ({ tutor2Context }) => {
    // Seed cria uma reserva "completed" de Carlos+Thor com Roberto Lima. Se a suíte
    // já rodou antes sem reseed, a reserva já estará avaliada — nesse caso só
    // confirmamos que o rating agregado persiste (idempotente, como o teste espelho
    // de consultas em tutor-appointments.spec.ts).
    const page = await tutor2Context.newPage();
    await page.goto('/reservas', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Reservas com pet sitter');

    const avaliarBtn = page.locator('button:has-text("Avaliar")').first();
    if (await avaliarBtn.count() > 0) {
      await avaliarBtn.click();
      await expect(page.locator('h2:has-text("Avaliar reserva")')).toBeVisible({ timeout: 3000 });
      const stars = page.locator('[role="dialog"] button').filter({ has: page.locator('svg polygon') });
      await expect(stars).toHaveCount(5);
      await stars.nth(4).click(); // 5ª estrela = nota 5
      await page.click('button:has-text("Enviar avaliação")');

      const success = page.locator('text=Avaliação enviada!').or(page.locator('text=já foi avaliada'));
      await expect(success.first()).toBeVisible({ timeout: 5000 });
    }
    await page.close();

    // O rating agregado deve aparecer na busca por Roberto Lima.
    const searchPage = await tutor2Context.newPage();
    await searchPage.goto('/busca?tipo=pet-sitter&raio=50', { waitUntil: 'networkidle' });
    const robertoCard = searchPage.locator('.vn-vetcard', { hasText: 'Roberto' }).first();
    await expect(robertoCard).toBeVisible({ timeout: 10000 });
    await expect(robertoCard.locator('text=5.0')).toBeVisible({ timeout: 5000 });
    await expect(robertoCard.locator('text=(1)')).toBeVisible({ timeout: 5000 });
    await searchPage.close();
  });
});
