#!/usr/bin/env node
// The milestone moon (DES-17, the rule from BUG-25): does she visit when the
// rule says, and only then, and talk alone while she's there?
//
//   node .claude/skills/know-how/moon-check.mjs [port=5199] [--reduced-motion]
//
// Needs Vite running on the port. In a muted Chrome, at kindergarten, playing
// for real (each round answered right first time, or after one miss, the
// answer read from React), it checks:
//   - the first lesson ever brings her with a "first" line, even with a miss;
//   - replaying it with a miss: no moon;
//   - replaying it with every round right first time (3 stars): she comes,
//     with a "3 stars" line, and again the next time (every time);
//   - the last lesson brings her with an "all" line; replaying it with a
//     miss: no moon (each once);
//   - Letter Cookies with misses: no moon; its first 3 stars: a "3 stars in
//     a game" line; 3 stars again: no moon (once per game);
//   - while she's there, the done screen's Luna never moves her beak, and the
//     moon's mouth moves while her clip plays; she leaves by herself;
//   - with --reduced-motion, she appears and leaves without gliding;
//   - nothing falls back to the browser voice (her clips are rendered).
// It fails on the commit before BUG-25 (no visit for 3 stars or for a game).

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const reduced = process.argv.includes('--reduced-motion');
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const KEY = 'ms_luna_learning_progress_v1';
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({
  executablePath: chromePath(),
  headless: true,
  args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required']
});
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
if (reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.evaluateOnNewDocument(() => {
  window.__browserSpoke = [];
  window.speechSynthesis.speak = u => window.__browserSpoke.push(u.text);
  // what happened while the moon was on screen: Luna's beak, the moon's mouth,
  // how she arrived, sampled on every frame
  window.__visit = { seen: false, lunaTalked: false, moonTalked: false, glide: new Set() };
  const look = fromTimer => {
    const visit = document.querySelector('[data-shot="moon-visit"]');
    if (visit) {
      window.__visit.seen = true;
      window.__visit.glide.add(getComputedStyle(visit).animationName);
      if (document.querySelector('[data-shot="done-luna"] [data-state~="talking"]')) window.__visit.lunaTalked = true;
      if (visit.querySelector('[data-state~="talking"]')) window.__visit.moonTalked = true;
    }
    if (fromTimer !== true) requestAnimationFrame(look);
  };
  requestAnimationFrame(look);
  // frames can be skipped in a headless tab: a steady timer and a DOM
  // observer as well, so a short visit is never missed (BUG-25)
  setInterval(() => document.body && look.call(null, true), 40);
  new MutationObserver(() => { if (document.querySelector('[data-shot="moon-visit"]')) window.__visit.seen = true; })
    .observe(document, { childList: true, subtree: true });
});

const shown = sel => page.evaluate(s => !!document.querySelector(s), sel);
// what pronunciation.say was asked, by wrapping the module the page loaded
const hook = () =>
  page.evaluate(async () => {
    const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/pronunciation.ts')) ?? '/src/utils/pronunciation.ts';
    const { pronunciation } = await import(src);
    window.__said = window.__said ?? [];
    if (pronunciation.__wrapped) return;
    pronunciation.__wrapped = true;
    const say = pronunciation.say.bind(pronunciation);
    pronunciation.say = (req, text, opts) => {
      window.__said.push(text);
      return say(req, text, opts);
    };
  });
const moonLines = () => page.evaluate(async () => (await import('/src/apps/reading/engine/luna.ts')).MOON);
const lessonIds = () =>
  page.evaluate(async () => (await import('/src/apps/reading/engine/lessons.ts')).lessonsFor('kindergarten').map(l => l.lesson.id));
const setDone = ids =>
  page.evaluate((key, list) => {
    const saved = JSON.parse(localStorage.getItem(key));
    saved.completedLessons = list;
    localStorage.setItem(key, JSON.stringify(saved));
  }, KEY, ids);
const intoLibrary = async () => {
  await page.waitForSelector(at('open-reading'));
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  await hook();
  await wait(600);
};
const toHome = async () => {
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
};

/** taps each round's right answer, after one wrong one when `miss` (the answer read from React) */
async function playRounds(miss, pieces) {
  const round = () => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null);
  for (let guard = 0; guard < 12 && !(await shown(at('shell-reward'))); guard++) {
    await page.waitForSelector(pieces, { timeout: 15000 });
    await wait(1200);
    const now = await round();
    const c = await page.evaluate(sel => {
      const el = document.querySelector(sel);
      const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
      for (let f = el[key]; f; f = f.return) {
        const p = f.memoizedProps;
        // Letter Cookies: the round's answer
        if (p?.round?.answer) return { right: [`letter ${p.round.answer}`], wrong: p.round.options.filter(o => o !== p.round.answer).map(o => `letter ${o}`) };
        // a lesson: its options (Rhyme Matcher marks them isRhyme)
        const list = p?.question?.options;
        if (Array.isArray(list)) {
          const label = o => (o.letter ? `letter ${o.letter}` : o.text ?? o.word);
          const good = o => o.isCorrect ?? o.isRhyme;
          return { right: list.filter(good).map(label), wrong: list.filter(o => !good(o)).map(label) };
        }
      }
      return null;
    }, pieces);
    const tap = label => page.evaluate((sel, l) => {
      const el = [...document.querySelectorAll(sel)].find(e => (e.getAttribute('aria-label') ?? e.textContent).trim() === l);
      el?.click();
    }, pieces, label);
    if (miss) { await tap(c.wrong[0]); await wait(2600); }
    await tap(c.right[0]);
    for (let t = 0; t < 80 && !(await shown(at('shell-reward'))) && (await round()) === now; t++) await wait(200);
  }
  return shown(at('shell-reward'));
}

async function openTile(kind, n, title) {
  const tiles = await page.$$(at(kind));
  let tile = tiles[n];
  if (title) for (const t of tiles) if ((await t.evaluate(e => e.textContent)).includes(title)) tile = t;
  await tile.click();
  await page.waitForSelector(at('shell-intro'));
  await page.click(at('play'));
  await page.waitForSelector(at('shell-play'));
}

/** Plays lesson card i, or a game by title, and reports the done screen's visit, if any. */
async function visitAfter(i, miss, game) {
  await page.evaluate(() => {
    window.__said = [];
    window.__visit = { seen: false, lunaTalked: false, moonTalked: false, glide: new Set() };
  });
  if (game) await openTile('game-tile', 0, game);
  else await openTile('lesson-tile', i);
  const done = await playRounds(miss, game ? at('cookie') : at('lesson-choice'));
  // she arrives as the screen settles, talks, and leaves; give it all time
  let gone = false;
  for (let t = 0; t < 60; t++) {
    await wait(250);
    const v = await page.evaluate(() => window.__visit.seen);
    if (v && !(await shown(at('moon-visit')))) { gone = true; break; }
    if (!v && t > 24) break;
  }
  const v = await page.evaluate(() => ({ ...window.__visit, glide: [...window.__visit.glide], said: window.__said.slice() }));
  return { done, gone, ...v };
}

const backToLibrary = async () => {
  await page.click(at('shell-back'));
  await page.waitForSelector(at('hub'));
  await wait(600);
  await hook();
};

console.log(reduced ? '(reduced motion)' : '(full motion)');
await toHome();
await page.evaluate(() => localStorage.clear());
await toHome();
// a fresh save asks for the grade first: kindergarten
await page.waitForSelector(at('open-reading'));
await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[0].click();
await page.waitForSelector(at('hub'));
await hook();
await wait(800);

const MOON = await moonLines();
const ids = await lessonIds();
const among = (said, lines) => said.some(s => (lines ?? []).some(l => l.text === s));

// ---- the first lesson ever, with a miss ----
let v = await visitAfter(0, true);
ok('Lesson 1, the first ever (with a miss): the done screen shows', v.done);
ok('… the moon visits', v.seen);
ok('… saying a "first lesson" line', among(v.said, MOON.first), v.said.join(' | '));
ok('… Luna\'s beak stays still while the moon is there', v.seen && !v.lunaTalked);
ok('… the moon\'s mouth moves while her clip plays', v.moonTalked);
ok('… and she leaves by herself', v.gone);
ok(reduced ? '… appearing without gliding' : '… gliding in', reduced ? v.glide.every(n => n === 'none') : v.glide.some(n => n !== 'none'), v.glide.join(', '));

// ---- replaying it with a miss: an ordinary lesson ----
await backToLibrary();
v = await visitAfter(0, true);
ok('replaying Lesson 1 with a miss: no moon', v.done && !v.seen);

// ---- 3 stars: every time ----
await backToLibrary();
v = await visitAfter(0, false);
ok('replaying Lesson 1 with every round right first time: she comes with a "3 stars" line', v.seen && among(v.said, MOON.perfectLesson), v.said.join(' | '));
await backToLibrary();
v = await visitAfter(0, false);
ok('… and again the next time (3 stars brings her every time)', v.seen && among(v.said, MOON.perfectLesson), v.said.join(' | '));

// ---- all of them, then once ----
await toHome();
await setDone(ids.slice(0, ids.length - 1));
await toHome();
await intoLibrary();
v = await visitAfter(ids.length - 1, true);
ok(`Lesson ${ids.length}, the last (with a miss): the moon visits with an "all" line`, v.seen && among(v.said, MOON.all), v.said.join(' | '));
await backToLibrary();
v = await visitAfter(ids.length - 1, true);
ok('replaying the last lesson with a miss: no moon (she came once)', v.done && !v.seen);

// ---- a game: its first 3 stars, once ----
await backToLibrary();
v = await visitAfter(0, true, 'Letter Cookies');
ok('Letter Cookies with misses: no moon', v.done && !v.seen, v.said.filter(s => Object.values(MOON).flat().some(l => l.text === s)).join(' | '));
await backToLibrary();
v = await visitAfter(0, false, 'Letter Cookies');
ok('Letter Cookies, its first 3 stars: she comes with a "3 stars in a game" line', v.seen && among(v.said, MOON.perfectGame), v.said.join(' | '));
await backToLibrary();
v = await visitAfter(0, false, 'Letter Cookies');
ok('Letter Cookies, 3 stars again: no moon (once per game)', v.done && !v.seen);

const robot = await page.evaluate(() => window.__browserSpoke.slice());
ok('nothing fell back to the browser voice', robot.length === 0, robot.join(' | '));

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
