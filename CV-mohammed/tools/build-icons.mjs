// Génère assets/vendor/lucide-icons.min.js avec uniquement les icônes utilisées par index.html.
// Usage : npm run build:icons (à relancer après l'ajout d'une icône).
import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import * as lucide from 'lucide';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const pascal = (s) => s.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
// Tous les mots du fichier qui correspondent à un nom d'icône (inclut les noms construits en JavaScript).
const names = [...new Set(html.match(/[a-z][a-z0-9]*(?:-[a-z0-9]+)*/g))]
  .map(pascal)
  .filter((n) => Array.isArray(lucide[n]) && n !== 'Icons')
  .sort();

const entry = `import { createIcons, ${names.join(', ')} } from 'lucide';
const icons = { ${names.join(', ')} };
window.lucide = { icons, createIcons: (options = {}) => createIcons({ icons, ...options }) };`;
const result = await build({
  stdin: { contents: entry, resolveDir: new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1') },
  bundle: true, minify: true, format: 'iife', target: ['safari14', 'chrome90', 'firefox90'], write: false,
  banner: { js: `/* Lucide 0.469.0 (ISC) — ${names.length} icônes utilisées par index.html. Généré par tools/build-icons.mjs */` }
});
await writeFile(new URL('../assets/vendor/lucide-icons.min.js', import.meta.url), result.outputFiles[0].text);
console.log(`${names.length} icônes, ${Math.round(result.outputFiles[0].text.length / 1024)} Ko`);
