#!/usr/bin/env node
// Stars that follow how it went (PRG-1).
//
//   node .claude/skills/know-how/stars-check.mjs [port=5199]
//
// Needs Vite running on the port. Reads the rule from `engine/stars.ts`, then,
// from a fresh save at Kindergarten, plays for real, reading the right answer
// from React each round (a lesson's options, Letter Cookies' round):
//   - Lesson 1 with every round right first time: 3 stars;
//   - Lesson 1 again, one round missed once: 2 stars, and the total stays put
//     (the best was 3);
//   - Lesson 1 again, a miss in every round: 1 star, the total still put;
//   - Letter Cookies with a miss in every round: 1 star, the total up by 1;
//   - Letter Cookies again with none: 3 stars, the total up by 2 more.
// The done screen's stars ("N of 3 stars"), the line under them ("3 of 4
// first try") and the saved total are read each time. It fails on the commit before PRG-1, where a lesson paid its fixed 3
// (5 for the story) and a game one star a round won, however it went, every
// time it was played.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });

const shown = sel => page.evaluate(s => Boolean(document.querySelector(s)), sel);
const total = () => page.evaluate(() => JSON.parse(localStorage.getItem('ms_luna_learning_progress_v1') ?? '{}').totalStars ?? 0);
// the stars, and the line under them ("3 of 4 first try")
const starsShown = () => page.evaluate(() => {
  const stars = document.querySelector('[aria-label$="of 3 stars"]')?.getAttribute('aria-label') ?? 'none';
  const line = document.querySelector('[data-shot="shell-reward"]')?.textContent.match(/\d+ of \d+ first try/)?.[0] ?? 'no first-try line';
  return `${stars}, ${line}`;
});
const round = () => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null);

// the rule itself, as the app has it
const rule = await page.evaluate(async () => {
  const { starsFor } = await import('/src/apps/reading/engine/stars.ts');
  return [[4, 4], [3, 4], [2, 4], [1, 4], [0, 4], [5, 5], [2, 5]].map(([c, r]) => `${c}/${r}→${starsFor(c, r)}`);
}).catch(() => null);
ok('the rule: all clean 3, at least half 2, else 1', rule?.join(' ') === '4/4→3 3/4→2 2/4→2 1/4→1 0/4→1 5/5→3 2/5→1', rule?.join(' ') ?? 'no engine/stars.ts');

await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[0].click();
await page.waitForSelector(at('hub'));
await wait(600);

/** the label of each choice that is right this round, and of each that isn't */
const lessonChoices = () => page.evaluate(() => {
  const el = document.querySelector('[data-shot="lesson-choice"]');
  if (!el) return null;
  const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
  for (let f = el[key]; f; f = f.return) {
    const list = f.memoizedProps?.question?.options;
    if (Array.isArray(list) && list.some(o => 'isCorrect' in o)) {
      const label = o => (o.letter ? `letter ${o.letter}` : o.text ?? o.word);
      return { right: list.filter(o => o.isCorrect).map(label), wrong: list.filter(o => !o.isCorrect).map(label) };
    }
  }
  return null;
});
const tapChoice = label => page.evaluate(l => {
  const el = [...document.querySelectorAll('[data-shot="lesson-choice"]')].find(e => (e.getAttribute('aria-label') ?? e.textContent).trim() === l);
  el?.click();
  return Boolean(el);
}, label);

/** waits until the round moves on or the done screen shows */
async function next(now) {
  for (let t = 0; t < 80; t++) {
    if (await shown(at('shell-reward'))) return;
    if ((await round()) !== now) return;
    await wait(200);
  }
}

/** plays one round: `misses` wrong taps first, then the right one */
async function playLessonRound(misses) {
  await page.waitForSelector(at('lesson-choice'));
  await wait(800);
  const now = await round();
  const c = await lessonChoices();
  for (let m = 0; m < misses; m++) { await tapChoice(c.wrong[m % c.wrong.length]); await wait(2600); }
  await tapChoice(c.right[0]);
  await next(now);
}

async function openTile(kind, text) {
  for (const t of await page.$$(at(kind))) {
    if ((await t.evaluate(e => e.textContent)).includes(text)) { await t.click(); break; }
  }
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('shell-play'));
}

async function backToLibrary() {
  await page.waitForSelector(at('shell-reward'), { timeout: 20000 });
  await wait(1200);
  const stars = await starsShown();
  // past the moon's visit, if she came
  await wait(2500);
  await page.click(at('shell-back'));
  await page.waitForSelector(at('hub'));
  await wait(600);
  return stars;
}

async function lessonPlay(missesByRound) {
  await openTile('lesson-tile', 'First Letter Sounds');
  for (let r = 0; r < 12 && !(await shown(at('shell-reward'))); r++) await playLessonRound(missesByRound(r));
  return backToLibrary();
}

async function cookiesPlay(misses) {
  await openTile('game-tile', 'Letter Cookies');
  for (let r = 0; r < 12 && !(await shown(at('shell-reward'))); r++) {
    await page.waitForSelector(at('cookie'));
    await wait(1200);
    const now = await round();
    const answer = await page.evaluate(() => {
      const el = document.querySelector('[data-shot="cookie"]');
      const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
      for (let f = el[key]; f; f = f.return) if (f.memoizedProps?.round?.answer) return f.memoizedProps.round.answer;
      return null;
    });
    if (misses) {
      await page.evaluate(a => [...document.querySelectorAll('[data-shot="cookie"]')].find(e => e.getAttribute('aria-label') !== `letter ${a}`)?.click(), answer);
      await wait(2600);
    }
    await page.evaluate(a => document.querySelector(`[data-shot="cookie"][aria-label="letter ${a}"]`)?.click(), answer);
    await next(now);
  }
  return backToLibrary();
}

const t0 = await total();
const clean = await lessonPlay(() => 0);
const t1 = await total();
ok('Lesson 1, every round right first time: 3 stars', clean === '3 of 3 stars, 4 of 4 first try' && t1 - t0 === 3, `${clean}; total ${t0} → ${t1}`);

const oneMiss = await lessonPlay(r => (r === 0 ? 1 : 0));
const t2 = await total();
ok('Lesson 1 again, one round missed: 2 stars, and no more in the total', oneMiss === '2 of 3 stars, 3 of 4 first try' && t2 === t1, `${oneMiss}; total ${t1} → ${t2}`);

const allMissed = await lessonPlay(() => 1);
const t3 = await total();
ok('Lesson 1 again, a miss every round: 1 star, the total still put', allMissed === '1 of 3 stars, 0 of 4 first try' && t3 === t1, `${allMissed}; total ${t2} → ${t3}`);

const gameMissy = await cookiesPlay(true);
const t4 = await total();
ok('Letter Cookies, a miss every round: 1 star, the total up by 1', gameMissy.startsWith('1 of 3 stars, 0 of ') && t4 - t3 === 1, `${gameMissy}; total ${t3} → ${t4}`);

const gameClean = await cookiesPlay(false);
const t5 = await total();
ok('Letter Cookies again, no misses: 3 stars, the total up by 2 more', /^3 of 3 stars, (\d+) of \1 first try$/.test(gameClean) && t5 - t4 === 2, `${gameClean}; total ${t4} → ${t5}`);

// a save from before PRG-1: no best stars, its stars paid per round
await page.evaluate(async () => {
  const key = 'ms_luna_learning_progress_v1';
  const saved = JSON.parse(localStorage.getItem(key));
  delete saved.bestStars;
  saved.totalStars = 23;
  localStorage.setItem(key, JSON.stringify(saved));
});
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await wait(600);
const old0 = await total();
const oldReplay = await lessonPlay(() => 0);
const old1 = await total();
ok('an older save keeps its stars, and replaying a finished lesson adds none', old0 === 23 && old1 === 23, `${oldReplay}; total ${old0} → ${old1}`);

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
