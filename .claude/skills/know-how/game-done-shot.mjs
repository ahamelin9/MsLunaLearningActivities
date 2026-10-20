#!/usr/bin/env node
// Shoots a game's done screen, which `ui:shots` doesn't reach (it finishes
// Lesson 1 only), at all four iPad sizes, in light or dark (PRG-9).
//
//   node .claude/skills/know-how/game-done-shot.mjs <outPrefix> [light|dark] [kind:colour …]
//
// Needs Vite on 5199. From a save at Kindergarten holding the squishies given
// (none if none), it plays Letter Cookies through, answering right, and
// shoots the done screen once it has settled. Saves <outPrefix>-<w>x<h>-<theme>.png,
// and fails if a button or the shelf runs off the bottom of the screen.
import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const [out, theme = 'light', ...owned] = process.argv.slice(2);
if (!out) {
  console.error('usage: node .claude/skills/know-how/game-done-shot.mjs <outPrefix> [light|dark] [kind:colour …]');
  process.exit(1);
}
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
const round = () => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null);

for (const [width, height] of [[1180, 820], [1024, 768], [820, 1180], [744, 1133]]) {
  await page.setViewport({ width, height });
  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.evaluate(stickers => {
    localStorage.clear();
    localStorage.setItem('ms_luna_learning_progress_v1', JSON.stringify({ selectedGrade: 'kindergarten', stickers }));
  }, owned);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  await wait(500);
  for (const t of await page.$$(at('game-tile'))) if ((await t.evaluate(e => e.textContent)).includes('Letter Cookies')) { await t.click(); break; }
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  for (let r = 0; r < 8 && !(await page.$(at('shell-reward'))); r++) {
    await page.waitForSelector(at('cookie'));
    await wait(1000);
    const now = await round();
    const answer = await page.evaluate(() => {
      const el = document.querySelector('[data-shot="cookie"]');
      const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
      for (let f = el[key]; f; f = f.return) if (f.memoizedProps?.round?.answer) return f.memoizedProps.round.answer;
      return null;
    });
    await page.evaluate(a => document.querySelector(`[data-shot="cookie"][aria-label="letter ${a}"]`)?.click(), answer);
    for (let t = 0; t < 80 && !(await page.$(at('shell-reward'))) && (await round()) === now; t++) await wait(200);
  }
  await page.waitForSelector(at('shell-reward'), { timeout: 20000 });
  // the stars land, the petals fall and a visiting moon leaves
  await wait(6000);
  await page.screenshot({ path: `${out}-${width}x${height}-${theme}.png` });
  // every button and the shelf on screen, none cut off at the bottom
  const fit = await page.evaluate(() => {
    const parts = [...document.querySelectorAll('[data-shot="shell-reward"] button, [data-shot="done-shelf"]')];
    const low = Math.max(...parts.map(e => e.getBoundingClientRect().bottom));
    return { fits: low <= window.innerHeight, low: Math.round(low), height: window.innerHeight };
  });
  console.log(`${fit.fits ? '✅' : '❌'} ${width}x${height}: lowest part ends at ${fit.low} of ${fit.height}`);
  if (!fit.fits) process.exitCode = 1;
}
await browser.close();
console.log(`saved ${out}-<size>-${theme}.png`);
