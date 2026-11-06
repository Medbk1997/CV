import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Contrôle automatique WCAG 2 A/AA (contrastes, libellés, structure) avec axe-core.
// Exclusion : les logos de la galaxie des outils (#gxStage .gx-node). Ce sont des logotypes de marques,
// exemptés du critère de contraste (WCAG 1.4.3) ; leur nom est donné par l'attribut title.
test.skip(({ browserName }) => browserName !== 'chromium', 'axe est exécuté une fois, dans Chromium');

for (const theme of ['light', 'dark']) {
  for (const page of ['index.html', 'cv.html']) {
    test(`${page} (${theme}) : aucune violation WCAG A/AA`, async ({ browser }) => {
      // Défaut connu du CV, en attente de validation du design : nom « KELLA BENNANI » en cyan #12abdb
      // (2,66:1, minimum 3:1) et bouton blanc sur cyan de la barre d'outils.
      test.fail(page === 'cv.html', 'Contrastes du CV : correction à valider');
      const context = await browser.newContext({ colorScheme: theme, reducedMotion: 'reduce' });
      await context.route('**/cv-gemini-relay.**', (route) => route.abort());
      const tab = await context.newPage();
      await tab.goto(`http://localhost:8000/${page}`, { waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page: tab }).withTags(['wcag2a', 'wcag2aa']).exclude('#gxStage .gx-node').analyze();
      const summary = results.violations.flatMap((v) => v.nodes.map((n) => `${v.id} : ${n.target.join(' ')}`));
      expect(summary).toEqual([]);
      await context.close();
    });
  }
}
