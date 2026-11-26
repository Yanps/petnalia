import { apiLogin, createSlot, SEED_PASSWORD, waitForHydration } from './fixtures/api';
import { test, expect } from './fixtures/auth';

/**
 * Critical flow: a tutor books a home visit from the vet's public profile and the vet
 * confirms it. The slot is created per run, at a random minute, so the test is
 * independent of seed slots and can be re-run on the same database.
 */
test.describe('Agendamento de consulta com veterinário', () => {
  test('tutor agenda pelo perfil público e o veterinário confirma', async ({ request, tutorContext, vetContext }) => {
    const vetToken = await apiLogin(request, 'dra.beatriz@petnalia.com', SEED_PASSWORD);
    const profile = await request.get(`${process.env.E2E_API_URL ?? 'http://localhost:4000'}/v1/veterinarians/me`, {
      headers: { Authorization: `Bearer ${vetToken}` },
    });
    const { slug } = (await profile.json()) as { slug: string };

    // 1–5 days ahead (inside the sidebar's 7-day window in any timezone), 05:00–05:55 UTC.
    const startsAt = new Date();
    startsAt.setUTCDate(startsAt.getUTCDate() + 1 + Math.floor(Math.random() * 5));
    startsAt.setUTCHours(5, Math.floor(Math.random() * 56), 0, 0);
    await createSlot(request, vetToken, startsAt);

    const page = await tutorContext.newPage();
    await page.goto(`/vet/${slug}`);

    // Labels as the browser renders them (its own timezone/locale).
    const labels = await page.evaluate((iso) => {
      const d = new Date(iso);
      return {
        day: String(d.getDate()),
        time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        full: d.toLocaleDateString('pt-BR', {
          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
      };
    }, startsAt.toISOString());

    const sidebar = page.locator('aside').filter({ hasText: 'Agendar consulta' });
    const dayButton = sidebar.getByRole('button', { name: new RegExp(`^${labels.day}\\b`) });
    await waitForHydration(dayButton);
    await dayButton.click();
    await sidebar.getByRole('button', { name: labels.time, exact: true }).click();
    await sidebar.getByRole('button', { name: 'Confirmar agendamento' }).click();
    // The sidebar swaps its content for the confirmation, so look it up on the page.
    await expect(page.getByText('Consulta agendada!')).toBeVisible({ timeout: 10_000 });

    await page.getByRole('link', { name: 'Ver minhas consultas' }).click();
    await expect(page).toHaveURL(/\/consultas/);
    const tutorCard = page
      .getByText(labels.full, { exact: true })
      .locator('xpath=ancestor::div[.//span[normalize-space()="Pendente"]][1]');
    await expect(tutorCard).toBeVisible();

    const vetPage = await vetContext.newPage();
    await vetPage.goto('/vet/consultas');
    const confirmButton = vetPage
      .getByText(labels.full, { exact: true })
      .locator('xpath=ancestor::div[.//button[normalize-space()="Confirmar"]][1]')
      .getByRole('button', { name: 'Confirmar' });
    await waitForHydration(confirmButton);
    await confirmButton.click();
    await expect(
      vetPage
        .getByText(labels.full, { exact: true })
        .locator('xpath=ancestor::div[.//span[normalize-space()="Confirmada"]][1]'),
    ).toBeVisible({ timeout: 10_000 });
  });
});
