import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// Règles de contenu, vérifiées dans le code source (y compris les textes générés en JavaScript,
// comme les réponses de l'assistant) : elles valent donc aussi pour le PDF tiré de cv.html.
const FILES = ['index.html', 'cv.html', 'worker/index.js'];

for (const file of FILES) {
  test(`${file} : aucune date de disponibilité`, async () => {
    const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    expect(source).not.toMatch(/disponible (depuis|à partir|dès|le)|disponibilit[ée] (immédiate|le|au)|\b01\/11\/2026\b|1er novembre 2026/i);
  });
}
