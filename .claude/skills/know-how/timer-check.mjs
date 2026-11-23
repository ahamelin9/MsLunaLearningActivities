#!/usr/bin/env node
// Does the round's countdown work? (CUR-16)
//
//   node .claude/skills/know-how/timer-check.mjs [port=5199]
//
// Needs Vite on the port. The page's Date.now can be moved on (window.__skip)
// and its tab hidden (window.__hidden), as in time-check.mjs, so 30 seconds
// pass in a moment. From a fresh save each time it checks:
//   - 1st grade, Letter Cookies: the pie shows the round's 30 seconds and
//     starts with the round, counting down while Luna says its question too
//     (CUR-18), counts down while she's quiet, and not while the tab is
//     hidden; running out takes it away, Luna says time's up, and it was the
//     round's first miss: the next wrong answer gets the spoken clue;
//   - a wrong answer before then takes the pie away too;
//   - every game round has 30 seconds at 1st and 2nd grade, a Treasure Path
//     passage 45 in 1st grade (CUR-24), and Kindergarten none;
//   - Bubble Sounds, Muddled Cards and Story Corner have it too (CUR-29):
//     Muddled Cards times each pair and Story Corner its word hunt and then
//     its question, a fresh 30 with each step, even after running out; Story
//     Corner's story itself is read untimed;
//   - What's Missing shows no pie while the desk is looked at, and its full
//     30 once it asks, counting down while Luna asks (CUR-18);
//   - no lesson at 1st or 2nd grade shows a pie (the teacher: "timer only
//     on games, not lessons"; CUR-24).
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
/** How full the pie is, 1 to 0 (its `--share`), to the tenth of a second. */
const share = page => page.$eval(at('countdown-pie'), e => Number(e.style.getPropertyValue('--share'))).catch(() => null);
/**
 * Reads the pie while Luna talks, from the moment she starts: how long she
 * talked and how many seconds the pie lost meanwhile (CUR-18: the pie doesn't
 * wait for her).
 */
async function whileTalking(page, total) {
  const heard = await until(() => talking(page), 4000);
  const first = { at: Date.now(), share: await share(page) };
  let last = first;
  while (heard && (await talking(page)) && Date.now() - first.at < 12000) {
    await wait(100);
    last = { at: Date.now(), share: await share(page) };
  }
  const talked = (last.at - first.at) / 1000;
  const lost = first.share !== null && last.share !== null ? (first.share - last.share) * total : 0;
  return { heard, talked, lost, text: `${talked.toFixed(1)} s talking, the pie lost ${lost.toFixed(1)} s` };
}
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
  ok('1st grade: a pie in the header, full at 30 seconds', (await pie(page)) === 30, await pie(page));
  ok('… it sits in the header, beside Again', await page.$eval(at('countdown-pie'), e => Boolean(e.closest('header'))).catch(() => false));
  // real seconds here, so the pie's loss can be held to Luna's talking time
  const asked = await whileTalking(page, 30);
  ok(
    '… it starts with the round: it counts down while Luna says the round’s question (CUR-18)',
    asked.heard && asked.talked >= 0.6 && asked.lost >= asked.talked * 0.7 && asked.lost <= asked.talked + 0.5,
    asked.text
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
  await skip(page, 35000);
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
      await until(async () => (await pie(page)) === 30, 8000);
    }
  }
  ok('a wrong answer takes the pie away (the round is off its first try)', gone === true, gone);
  await page.close();
}

// ---- the grades, and the games with none ----
{
  const page = await game(2, 'Letter Cookies');
  await until(async () => (await pie(page)) !== null);
  ok('2nd grade: Letter Cookies has 30 seconds', (await pie(page)) === 30, await pie(page));
  const table = await page.evaluate(async () => {
    const { ANSWER_SECONDS } = await import('/src/apps/reading/engine/timer.ts');
    return ANSWER_SECONDS;
  });
  const kinds = Object.keys(table.grade1 ?? {});
  const want = (g, k) => (g === 'grade1' && k === 'passage' ? 45 : 30);
  ok(
    '… every kind 30 seconds at both grades, a 1st-grade passage 45, and Kindergarten none (CUR-24)',
    kinds.length === 4 && ['grade1', 'grade2'].every(g => kinds.every(k => table[g][k] === want(g, k))) && !table.kindergarten,
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
  const page = await game(0, title);
  await wait(3000);
  ok(`Kindergarten, ${title}: no pie`, (await pie(page)) === null);
  await page.close();
}

// ---- the three games CUR-16 left untimed (CUR-29) ----
/** The card's React key (`<pair>-<side>`), from its fiber. */
const reactKey = el =>
  el.evaluate(e => {
    const k = Object.keys(e).find(n => n.startsWith('__reactFiber$'));
    return e[k]?.key ?? null;
  });
/** Story Corner's hunt word, from the round prop of the nearest component above. */
const huntWord = el =>
  el.evaluate(e => {
    const k = Object.keys(e).find(n => n.startsWith('__reactFiber$'));
    for (let f = e[k]; f; f = f.return) {
      const h = f.memoizedProps?.round?.hunt;
      if (h) return h;
    }
    return null;
  });
const lessThanFull = async page => {
  await skip(page, 10000);
  await wait(400);
  return pie(page);
};
{
  const page = await game(1, 'Bubble Sounds');
  await until(async () => (await pie(page)) !== null);
  ok('1st grade, Bubble Sounds: a pie at 30 (CUR-29)', (await pie(page)) === 30, await pie(page));
  await page.close();
}
{
  const page = await game(1, 'Muddled Cards');
  await until(async () => (await pie(page)) !== null);
  ok('1st grade, Muddled Cards: a pie at 30 (CUR-29)', (await pie(page)) === 30, await pie(page));
  /** Turns over a pair not yet found. */
  const match = async () => {
    const cards = await page.$$(`${at('stage')} button[aria-label="face down card"]`);
    const keyed = [];
    for (const c of cards) keyed.push([await reactKey(c), c]);
    const pairOf = k => k.slice(0, k.lastIndexOf('-'));
    const [firstKey, a] = keyed[0];
    const b = keyed.find(([k], i) => i > 0 && pairOf(k) === pairOf(firstKey))[1];
    await quiet(page);
    await a.click();
    await wait(300);
    await b.click();
  };
  const down = await lessThanFull(page);
  await match();
  const fresh = await until(async () => (await pie(page)) >= 29, 4000);
  ok('… a pair found brings a fresh 30', down !== null && down <= 21 && fresh, `${down} → ${await pie(page)}`);
  await skip(page, 35000);
  await wait(800);
  const gone = (await pie(page)) === null;
  await quiet(page);
  await match();
  const back = await until(async () => (await pie(page)) >= 29, 4000);
  ok('… running out takes it away until the next pair, which brings a fresh 30', gone && back, `gone ${gone}, back ${await pie(page)}`);
  await page.close();
}
{
  const page = await game(1, 'Story Corner');
  await wait(2500);
  ok('1st grade, Story Corner: no pie while the story is read', (await pie(page)) === null, await pie(page));
  for (let i = 0; i < 20 && !(await page.$(`${at('stage')} [data-state="huntable"]`)); i++) {
    const next = await page.$$eval(`${at('stage')} button`, bs => bs.findIndex(b => /Next line|I have read it/.test(b.textContent)));
    if (next < 0) break;
    await (await page.$$(`${at('stage')} button`))[next].click();
    await wait(250);
  }
  await until(async () => (await pie(page)) !== null, 4000);
  ok('… a pie at 30 once the word hunt starts (CUR-29)', (await pie(page)) === 30, await pie(page));
  const words = await page.$$(`${at('stage')} [data-state="huntable"] span`);
  const hunt = words.length ? await huntWord(words[0]) : null;
  const clean = async w => (await w.evaluate(e => e.textContent)).replace(/[^a-zA-Z]/g, '').toLowerCase();
  let right = null;
  let wrong = null;
  for (const w of words) {
    if ((await clean(w)) === hunt) right ??= w;
    else wrong ??= w;
  }
  let detail = `hunt "${hunt}"`;
  let pass = false;
  if (right && wrong) {
    const down = await lessThanFull(page);
    await quiet(page);
    await wrong.click();
    // the word tapped is said first, then the miss counts (FB-1)
    const gone = await until(async () => (await pie(page)) === null, 4000);
    await quiet(page);
    await right.click();
    const fresh = await until(async () => (await pie(page)) >= 29, 4000);
    pass = down !== null && down <= 21 && gone && fresh;
    detail += `: ${down} → ${gone ? 'gone' : 'still there'} → ${await pie(page)}`;
  }
  ok('… a wrong word takes it away, and the word found brings a fresh 30 for the question', pass, detail);
  await page.close();
}

// ---- What's Missing waits until it asks ----
{
  const page = await game(1, 'What');
  await wait(1200);
  ok('What’s Missing: no pie while the desk is looked at', (await bodyText(page)).includes('Memorize') && (await pie(page)) === null);
  await until(async () => (await pie(page)) !== null, 12000);
  ok('… and its full 30 seconds once it asks', (await pie(page)) === 30, await pie(page));
  const asked = await whileTalking(page, 30);
  ok(
    '… counting down while Luna asks what is missing (CUR-18)',
    asked.heard && asked.talked >= 0.6 && asked.lost >= asked.talked * 0.7 && asked.lost <= asked.talked + 0.5,
    asked.text
  );
  await page.close();
}

// ---- no lesson has a countdown (CUR-24) ----
for (const grade of [1, 2]) {
  const page = await library(grade);
  const g = grade === 1 ? 'grade1' : 'grade2';
  // every lesson open, so each card can be played
  await page.evaluate(async (key, g) => {
    const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
    const saved = JSON.parse(localStorage.getItem(key));
    saved.completedLessons = lessonsFor(g).map(l => l.lesson.id);
    localStorage.setItem(key, JSON.stringify(saved));
  }, KEY, g);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  const count = await page.evaluate(async g => (await import('/src/apps/reading/engine/lessons.ts')).lessonsFor(g).length, g);
  const timed = [];
  for (let i = 0; i < count; i++) {
    const card = await lessonCard(page, i);
    await card.evaluate(e => e.scrollIntoView({ block: 'center' }));
    await card.click();
    await page.waitForSelector(at('play'));
    await page.click(at('play'));
    await page.waitForSelector(at('stage'));
    await wait(1200);
    if ((await pie(page)) !== null) timed.push(i + 1);
    await page.click(at('shell-back'));
    await page.waitForSelector(at('hub'));
    await wait(150);
  }
  ok(`${grade === 1 ? '1st' : '2nd'} grade: none of its ${count} lessons shows a pie`, count > 0 && timed.length === 0, timed.length ? `timed: lessons ${timed.join(', ')}` : '');
  await page.close();
}

ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
