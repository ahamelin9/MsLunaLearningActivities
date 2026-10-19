#!/usr/bin/env node
// The milestone moon (DES-17): does she visit for the big milestones only,
// once each, and talk alone while she's there?
//
//   node .claude/skills/know-how/moon-check.mjs [port=5199] [--reduced-motion]
//
// Needs Vite running on the port. In a muted Chrome, at kindergarten, playing
// each lesson through for real, it checks:
//   - the first lesson ever finished brings the moon, saying a "first" line;
//   - replaying it doesn't (an ordinary lesson);
//   - finishing the lesson that makes half the grade's lessons done brings
//     her, with a "half" line, and the last one, with an "all" line;
//   - replaying the last one doesn't (each milestone comes once per child);
//   - while she's there, the done screen's Luna never moves her beak, and the
//     moon's mouth moves while her clip plays; she leaves by herself;
//   - with --reduced-motion, she appears and leaves without gliding;
//   - nothing falls back to the browser voice (her clips are rendered).
// It fails on the commit before DES-17, which had no moon.

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
  const look = () => {
    const visit = document.querySelector('[data-shot="moon-visit"]');
    if (visit) {
      window.__visit.seen = true;
      window.__visit.glide.add(getComputedStyle(visit).animationName);
      if (document.querySelector('[data-shot="done-luna"] [data-state~="talking"]')) window.__visit.lunaTalked = true;
      if (visit.querySelector('[data-state~="talking"]')) window.__visit.moonTalked = true;
    }
    requestAnimationFrame(look);
  };
  requestAnimationFrame(look);
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

/** Plays lesson card i through to its done screen, trying each choice in turn. */
async function playLesson(i) {
  await (await page.$$(at('lesson-tile')))[i].click();
  await page.waitForSelector(at('shell-intro'));
  await page.click(at('play'));
  await page.waitForSelector(at('shell-play'));
  const round = () => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null);
  for (let guard = 0; guard < 40; guard++) {
    if (await shown(at('shell-reward'))) return true;
    const now = await round();
    const count = (await page.$$(at('lesson-choice'))).length;
    let moved = false;
    for (let c = 0; c < count && !moved; c++) {
      const choice = (await page.$$(at('lesson-choice')))[c];
      if (!choice) break;
      await choice.click().catch(() => {});
      for (let t = 0; t < 40 && !moved; t++) {
        await wait(200);
        moved = (await shown(`${at('win-garden')}, ${at('shell-reward')}`)) || (await round()) !== now;
      }
    }
    for (let t = 0; t < 60 && !(await shown(at('shell-reward'))) && (await round()) === now; t++) await wait(200);
  }
  return shown(at('shell-reward'));
}

/** The done screen's visit, if any: what was said, and how she came and went. */
async function visitAfter(i) {
  await page.evaluate(() => {
    window.__said = [];
    window.__visit = { seen: false, lunaTalked: false, moonTalked: false, glide: new Set() };
  });
  const done = await playLesson(i);
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
const half = Math.ceil(ids.length / 2);
const among = (said, lines) => said.some(s => lines.some(l => l.text === s));

// ---- the first lesson ever ----
let v = await visitAfter(0);
ok('Lesson 1, the first ever: the done screen shows', v.done);
ok('… the moon visits', v.seen);
ok('… saying a "first lesson" line', among(v.said, MOON.first), v.said.join(' | '));
ok('… Luna\'s beak stays still while the moon is there', v.seen && !v.lunaTalked);
ok('… the moon\'s mouth moves while her clip plays', v.moonTalked);
ok('… and she leaves by herself', v.gone);
ok(reduced ? '… appearing without gliding' : '… gliding in', reduced ? v.glide.every(n => n === 'none') : v.glide.some(n => n !== 'none'), v.glide.join(', '));

// ---- replaying it: an ordinary lesson ----
await backToLibrary();
await hook();
v = await visitAfter(0);
ok('replaying Lesson 1: no moon', v.done && !v.seen);

// ---- half the grade's lessons ----
await toHome();
await setDone(ids.slice(0, half - 1));
await toHome();
await intoLibrary();
v = await visitAfter(half - 1);
ok(`Lesson ${half}, half of ${ids.length}: the moon visits with a "half" line`, v.seen && among(v.said, MOON.half), v.said.join(' | '));

// ---- all of them ----
await toHome();
await setDone(ids.slice(0, ids.length - 1));
await toHome();
await intoLibrary();
v = await visitAfter(ids.length - 1);
ok(`Lesson ${ids.length}, the last: the moon visits with an "all" line`, v.seen && among(v.said, MOON.all), v.said.join(' | '));

// ---- each once ----
await backToLibrary();
await hook();
v = await visitAfter(ids.length - 1);
ok('replaying the last lesson: no moon (she came once)', v.done && !v.seen);

const robot = await page.evaluate(() => window.__browserSpoke.slice());
ok('nothing fell back to the browser voice', robot.length === 0, robot.join(' | '));

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
