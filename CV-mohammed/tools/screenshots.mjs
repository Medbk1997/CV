// Captures d'écran du portfolio et du CV sur plusieurs appareils et thèmes.
// Usage : node tools/screenshots.mjs <dossier>   (ex. : avant, apres)
// Nécessite le serveur local : npm run serve
import { chromium, webkit, devices } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const label = process.argv[2] || 'captures';
const base = process.env.BASE_URL || 'http://localhost:8000/';
const out = new URL(`../screenshots/${label}/`, import.meta.url);
await mkdir(out, { recursive: true });

const targets = [
  { name: 'desktop', engine: chromium, device: { viewport: { width: 1440, height: 900 } } },
  { name: 'iphone', engine: webkit, device: devices['iPhone 15'] },
  { name: 'android', engine: chromium, device: devices['Pixel 7'] },
  { name: 'ipad', engine: webkit, device: devices['iPad (gen 7)'] }
];
const pages = [
  { name: 'portfolio', path: 'index.html', themes: ['light', 'dark'] },
  { name: 'cv', path: 'cv.html', themes: ['light'] }
];

for (const target of targets) {
  const browser = await target.engine.launch();
  for (const page of pages) {
    for (const theme of page.themes) {
      const context = await browser.newContext({ ...target.device, colorScheme: theme, reducedMotion: 'reduce' });
      // Le relais IA est bloqué : les captures ne consomment rien.
      await context.route('**/cv-gemini-relay.**', (route) => route.abort());
      const tab = await context.newPage();
      await tab.goto(base + page.path, { waitUntil: 'networkidle' });
      await tab.evaluate(() => document.fonts.ready);
      await tab.waitForTimeout(400);
      // Pages très longues : découpage en tranches (limite de 32 767 px par image).
      const { width, height } = await tab.evaluate(() => ({ width: document.documentElement.clientWidth, height: document.documentElement.scrollHeight }));
      const slice = 6000;
      for (let y = 0, part = 1; y < height; y += slice, part++) {
        const suffix = height > slice ? `-${String(part).padStart(2, '0')}` : '';
        const file = `${page.name}-${target.name}-${theme}${suffix}.png`;
        await tab.screenshot({ path: fileURLToPath(new URL(file, out)), fullPage: true, clip: { x: 0, y, width, height: Math.min(slice, height - y) } });
        console.log(`${label}/${file}`);
      }
      console.log(`  hauteur totale : ${height} px`);
      await context.close();
    }
  }
  await browser.close();
}
