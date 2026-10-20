#!/usr/bin/env node
// The library's welcome row with a save that fills the Squishy Shelf card
// (PRG-5a), at 1180, 1024 and 744 wide: a fresh save never shows a full card.
//
//   node .claude/skills/know-how/hub-card-shot.mjs <outPrefix> [light|dark] [kind:colour …]
//   e.g. … <scratch>/card light bear:toffee cat:butter bunny:honey
//
// Needs Vite on 5199. Saves <outPrefix>-<width>-<theme>.png.
import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const [out, theme = 'light', ...ids] = process.argv.slice(2);
if (!out) {
  console.error('usage: node .claude/skills/know-how/hub-card-shot.mjs <outPrefix> [light|dark] [kind:colour …]');
  process.exit(1);
}
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
for (const [width, height] of [[1180, 820], [1024, 768], [744, 1133]]) {
  await page.setViewport({ width, height });
  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.evaluate(stickers => {
    localStorage.clear();
    localStorage.setItem('ms_luna_learning_progress_v1', JSON.stringify({ selectedGrade: 'K', stickers }));
  }, ids);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click('[data-shot="open-reading"]');
  await page.waitForSelector('[data-shot="hub"]');
  await new Promise(r => setTimeout(r, 900));
  await page.screenshot({ path: `${out}-${width}-${theme}.png`, clip: { x: 0, y: 60, width, height: 160 } });
}
await browser.close();
console.log(`saved ${out}-{1180,1024,744}-${theme}.png`);
