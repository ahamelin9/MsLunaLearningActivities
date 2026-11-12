#!/usr/bin/env node
// The Teacher's corner, shot and measured (DES-29).
//
//   node .claude/skills/know-how/teacher-corner-shot.mjs <outDir> [port=5199] [words=cat,dog,rain|none]
//
// Needs Vite on the port. With a save at Kindergarten (and the words picked),
// it opens the corner from the home screen's apple (a 2.3s hold past the
// gate) at the four iPad sizes, in light and dark, and saves
// <outDir>/<theme>-<WxH>.png. For each it prints whether the window scrolls
// (its card's scrollHeight against its height) and where the two panels sit:
// side by side on landscape, stacked on portrait. It exits 1 if a landscape
// size scrolls or its panels aren't side by side, or a portrait one's aren't
// stacked.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const outDir = process.argv[2];
if (!outDir) throw new Error('usage: teacher-corner-shot.mjs <outDir> [port] [words]');
const port = process.argv.find(a => /^\d{4,}$/.test(a)) ?? '5199';
const wordsArg = process.argv.slice(3).find(a => !/^\d{4,}$/.test(a)) ?? 'cat,dog,rain';
const words = wordsArg === 'none' ? [] : wordsArg.split(',');
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const SIZES = [[1180, 820], [1024, 768], [820, 1180], [744, 1133]];
let failed = 0;

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
for (const theme of ['light', 'dark']) {
  for (const [w, h] of SIZES) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, hasTouch: true });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
    await page.evaluate(ws => {
      localStorage.clear();
      localStorage.setItem('ms_luna_learning_progress_v1', JSON.stringify({ selectedGrade: 'kindergarten', settings: { weekWords: ws } }));
    }, words);
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector(at('open-settings'));
    await wait(1200);
    const apple = await (await page.$(at('open-settings'))).boundingBox();
    await page.mouse.move(apple.x + apple.width / 2, apple.y + apple.height / 2);
    await page.mouse.down();
    await wait(2300);
    await page.mouse.up();
    await page.waitForSelector(at('settings'));
    await wait(600);
    const m = await page.evaluate(() => {
      const card = document.querySelector('[data-shot="settings"]');
      const a = document.querySelector('[data-shot="my-class"]').getBoundingClientRect();
      const b = document.querySelector('[data-shot="this-device"]').getBoundingClientRect();
      return { scroll: card.scrollHeight - card.clientHeight, cardH: card.clientHeight, a: [a.x, a.y, a.width, a.height], b: [b.x, b.y, b.width, b.height] };
    });
    const landscape = w > h;
    const side = Math.abs(m.a[1] - m.b[1]) < 2 && m.b[0] > m.a[0] + m.a[2];
    const stacked = m.b[1] >= m.a[1] + m.a[3];
    const ok = landscape ? m.scroll <= 1 && side : stacked;
    if (!ok) failed++;
    console.log(`${ok ? '✅' : '❌'} ${theme} ${w}x${h}: ${landscape ? (side ? 'side by side' : 'NOT side by side') : stacked ? 'stacked' : 'NOT stacked'}, ${m.scroll > 1 ? `scrolls ${m.scroll}px` : 'no scroll'} (card ${m.cardH}px; My class ${Math.round(m.a[3])}px, On this device ${Math.round(m.b[3])}px tall)`);
    await page.screenshot({ path: `${outDir}/${theme}-${w}x${h}.png` });
    await page.close();
  }
}
await browser.close();
console.log(failed ? `\n${failed} FAILED` : '\nALL PASS');
process.exit(failed ? 1 : 0);
