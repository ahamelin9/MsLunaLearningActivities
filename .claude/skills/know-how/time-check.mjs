#!/usr/bin/env node
// Time per lesson (PRG-6): know it before, see it after.
//
//   node .claude/skills/know-how/time-check.mjs [port=5199]
//
// Needs Vite running on the port. The page's Date.now can be moved forward
// (window.__skip) and the tab can be made hidden (window.__hidden, with a
// visibilitychange), so a minute passes in a moment. From a fresh save at
// Kindergarten it checks:
//   - every lesson card shows "about N min", and every game tile too;
//   - playing Lesson 1 with 2 minutes on screen and 1 minute hidden: the done
//     screen says it took the on-screen time only ("You took N minutes",
//     N from 2 minutes plus the real seconds), and the library's Today goes
//     up by the same N, and Lesson 1's card says "took N min";
//   - after a reload the card and Today still say so;
//   - a save from before PRG-6 (no times) loads with no page error and the
//     estimates showing.
// It fails on the commit before PRG-6, which kept no times.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const KEY = 'ms_luna_learning_progress_v1';
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.evaluateOnNewDocument(() => {
  window.speechSynthesis.speak = () => {};
  // a clock the check can move on, and a tab it can hide
  window.__skip = 0;
  window.__hidden = false;
  const realNow = Date.now.bind(Date);
  Date.now = () => realNow() + window.__skip;
  Object.defineProperty(Document.prototype, 'hidden', { configurable: true, get: () => window.__hidden === true });
  Object.defineProperty(Document.prototype, 'visibilityState', { configurable: true, get: () => (window.__hidden ? 'hidden' : 'visible') });
});
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[0].click();
await page.waitForSelector(at('hub'));
await wait(600);

const cardTimes = () => page.$$eval('[data-shot="lesson-tile"]', ts => ts.map(t => t.textContent.match(/(about|took) \d+ min/)?.[0] ?? null));
const tileTimes = () => page.$$eval('[data-shot="game-tile"]', ts => ts.map(t => t.textContent.match(/about \d+ min/)?.[0] ?? null));
const today = () => page.$eval('[data-shot="hub-today"]', e => Number(e.textContent.match(/(\d+)\s*min reading/)?.[1] ?? NaN)).catch(() => NaN);

let cards = await cardTimes();
ok('every lesson card shows "about N min"', cards.length > 0 && cards.every(c => /^about \d+ min$/.test(c ?? '')), cards.join(' · '));
const tiles = await tileTimes();
ok('every game tile shows "about N min"', tiles.length > 0 && tiles.every(Boolean), tiles.join(' · '));
const today0 = await today();
ok('Today shows the minutes read', today0 === 0, `${today0} min`);

// ---- Lesson 1: 2 minutes on screen, 1 hidden ----
await (await page.$$(at('lesson-tile')))[0].click();
await page.waitForSelector(at('play'));
await page.click(at('play'));
await page.waitForSelector(at('lesson-choice'));
const t0 = Date.now();
await page.evaluate(() => { window.__skip += 120000; });
await page.evaluate(() => { window.__hidden = true; document.dispatchEvent(new Event('visibilitychange')); });
await page.evaluate(() => { window.__skip += 60000; });
await page.evaluate(() => { window.__hidden = false; document.dispatchEvent(new Event('visibilitychange')); });

const round = () => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null);
for (let r = 0; r < 12 && !(await page.$(at('shell-reward'))); r++) {
  await page.waitForSelector(at('lesson-choice'));
  await wait(800);
  const now = await round();
  const right = await page.evaluate(() => {
    const el = document.querySelector('[data-shot="lesson-choice"]');
    const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
    for (let f = el[key]; f; f = f.return) {
      const list = f.memoizedProps?.question?.options;
      if (Array.isArray(list)) {
        const o = list.find(x => x.isCorrect ?? x.isRhyme);
        return o.letter ? `letter ${o.letter}` : o.text ?? o.word;
      }
    }
    return null;
  });
  await page.evaluate(l => [...document.querySelectorAll('[data-shot="lesson-choice"]')].find(e => (e.getAttribute('aria-label') ?? e.textContent).trim() === l)?.click(), right);
  for (let t = 0; t < 80 && !(await page.$(at('shell-reward'))) && (await round()) === now; t++) await wait(200);
}
await page.waitForSelector(at('done-time'), { timeout: 20000 });
const realSeconds = (Date.now() - t0) / 1000;
const took = await page.$eval(at('done-time'), e => Number(e.textContent.match(/You took (\d+) minute/)?.[1] ?? NaN));
const onScreen = Math.max(1, Math.round((120 + realSeconds) / 60));
const withHidden = Math.max(1, Math.round((180 + realSeconds) / 60));
ok('the done screen counts only the time on screen', took === onScreen && took !== withHidden, `took ${took} min; on screen ${onScreen}, with the hidden minute ${withHidden}`);
const estimate = await page.$eval(at('done-time'), e => e.textContent.match(/about \d+ min/)?.[0] ?? null);
ok('… beside the lesson\'s "about N min"', Boolean(estimate), estimate ?? 'none');

await wait(3500);
await page.click(at('shell-back'));
await page.waitForSelector(at('hub'));
await wait(600);
const today1 = await today();
ok('Today goes up by the same minutes', today1 - today0 === took, `${today0} → ${today1}`);
cards = await cardTimes();
ok('Lesson 1\'s card says it took them', cards[0] === `took ${took} min`, cards[0]);

// ---- a reload ----
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await wait(600);
ok('after a reload Today and the card still say so', (await today()) === today1 && (await cardTimes())[0] === `took ${took} min`);

// ---- a save from before PRG-6 ----
await page.evaluate(key => {
  const saved = JSON.parse(localStorage.getItem(key));
  delete saved.times;
  delete saved.today;
  localStorage.setItem(key, JSON.stringify(saved));
}, KEY);
errors.length = 0;
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await wait(600);
cards = await cardTimes();
ok('an older save loads with no error, estimates showing', errors.length === 0 && cards.slice(1).every(c => /^about \d+ min$/.test(c ?? '')), errors.join(' | ') || cards.join(' · '));

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
