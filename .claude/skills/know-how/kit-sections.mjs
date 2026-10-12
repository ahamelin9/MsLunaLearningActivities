// Close-ups of kit components: each named section of the Kit page's
// Components tab, in light and dark, with one-off animations at their end
// (DES-7b). Start Vite on 5199 first, then from the repo root:
//   node .claude/skills/know-how/kit-sections.mjs <outDir> <Name> [<Name>…]
// e.g. screenshots/des7b/sections Choice ListenCue → Choice-light.png, …
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const [outDir, ...names] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 900 });
for (const mode of ['light', 'dark']) {
  await page.goto(`http://localhost:5199/?kit&tab=components&mode=${mode}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => { for (const a of document.getAnimations()) { const { iterations, endTime } = a.effect.getComputedTiming(); if (iterations !== Infinity) a.currentTime = endTime; } });
  for (const name of names) {
    const box = await page.evaluate(n => {
      const h = [...document.querySelectorAll('h3')].find(e => e.textContent.trim() === n);
      const r = h.parentElement.getBoundingClientRect();
      return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height };
    }, name);
    await page.screenshot({ path: `${outDir}/${name}-${mode}.png`, clip: box, captureBeyondViewport: true });
    console.log(`${name}-${mode}.png ${Math.round(box.height)}px`);
  }
}
await browser.close();
process.exit(0);
