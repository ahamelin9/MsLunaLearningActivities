#!/usr/bin/env node
// Pick up a lesson where you left off (PRG-8).
//
//   node .claude/skills/know-how/partway-check.mjs [port=5199]
//   SHOT=<file.png> THEME=dark node …   # also saves the library with the bar
//
// Needs Vite running on the port. From a fresh save at Kindergarten, playing
// Lesson 1 for real (each round right first time, the answer read from React):
//   - leave it after winning 2 rounds: its card shows the thin rounds bar at
//     2 of N, and opening it again starts on round 3;
//   - the same after a reload;
//   - finishing it: the bar is gone and the lesson is done, with 3 stars
//     (the 2 rounds won before count as first time);
//   - "Play again" on it, and replaying the done lesson from the library,
//     start on round 1; a game always starts on round 1;
//   - a save from before PRG-8 (no part-way field) loads with no error.
// It fails on the commit before PRG-8, where leaving restarted the lesson.

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
if (process.env.THEME) await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: process.env.THEME }]);
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[0].click();
await page.waitForSelector(at('hub'));
await wait(600);

const pips = () => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null);
const bar = () => page.evaluate(() => document.querySelector('[data-shot="lesson-tile"] [role="progressbar"]')?.getAttribute('aria-valuenow') ?? null);
const intoLibrary = async () => {
  await page.click(at('shell-back'));
  await page.waitForSelector(at('hub'));
  await wait(600);
};
const open = async (kind, title) => {
  for (const t of await page.$$(at(kind))) {
    if ((await t.evaluate(e => e.textContent)).includes(title)) { await t.click(); break; }
  }
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('shell-play'));
  await wait(1200);
};
/** answers the round right first time and waits for the next one, or the done screen */
async function winRound() {
  await page.waitForSelector(at('lesson-choice'));
  await wait(600);
  const now = await pips();
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
  for (let t = 0; t < 80 && !(await page.$(at('shell-reward'))) && (await pips()) === now; t++) await wait(200);
}

// ---- 2 rounds, then leave ----
await open('lesson-tile', 'First Letter Sounds');
const first = await pips();
await winRound();
await winRound();
const third = await pips();
await intoLibrary();
ok('leaving after 2 rounds: the card shows the rounds bar at 2', (await bar()) === '2', `bar ${await bar()}`);
if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
await open('lesson-tile', 'First Letter Sounds');
ok('opening it again starts on round 3', (await pips()) === third, `${await pips()} (it began on "${first}")`);
await intoLibrary();

// ---- a reload ----
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await wait(600);
ok('after a reload the bar is still at 2', (await bar()) === '2', `bar ${await bar()}`);
await open('lesson-tile', 'First Letter Sounds');
ok('… and it still starts on round 3', (await pips()) === third, await pips());

// ---- finish it ----
for (let r = 0; r < 6 && !(await page.$(at('shell-reward'))); r++) await winRound();
await page.waitForSelector(at('shell-reward'), { timeout: 20000 });
await wait(1200);
const stars = await page.evaluate(() => document.querySelector('[aria-label$="of 3 stars"]')?.getAttribute('aria-label'));
ok('finishing it: 3 stars, the rounds before counted as first time', stars === '3 of 3 stars', stars);
let playAgain = null;
for (const b of await page.$$('button')) if ((await b.evaluate(e => e.textContent.trim())) === 'Play again') playAgain = b;
await playAgain.click();
await page.waitForSelector(at('lesson-choice'));
await wait(600);
ok('"Play again" starts on round 1', (await pips()) === first, await pips());
await intoLibrary();
const done = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), KEY);
ok('the lesson is done, and nothing is part-way', done.completedLessons.length === 1 && Object.keys(done.partway ?? {}).length === 0 && (await bar()) === null, JSON.stringify(done.partway));

// ---- the done lesson again, and a game ----
await open('lesson-tile', 'First Letter Sounds');
ok('replaying the done lesson starts on round 1', (await pips()) === first, await pips());
await intoLibrary();
await open('game-tile', 'Letter Jar');
const gameRound = await pips();
ok('a game starts on round 1', /^Round 1 /.test(gameRound ?? ''), gameRound);
await intoLibrary();

// ---- a save from before PRG-8 ----
await page.evaluate(key => {
  const saved = JSON.parse(localStorage.getItem(key));
  delete saved.partway;
  localStorage.setItem(key, JSON.stringify(saved));
}, KEY);
errors.length = 0;
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await wait(600);
ok('an older save loads with no error', errors.length === 0, errors.join(' | '));

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
