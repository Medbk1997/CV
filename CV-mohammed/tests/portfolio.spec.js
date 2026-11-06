import { test, expect } from '@playwright/test';

const RELAY = '**/cv-gemini-relay.mohammedkella8.workers.dev/**';
const JOB_OFFER = `Nous recherchons un Test Lead pour piloter une équipe QA.
La maîtrise de Jira est obligatoire. La certification ISTQB est indispensable.
Une expérience Cypress serait un plus.`;

// Le relais Gemini est simulé : les tests ne consomment jamais votre quota
// et ne dépendent pas de la disponibilité de Google.
async function mockRelay(page, reply = 'Réponse simulée par le test.') {
  const calls = [];
  await page.route(RELAY, async (route) => {
    if (route.request().method() === 'POST') calls.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply }) });
  });
  return calls;
}

test.beforeEach(async ({ page }) => {
  page.jsErrors = [];
  page.on('pageerror', (error) => page.jsErrors.push(error.message));
  await mockRelay(page);
  await page.goto('index.html');
});

test('la page se charge sans erreur JavaScript', async ({ page }) => {
  await expect(page).toHaveTitle(/Mohammed KELLA BENNANI/);
  await expect(page.locator('h1').first()).toBeVisible();
  await page.waitForLoadState('load');
  expect(page.jsErrors).toEqual([]);
});

test('aucun défilement horizontal (largeur de l’écran respectée)', async ({ page }) => {
  await page.waitForLoadState('load');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'contenu plus large que l’écran').toBeLessThanOrEqual(1);
});

test('toutes les images sont chargées', async ({ page }) => {
  await page.waitForLoadState('load');
  const broken = await page.locator('img').evaluateAll((imgs) =>
    imgs.filter((img) => img.complete && img.naturalWidth === 0 && img.offsetParent !== null).map((img) => img.alt || img.src.slice(0, 60))
  );
  expect(broken).toEqual([]);
});

test('le thème sombre se bascule et est mémorisé après rechargement', async ({ page }) => {
  const html = page.locator('html');
  const wasDark = await html.evaluate((el) => el.classList.contains('dark'));
  await page.locator('#themeBtn').click();
  await expect(html).toHaveClass(wasDark ? /^(?!.*\bdark\b)/ : /\bdark\b/);
  await page.reload();
  await expect(html).toHaveClass(wasDark ? /^(?!.*\bdark\b)/ : /\bdark\b/);
});

test('la recherche (palette de commandes) filtre et se ferme avec Échap', async ({ page }) => {
  await page.locator('#searchBtn').click();
  const dialog = page.getByRole('dialog', { name: 'Recherche dans le CV' });
  await expect(dialog).toBeVisible();
  await page.locator('#commandInput').fill('contact');
  await expect(page.locator('#commandList [role="option"]').first()).toHaveText('Contact');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('analyse d’offre : un texte trop court affiche un avertissement', async ({ page }) => {
  await page.locator('#jobText').fill('Test Lead');
  await page.locator('#analyzeJob').click();
  await expect(page.locator('#jobResult')).toContainText('description un peu plus complète');
});

test('analyse d’offre : la réponse IA et la couverture pondérée s’affichent', async ({ page }) => {
  await page.unrouteAll();
  const calls = await mockRelay(page, '**Correspondances avec le CV**\nJira et ISTQB sont confirmés.');
  await page.locator('#jobText').fill(JOB_OFFER);
  await page.locator('#analyzeJob').click();
  const result = page.locator('#jobResult');
  await expect(result).toContainText('Jira et ISTQB sont confirmés');
  // Confirmés : Jira (obligatoire, 2) + ISTQB (obligatoire, 2) + « équipe QA » (obligatoire par proximité, 2)
  // Non établi : Cypress (souhaité, 1)  =>  6 / 7 = 86 %
  await expect(result.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '86');
  await expect(result).toContainText('6/7 points confirmés');
  expect(calls).toHaveLength(1);
  expect(calls[0]).toMatchObject({ action: 'analyze-offer' });
});

test('analyse d’offre : une panne du relais affiche un message clair', async ({ page }) => {
  await page.unrouteAll();
  await page.route(RELAY, (route) => route.fulfill({ status: 502, contentType: 'application/json', body: '{"error":"down"}' }));
  await page.locator('#jobText').fill(JOB_OFFER);
  await page.locator('#analyzeJob').click();
  await expect(page.locator('#jobResult')).toContainText('Impossible d’analyser l’offre');
  await expect(page.locator('#analyzeJob')).toBeEnabled();
});

test('l’assistant répond à une question', async ({ page }) => {
  await page.unrouteAll();
  const calls = await mockRelay(page, 'Mohammed est certifié ISTQB CTFL v4.0.');
  // Le robot flotte en continu ; le site respecte « réduire les animations »,
  // ce qui rend le bouton immobile et cliquable de façon fiable.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#assistantLaunch').click();
  await expect(page.getByRole('region', { name: 'Assistant du CV' })).toBeVisible();
  await page.locator('#chatInput').fill('Quelle certification ?');
  await page.locator('#chatSend').click();
  await expect(page.locator('#chatMessages')).toContainText('certifié ISTQB CTFL v4.0');
  expect(calls[0].action).toBe('chat');
});

test('les liens vers le CV et le contact sont corrects', async ({ page }) => {
  await expect(page.locator('a[href="https://medbk1997.github.io/CV/CV-mohammed/cv.html"]').first()).toBeAttached();
  await expect(page.locator('a[href^="mailto:mkellabennani@gmail.com"]').first()).toBeAttached();
  await expect(page.locator('a[href="https://www.linkedin.com/in/mkellabennani"]').first()).toBeAttached();
});

test.describe('galaxie des outils', () => {
  // Animation arrêtée (préférence « réduire les animations ») pour cliquer des logos immobiles.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.locator('#ecosysteme').scrollIntoViewIfNeeded();
  });

  test('HP ALM au centre et les 13 autres outils affichés', async ({ page }) => {
    await expect(page.locator('#gxStage .gx-node')).toHaveCount(14);
    await expect(page.locator('#gxStage .gx-node.sun')).toHaveAttribute('data-id', 'alm');
    await expect(page.locator('#gxStage .gx-station')).toHaveCount(5);
  });

  test('un logo affiche sa fiche et ses relations', async ({ page }) => {
    await page.locator('#gxStage .gx-node[data-id="uft"]').dispatchEvent('click');
    const detail = page.locator('#gxDetail');
    await expect(detail).toContainText('UFT One');
    await expect(detail).toContainText('lancés depuis le Test Lab');
  });

  test('une étape affiche ses outils', async ({ page }) => {
    await page.locator('#gxStage .gx-station').nth(3).dispatchEvent('click');
    await expect(page.locator('#gxDetail')).toContainText('Suivi des anomalies');
    await expect(page.locator('#gxDetail')).toContainText('Jira');
  });

  test('les flux se filtrent et se réaffichent', async ({ page }) => {
    const all = page.getByRole('button', { name: 'Tout afficher' });
    await expect(all).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#gxFlows button', { hasText: 'Anomalies' }).click();
    await expect(page.locator('#gxFlows button', { hasText: 'Anomalies' })).toHaveAttribute('aria-pressed', 'true');
    await expect(all).toHaveAttribute('aria-pressed', 'false');
    await all.click();
    await expect(all).toHaveAttribute('aria-pressed', 'true');
  });

  test('le bouton pause est disponible (WCAG 2.2.2)', async ({ page }) => {
    const pause = page.locator('#gxPause');
    await expect(pause).toHaveText('Relancer l’animation');
    await pause.click();
    await expect(pause).toHaveText('Mettre en pause');
  });

  test('« Demander à l’assistant » depuis une fiche', async ({ page }) => {
    await page.locator('#gxStage .gx-node[data-id="jira"]').dispatchEvent('click');
    await page.locator('#gxDetail .gx-ask').click();
    await expect(page.getByRole('region', { name: 'Assistant du CV' })).toBeVisible();
  });
});
