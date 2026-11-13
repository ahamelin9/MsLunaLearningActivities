#!/usr/bin/env node
// The password page (OPS-14) at the four iPad sizes, light and dark, as it
// first opens and after a wrong password (`?wrong`).
//
//   node .claude/skills/know-how/password-shot.mjs <outDir> [port=5199]
//
// Needs Vite on the port (it serves gate.html as it is; the Worker isn't
// involved). Saves <outDir>/<width>x<height>-<theme>-<state>.png, and fails if
// the page scrolls or the field and button aren't on screen.
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const [out, port = '5199'] = process.argv.slice(2);
if (!out) {
  console.error('usage: node .claude/skills/know-how/password-shot.mjs <outDir> [port=5199]');
  process.exit(1);
}
await mkdir(out, { recursive: true });
const SIZES = [[1180, 820], [820, 1180], [1024, 768], [744, 1133]];
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
let failed = 0;
for (const theme of ['light', 'dark']) {
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
  for (const [width, height] of SIZES) {
    await page.setViewport({ width, height });
    for (const state of ['open', 'wrong']) {
      await page.goto(`http://localhost:${port}/gate.html${state === 'wrong' ? '?wrong' : ''}`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 400));
      const fit = await page.evaluate(() => {
        const inside = el => {
          const r = el?.getBoundingClientRect();
          return !!r && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth;
        };
        return {
          scrolls: document.documentElement.scrollHeight > innerHeight || document.documentElement.scrollWidth > innerWidth,
          field: inside(document.querySelector('input[type=password]')),
          button: inside(document.querySelector('button[type=submit]')),
          theme: document.documentElement.dataset.theme
        };
      });
      const bad = fit.scrolls || !fit.field || !fit.button || fit.theme !== theme;
      if (bad) failed += 1;
      console.log(`${bad ? '❌' : '✅'} ${width}x${height} ${theme} ${state}${bad ? ' ' + JSON.stringify(fit) : ''}`);
      await page.screenshot({ path: `${out}/${width}x${height}-${theme}-${state}.png` });
    }
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
