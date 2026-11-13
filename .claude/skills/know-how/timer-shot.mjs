#!/usr/bin/env node
// Review shots of a round's countdown pie (CUR-16), which ui:shots never
// reaches: its run plays at Kindergarten, and the pie is 1st and 2nd grade's.
// Each shot is a game or lesson a few seconds into a round, the pie part-way.
//
//   node .claude/skills/know-how/timer-shot.mjs [port=5199] [outDir=screenshots/review/timer]
//
// Needs Vite on the port. Shoots light and dark at iPad landscape, iPad
// portrait (the narrow header) and an iPhone held upright (DES-32a).

import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromePath } from '../../../scripts/chrome-path.cjs';
import { viewportFor } from '../../../scripts/ui/sizes.mjs';

const args = process.argv.slice(2);
const port = args.find(a => /^\d+$/.test(a)) ?? '5199';
const outDir = args.find(a => !/^\d+$/.test(a)) ?? 'screenshots/review/timer';
mkdirSync(outDir, { recursive: true });
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));

// [grade card, game title or 'lesson', size]
const SHOTS = [
  [1, 'Letter Cookies', { width: 1180, height: 820 }],
  [2, 'Words Off the Page', { width: 820, height: 1180 }],
  // `phone` makes it a phone's browser (sizes.mjs), which scales the page
  [1, 'Treasure Path', { width: 390, height: 660, phone: true }],
  [1, 'lesson', { width: 744, height: 1133 }]
];

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
for (const theme of ['light', 'dark']) {
  for (const [grade, title, size] of SHOTS) {
    const page = await browser.newPage();
    await page.setViewport(viewportFor(size));
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
    await page.evaluateOnNewDocument(() => {
      window.speechSynthesis.speak = () => {};
    });
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });
    await page.click(at('open-reading'));
    await page.waitForSelector(at('grade-card'));
    await (await page.$$(at('grade-card')))[grade].click();
    await page.waitForSelector(at('hub'));
    await wait(400);
    if (title === 'lesson') {
      const { lessonCard } = await import('./library.mjs');
      await (await lessonCard(page, 0)).click();
    } else {
      for (const t of await page.$$(at('game-tile'))) {
        if ((await t.evaluate(e => e.textContent)).includes(title)) {
          await t.evaluate(e => e.scrollIntoView({ block: 'center' }));
          await t.click();
          break;
        }
      }
    }
    await page.waitForSelector(at('play'));
    await page.click(at('play'));
    await page.waitForSelector(at('countdown-pie'), { timeout: 15000 });
    // past the round's question, a few seconds into its time
    for (let t = 0; t < 12000 && (await page.$('[data-mood][data-state="talking"]')); t += 100) await wait(100);
    await wait(4200);
    const name = `${title === 'lesson' ? 'lesson' : title.toLowerCase().replace(/[^a-z]+/g, '-')}-grade${grade}-${size.width}x${size.height}-${theme}.png`;
    await page.screenshot({ path: join(outDir, name) });
    console.log(join(outDir, name), await page.$eval(at('countdown-pie'), e => e.getAttribute('aria-label')).catch(() => 'no pie'));
    await page.close();
  }
}
await browser.close();
