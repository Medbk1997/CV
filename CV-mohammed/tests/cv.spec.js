import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.jsErrors = [];
  page.on('pageerror', (error) => page.jsErrors.push(error.message));
  await page.goto('cv.html');
});

test('le CV se charge sans erreur JavaScript', async ({ page }) => {
  await expect(page).toHaveTitle(/CV — Mohammed KELLA BENNANI/);
  await expect(page.locator('h1.name')).toContainText('Mohammed');
  expect(page.jsErrors).toEqual([]);
});

test('le bouton « Exporter en PDF » ouvre l’impression', async ({ page }) => {
  await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
  await page.getByRole('button', { name: 'Exporter en PDF' }).click();
  expect(await page.evaluate(() => window.__printed)).toBe(1);
});

test('le lien ?print=1 lance l’impression automatiquement', async ({ page }) => {
  await page.addInitScript(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
  await page.goto('cv.html?print=1');
  await page.waitForLoadState('load');
  await expect.poll(() => page.evaluate(() => window.__printed)).toBe(1);
});

test('le texte du CV est du vrai texte, lisible par une machine', async ({ page }) => {
  const text = await page.locator('#page').innerText();
  for (const term of ['Test Lead', 'QA Engineer', 'ISTQB', 'Jira', 'Postman', 'SQL', 'Lyon']) {
    expect(text, `terme absent du texte : ${term}`).toContain(term);
  }
});

// Ordre de lecture pour les ATS : un logiciel qui extrait le texte du PDF le lit
// dans l'ordre du code HTML, pas dans l'ordre visuel. Le nom et l'expérience
// doivent donc précéder la colonne latérale (compétences, langues…).
// Ce test est marqué « échec attendu » : il documente le défaut actuel.
// Quand l'ordre sera corrigé, Playwright signalera qu'il passe : il suffira de retirer test.fail().
test('ordre de lecture ATS : nom et expérience avant les compétences', async ({ page }) => {
  test.fail(true, 'Défaut connu : la colonne latérale précède le contenu principal dans le code.');
  const order = await page.locator('#page').evaluate((root) =>
    [...root.querySelectorAll('h1, h2')].map((h) => h.textContent.trim().split(/\s+/)[0])
  );
  expect(order.indexOf('Mohammed')).toBeLessThan(order.indexOf('Compétences'));
  expect(order.indexOf('Expérience')).toBeLessThan(order.indexOf('Compétences'));
});

test.describe('export PDF (moteur Chromium)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'page.pdf() n’existe que dans Chromium');

  test('le CV tient sur une seule page A4', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length;
    expect(pages).toBe(1);
  });
});
