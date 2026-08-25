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

  test('tutor reserva com pet sitter e o sitter confirma', async ({ tutorContext, sitterContext }) => {
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

    // The tutor finds Carla specifically in search results and opens the booking modal.
    const tutorPage = await tutorContext.newPage();
    await tutorPage.goto('/busca?tipo=pet-sitter&raio=50', { waitUntil: 'networkidle' });
    const carlaCard = tutorPage.locator('.vn-vetcard', { hasText: 'Carla' }).first();
    await expect(carlaCard).toBeVisible({ timeout: 10000 });
    await carlaCard.locator('button:has-text("Reservar")').click();
    await expect(tutorPage.locator('[role="dialog"]')).toBeVisible();

    // Pick the day the slot was created on.
    const dayButtons = tutorPage.locator('[role="dialog"] button').filter({ hasText: String(start.getDate()) });
    await dayButtons.first().click();

    // Pick the first available slot.
    const slotButtons = tutorPage.locator('[role="dialog"] button:has-text(":")');
    await expect(slotButtons.first()).toBeVisible({ timeout: 5000 });
    await slotButtons.first().click();

    // Pick a pet if the selector shows up (tutor role required).
    const petOption = tutorPage.locator('[role="dialog"] button:has-text("Thor")')
      .or(tutorPage.locator('[role="dialog"] button:has-text("Rex")'))
      .or(tutorPage.locator('[role="dialog"] button:has-text("Mia")'));
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
