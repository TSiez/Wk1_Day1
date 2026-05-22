import puppeteer from 'puppeteer';
import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const url    = process.argv[2] || 'http://localhost:3000';
const label  = process.argv[3] || '';
const width  = Number(process.argv[4] || 1440);
const height = Number(process.argv[5] || 900);

const outDir = './temporary screenshots';
await mkdir(outDir, { recursive: true });

let maxN = 0;
for (const f of await readdir(outDir)) {
  const m = f.match(/^screenshot-(\d+)/);
  if (m) maxN = Math.max(maxN, Number(m[1]));
}
const n = maxN + 1;
const filename = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
const filepath = join(outDir, filename);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  // give web fonts a beat to render
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`Saved ${filepath}`);
} finally {
  await browser.close();
}
