#!/usr/bin/env node
// Does Story Corner's bar count both of a story's answers? (CUR-21)
//
//   node .claude/skills/know-how/story-bar-check.mjs [port=5199]
//
// Needs Vite on the port. At each grade the bar opens on "Round 1 of 20" (10
// stories, two answers each). Then, at Kindergarten, it plays two stories as
// a child would (turns every page, taps the hunted word, taps the right
// answer, read from the round in React) and reads the bar after each answer:
// 2, 3, 4, 5. On the code before CUR-21 it says "of 9" and the word found
// doesn't move it.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.slice(2).find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? '✅' : '❌'} ${name}${detail !== '' ? `  (${detail})` : ''}`);
};

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820, hasTouch: true });
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });

const barText = () => page.$eval(at('round-pips'), e => e.getAttribute('aria-label')).catch(() => null);
async function open(grade) {
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('grade-card'));
  await (await page.$$(at('grade-card')))[grade].click();
  await page.waitForSelector(at('hub'));
  for (const t of await page.$$(at('game-tile'))) if ((await t.evaluate(e => e.textContent)).includes('Story Corner')) await t.click();
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await wait(800);
}
for (const grade of [0, 1, 2]) {
  await open(grade);
  ok(`${['Kindergarten', '1st grade', '2nd grade'][grade]}: the bar opens on Round 1 of 20`, (await barText()) === 'Round 1 of 20', await barText());
}

/** the round in play, from React: the word to hunt and the right answer */
const roundNow = () =>
  page.evaluate(() => {
    for (const el of document.querySelectorAll('[data-shot="stage"] *')) {
      const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
      for (let f = key ? el[key] : null; f; f = f.return) {
        const r = f.memoizedProps?.round;
        if (r?.hunt && r.story) return { id: r.story.id, hunt: r.hunt, right: r.story.answers.find(a => a.correct).text };
      }
    }
    return null;
  });
const clickText = (match, exact) =>
  page.$$eval(
    `${at('stage')} button`,
    (bs, m, x) => {
      const b = bs.find(b => (x ? b.textContent.trim() === m : b.textContent.replace(/[^a-zA-Z]/g, '').toLowerCase() === m) && !b.disabled);
      b?.click();
      return Boolean(b);
    },
    match,
    exact
  );
// the story's words are spans, each tapped on its own
const tapWord = word =>
  page.$$eval(
    `${at('stage')} p span`,
    (ss, w) => {
      const s = ss.find(s => s.children.length === 0 && s.textContent.replace(/[^a-zA-Z]/g, '').toLowerCase() === w);
      s?.click();
      return Boolean(s);
    },
    word
  );
const until = async (fn, ms = 12000) => {
  for (let t = 0; t < ms; t += 150) {
    if (await fn()) return true;
    await wait(150);
  }
  return false;
};

await open(0);
const seen = [];
let last = null;
for (let story = 0; story < 2; story++) {
  await until(async () => {
    const r = await roundNow();
    return r && r.id !== last;
  });
  const round = await roundNow();
  last = round.id;
  // every page, then the hunt
  for (let i = 0; i < 8; i++) {
    if (!(await page.$$eval(`${at('stage')} button`, bs => bs.some(b => /next line|I have read it/i.test(b.textContent))))) break;
    await page.$$eval(`${at('stage')} button`, bs => bs.find(b => /next line|I have read it/i.test(b.textContent))?.click());
    await wait(500);
  }
  let before = await barText();
  await until(() => tapWord(round.hunt));
  await until(async () => (await barText()) !== before);
  seen.push(await barText());
  before = await barText();
  await until(() => clickText(round.right, true));
  await until(async () => (await barText()) !== before, 15000);
  seen.push(await barText());
}
ok(
  'Kindergarten, played: one step for the word found, one for the question',
  seen.join('|') === ['Round 2 of 20', 'Round 3 of 20', 'Round 4 of 20', 'Round 5 of 20'].join('|'),
  seen.map(s => s?.replace('Round ', '')).join(' → ')
);

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
