import { test, expect } from '@playwright/test';

/**
 * Every internal link in the shared header and footer must resolve. Besides the broken
 * experience, a link to a missing page is prefetched as a 404 whose body Next's router
 * never consumes — five of those held the browser's connections and stalled navigation.
 */
test('links internos do cabeçalho e do rodapé não levam a 404', async ({ page, request }) => {
  await page.goto('/');
  const hrefs = await page
    .locator('header a[href^="/"], footer a[href^="/"]')
    .evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute('href') ?? ''))]);
  expect(hrefs.length).toBeGreaterThan(3);

  for (const href of hrefs) {
    const path = href.split('#')[0] || '/';
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), `${href} respondeu ${res.status()}`).toBeLessThan(400);
  }
});
