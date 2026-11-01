// Erzeugt die App-Icons (PNG) aus icons/icon.svg mit dem Canvas von Chromium.
// Aufruf im Projektordner:  node tools/make-icons.mjs
// Benötigt Playwright (npm i -D playwright). Die erzeugten PNGs sind im Repo enthalten,
// das Skript ist nur nötig, wenn du das Icon änderst.
import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';

const svg = await readFile(new URL('../icons/icon.svg', import.meta.url), 'utf8');
const targets = [
  { file: 'apple-touch-icon.png', size: 180, round: false }, // iOS rundet selbst ab, kein Alpha
  { file: 'icon-maskable-512.png', size: 512, round: false }, // Motiv liegt in der Safe Zone
  { file: 'icon-192.png', size: 192, round: true },
  { file: 'icon-512.png', size: 512, round: true },
  { file: 'favicon-32.png', size: 32, round: true },
];

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<html><body></body></html>');
for (const t of targets) {
  const dataUrl = await page.evaluate(async ({ svg, size, round }) => {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await img.decode();
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    if (round) {
      const r = size * 0.225;
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, r);
      ctx.clip();
    }
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, size, size);
    return c.toDataURL('image/png');
  }, { svg, size: t.size, round: t.round });
  await writeFile(new URL('../icons/' + t.file, import.meta.url), Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('icons/' + t.file, t.size + 'px');
}
await browser.close();
