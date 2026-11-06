import { test, expect } from '@playwright/test';

// Autonomie : le portfolio et le CV ne doivent dépendre d'aucun site externe
// (CDN, Google Fonts, images hébergées ailleurs). Si une ressource externe
// disparaît, les pages doivent rester identiques.
// Seule exception autorisée : le relais IA (fonction optionnelle, simulée ici).
const RELAY_HOST = 'cv-gemini-relay.mohammedkella8.workers.dev';

for (const path of ['index.html', 'cv.html']) {
  test(`${path} : aucune ressource chargée depuis un autre site`, async ({ page, baseURL }) => {
    const local = new URL(baseURL).host;
    const external = [];
    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (url.protocol === 'data:' || url.host === local) return route.continue();
      if (url.host === RELAY_HOST) return route.fulfill({ status: 200, contentType: 'application/json', body: '{"reply":"ok"}' });
      external.push(url.href);
      return route.abort();
    });
    await page.goto(path, { waitUntil: 'networkidle' });
    expect(external, 'ressources externes détectées').toEqual([]);
  });

  test(`${path} : polices et images locales bien chargées`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.fonts.check('16px Ubuntu'))).toBe(true);
    const broken = await page.locator('img').evaluateAll((imgs) =>
      imgs.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.getAttribute('src'))
    );
    expect(broken).toEqual([]);
  });
}

test('index.html : les icônes Lucide sont rendues sans CDN', async ({ page }) => {
  await page.goto('index.html', { waitUntil: 'networkidle' });
  await expect(page.locator('svg.lucide').first()).toBeAttached();
  expect(await page.locator('[data-lucide]:not(svg)').count(), 'icônes non converties').toBe(0);
});
