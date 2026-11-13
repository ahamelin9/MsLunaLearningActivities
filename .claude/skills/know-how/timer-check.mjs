#!/usr/bin/env node
// Does the round's countdown work? (CUR-16)
//
//   node .claude/skills/know-how/timer-check.mjs [port=5199]
//
// Needs Vite on the port. The page's Date.now can be moved on (window.__skip)
// and its tab hidden (window.__hidden), as in time-check.mjs, so 15 seconds
// pass in a moment. From a fresh save each time it checks:
//   - 1st grade, Letter Cookies: the pie shows the round's 15 seconds, holds
//     while Luna talks, counts down while she's quiet, and not while the tab
//     is hidden; running out takes it away, Luna says time's up, and it was
//     the round's first miss: the next wrong answer gets the spoken clue;
//   - a wrong answer before then takes the pie away too;
//   - 2nd grade has less time than 1st for every kind (10 here), and
//     Kindergarten none; no pie in Bubble Sounds, Muddled Cards or Story
//     Corner;
//   - What's Missing shows no pie while the desk is looked at, and its full
//     15 once it asks;
//   - a lesson: running out notes the question missed, to come back next
//     play, and the play's last round, run out then answered, isn't counted
//     right the first time ("19 of 20 first try").
// It fails with the timer off (no pie at all).

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';
import { lessonCard } from './library.mjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const KEY = 'ms_luna_learning_progress_v1';
const results = [];
const ok = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? '✅' : '❌'} ${name}${detail !== '' ? `  (${detail})` : ''}`);
};

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const errors = [];

/** A fresh page at a grade (0 Kindergarten, 1, 2), in the library. */
async function library(grade) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 820 });
  page.on('pageerror', e => errors.push(e.message));
  await page.evaluateOnNewDocument(() => {
    window.speechSynthesis.speak = () => {};
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
  await (await page.$$(at('grade-card')))[grade].click();
  await page.waitForSelector(at('hub'));
  await wait(400);
  return page;
}

/** A fresh page at a grade, in a game, playing. */
async function game(grade, title) {
  const page = await library(grade);
  for (const t of await page.$$(at('game-tile'))) {
    if ((await t.evaluate(e => e.textContent)).includes(title)) {
      await t.click();
      break;
    }
  }
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  return page;
}

const pie = page => page.$eval(at('countdown-pie'), e => Number(e.getAttribute('aria-label').match(/\d+/)[0])).catch(() => null);
const talking = page => page.$('[data-mood][data-state="talking"]').then(Boolean);
const skip = (page, ms) => page.evaluate(n => (window.__skip += n), ms);
const hide = (page, hidden) =>
  page.evaluate(h => {
    window.__hidden = h;
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
async function until(fn, ms = 6000) {
  for (let t = 0; t < ms; t += 100) {
    if (await fn()) return true;
    await wait(100);
  }
  return false;
}
const quiet = page => until(async () => !(await talking(page)), 12000);
const choices = page => page.$$(`${at('stage')} button[data-kind]`);
// Letter Cookies' cookies: a keyboard's click feeds one (detail 0; a finger drags it)
const cookies = page => page.$$(`${at('cookie')}:not([disabled])`);
/** Feeds Luna a cookie; how the round took it: 'miss', 'win' or null. */
async function feed(page, cookie) {
  await cookie.evaluate(e => e.click());
  let flash = null;
  await until(async () => (flash = await page.$eval(at('stage'), e => e.getAttribute('data-flash')).catch(() => null)) !== null, 4000);
  return flash;
}
const bodyText = page => page.evaluate(() => document.body.innerText);
const clue = page => page.$$eval('button', bs => bs.some(b => /clue/i.test(b.textContent)));

// ---- 1st grade, Letter Cookies ----
{
  const page = await game(1, 'Letter Cookies');
  await until(async () => (await pie(page)) !== null);
  ok('1st grade: a pie in the header, full at 15 seconds', (await pie(page)) === 15, await pie(page));
  ok('… it sits in the header, beside Again', await page.$eval(at('countdown-pie'), e => Boolean(e.closest('header'))).catch(() => false));
  // real seconds here: a jump of the clock can also bring Luna's own nudge,
  // and while she says it the pie rightly waits
  const heard = await until(() => talking(page), 4000);
  // every reading while she says the round's question, a second or more of it
  const whileTalking = [];
  for (let t = 0; t < 12000 && (await talking(page)); t += 100) {
    whileTalking.push(await pie(page));
    await wait(100);
  }
  ok(
    '… it holds while Luna talks (the round’s question)',
    heard && whileTalking.length >= 8 && whileTalking.every(n => n === 15),
    `${whileTalking.length / 10} s talking, ${[...new Set(whileTalking)].join('/')}`
  );
  await quiet(page);
  await wait(300);
  const before = await pie(page);
  await wait(3000);
  const after = await pie(page);
  ok('… and counts down while she’s quiet', before !== null && after !== null && before - after >= 2 && before - after <= 4, `${before} → ${after} in 3 s`);
  await hide(page, true);
  await wait(3000);
  await hide(page, false);
  const hidden = await pie(page);
  ok('… not while the tab is hidden', hidden !== null && after - hidden <= 1, `${after} → ${hidden} in 3 s hidden`);
  await skip(page, 20000);
  await wait(800);
  ok('running out takes the pie away', (await pie(page)) === null, await pie(page));
  const said = await bodyText(page);
  ok('… and Luna says time’s up', /Time’s up|time ran out/.test(said), said.match(/(Time’s up|time ran out)[^\n]*/)?.[0] ?? 'no line');
  ok('… with no clue yet', !(await clue(page)));
  await quiet(page);
  // a wrong answer now is the round's second miss: the clue is spoken, and its button shows
  // the first cookie; a right one wins the round, and there is nothing more to learn here
  const [cookie] = await cookies(page);
  const wrong = (await feed(page, cookie)) === 'miss';
  await until(() => clue(page), 4000);
  ok('running out was the first miss: the next wrong answer gets the clue', wrong && (await clue(page)), `wrong answer ${wrong}`);
  await page.close();
}

// ---- a miss takes the pie away ----
{
  const page = await game(1, 'Letter Cookies');
  let gone = null;
  for (let round = 0; round < 4 && gone === null; round++) {
    await until(async () => (await pie(page)) !== null);
    await quiet(page);
    const [first] = await cookies(page);
    if ((await feed(page, first)) === 'miss') {
      await wait(200);
      gone = (await pie(page)) === null;
    } else {
      // right: the next round brings a fresh pie
      await until(async () => (await pie(page)) === 15, 8000);
    }
  }
  ok('a wrong answer takes the pie away (the round is off its first try)', gone === true, gone);
  await page.close();
}

// ---- the grades, and the games with none ----
{
  const page = await game(2, 'Letter Cookies');
  await until(async () => (await pie(page)) !== null);
  ok('2nd grade: Letter Cookies has 10 seconds', (await pie(page)) === 10, await pie(page));
  const table = await page.evaluate(async () => {
    const { ANSWER_SECONDS } = await import('/src/apps/reading/engine/timer.ts');
    return ANSWER_SECONDS;
  });
  const kinds = Object.keys(table.grade1 ?? {});
  ok(
    '… less than 1st grade for every kind, and Kindergarten has none',
    kinds.length === 4 && kinds.every(k => table.grade2[k] < table.grade1[k]) && !table.kindergarten,
    kinds.map(k => `${k} ${table.grade1[k]}/${table.grade2[k]}`).join(', ')
  );
  await page.close();
}
{
  const page = await game(0, 'Letter Cookies');
  await wait(3000);
  ok('Kindergarten: no pie', (await pie(page)) === null);
  await page.close();
}
for (const title of ['Bubble Sounds', 'Muddled Cards', 'Story Corner']) {
  const page = await game(1, title);
  await wait(3000);
  ok(`1st grade, ${title}: no pie`, (await pie(page)) === null);
  await page.close();
}

// ---- What's Missing waits until it asks ----
{
  const page = await game(1, 'What');
  await wait(1200);
  ok('What’s Missing: no pie while the desk is looked at', (await bodyText(page)).includes('Memorize') && (await pie(page)) === null);
  await until(async () => (await pie(page)) !== null, 12000);
  ok('… and its full 15 seconds once it asks', (await pie(page)) === 15, await pie(page));
  await page.close();
}

// ---- a lesson: running out brings the question back, and isn't first try ----
{
  const page = await library(1);
  const lesson = await page.evaluate(async key => {
    const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
    const first = lessonsFor('grade1')[0];
    // the last round to play: 19 won, all right the first time (PRG-8's part-way)
    const saved = JSON.parse(localStorage.getItem(key));
    saved.partway = { [first.lesson.id]: { won: 19, clean: 19, seconds: 0, counted: 0 } };
    localStorage.setItem(key, JSON.stringify(saved));
    return first.lesson.id;
  }, KEY);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  await (await lessonCard(page, 0)).click();
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await until(async () => (await pie(page)) !== null);
  await quiet(page);
  await wait(300);
  await skip(page, 60000);
  await wait(800);
  const missed = await page.evaluate(id => JSON.parse(localStorage.getItem('ms_luna_seen_v1') ?? '{}')[`missed:${id}`] ?? [], lesson);
  ok('a lesson: running out notes the question missed, to come back next play', missed.length === 1, JSON.stringify(missed));
  await quiet(page);
  // each choice in turn (a wrong one wobbles and clears), until it's won
  for (let i = 0; i < 8 && !(await page.$(at('shell-reward'))); i++) {
    await page.$$eval(`${at('stage')} button[data-kind]`, (bs, n) => bs[n % Math.max(1, bs.length)]?.click(), i);
    await wait(300);
    await quiet(page);
    await wait(300);
  }
  await page.waitForSelector(at('shell-reward'), { timeout: 15000 }).catch(() => {});
  const done = await bodyText(page);
  ok('… and the round isn’t right the first time: 19 of 20', /19 of 20 first try/.test(done), done.match(/\d+ of \d+ first try/)?.[0] ?? 'no done screen');
  await page.close();
}

ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
