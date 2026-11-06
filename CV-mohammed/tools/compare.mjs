// Compare deux séries de captures pixel par pixel.
// Usage : node tools/compare.mjs avant apres   -> images de différences dans screenshots/diff-<b>/
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const [a, b] = process.argv.slice(2);
const dir = (name) => fileURLToPath(new URL(`../screenshots/${name}/`, import.meta.url));
await mkdir(dir(`diff-${b}`), { recursive: true });
let worst = 0;
for (const file of (await readdir(dir(a))).filter((f) => f.endsWith('.png')).sort()) {
  const imgA = PNG.sync.read(await readFile(dir(a) + file));
  let imgB;
  try { imgB = PNG.sync.read(await readFile(dir(b) + file)); } catch { console.log(`${file} : absente dans ${b}`); continue; }
  if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
    console.log(`${file} : taille différente ${imgA.width}x${imgA.height} -> ${imgB.width}x${imgB.height}`);
    worst = 100; continue;
  }
  const diff = new PNG({ width: imgA.width, height: imgA.height });
  const n = pixelmatch(imgA.data, imgB.data, diff.data, imgA.width, imgA.height, { threshold: 0.1 });
  const pct = (100 * n) / (imgA.width * imgA.height);
  worst = Math.max(worst, pct);
  if (n) await writeFile(dir(`diff-${b}`) + file, PNG.sync.write(diff));
  console.log(`${pct.toFixed(3).padStart(7)} %  ${file}`);
}
console.log(`Écart maximal : ${worst.toFixed(3)} %`);
