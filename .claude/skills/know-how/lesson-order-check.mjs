#!/usr/bin/env node
// Do lessons open in order? (PRG-7)
//
//   node .claude/skills/know-how/lesson-order-check.mjs [port=5199]
//
// Needs Vite running on the port. In a muted Chrome it checks:
//   - every grade's "Let's finish Lesson N first!" lines exist for each N its
//     lessons can need (engine/lessons.ts, FINISH_FIRST);
//   - a fresh save opens only Lesson 1, at each grade;
//   - a tap on a locked lesson doesn't open it, wobbles it, and plays Luna's
//     line naming the lesson up next;
//   - every game opens;
//   - finishing Lesson 1 (played through for real) offers "Next lesson" and
//     opens Lesson 2, and a locked tap then names Lesson 2;
//   - an old save with Lessons 1 and 3 done keeps both done and open, opens
//     only Lesson 2, and survives a reload; replaying Lesson 3 there offers no
//     "Next lesson", since Lesson 4 is still locked;
//   - nothing falls back to the browser voice.
// Lines are matched by what pronunciation.say was asked (clip labels stick,
// know-how). Lesson cards are read by data-state: "done", "locked", or
// neither for the one up next.

import puppeteer from 'puppeteer-core';

const port = process.argv[2] ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const KEY = 'ms_luna_learning_progress_v1';

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required']
});
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
await page.evaluateOnNewDocument(() => {
  window.__browserSpoke = [];
  window.speechSynthesis.speak = u => window.__browserSpoke.push(u.text);
  window.__starts = 0;
  const start = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...args) {
    window.__starts += 1;
    return start.apply(this, args);
  };
});

const results = [];
const check = (what, ok) => results.push([what, Boolean(ok)]);

// wraps the clip player the page loaded, after every load
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
const said = () => page.evaluate(() => window.__said.slice());
const states = () =>
  page.$$eval(at('lesson-tile'), els => els.map(el => {
    const s = el.getAttribute('data-state') ?? '';
    return /\bdone\b/.test(s) ? 'done' : /\blocked\b/.test(s) ? 'locked' : 'next';
  }));
const shown = sel => page.evaluate(s => !!document.querySelector(s), sel);
// the done screen's "Next lesson", found by its words
const nextLessonOffered = () =>
  page.evaluate(() => [...document.querySelectorAll('[data-shot="shell-reward"] button')].some(b => b.textContent.trim() === 'Next lesson'));
const intoLibrary = async () => {
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  await hook();
  await wait(600);
};
const lessonIds = grade =>
  page.evaluate(async g => (await import('/src/apps/reading/engine/lessons.ts')).lessonsFor(g).map(l => l.lesson.id), grade);
const setDone = ids =>
  page.evaluate((key, list) => {
    const saved = JSON.parse(localStorage.getItem(key));
    saved.completedLessons = list;
    localStorage.setItem(key, JSON.stringify(saved));
  }, KEY, ids);

/** Taps lesson card i while it's locked; returns whether it opened and what was said. */
const tapLocked = async i => {
  const before = (await said()).length;
  const clips = await page.evaluate(() => window.__starts);
  await (await page.$$(at('lesson-tile')))[i].click();
  const wobbled = await page.$$eval(at('lesson-tile'), (els, n) => /\bwobbling\b/.test(els[n]?.getAttribute('data-state') ?? ''), i);
  await wait(2500);
  const opened = await shown(at('shell-intro'));
  const result = { opened, wobbled, said: (await said()).slice(before), clips: (await page.evaluate(() => window.__starts)) - clips };
  // older code opened it: go back, so the rest of the check still runs
  if (opened) await back();
  return result;
};

/** Plays the open lesson card i through to its done screen, trying each choice in turn. */
const playLesson = async i => {
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
        moved = (await shown(`${at('win-veil')}, ${at('shell-reward')}`)) || (await round()) !== now;
      }
    }
    for (let t = 0; t < 60 && !(await shown(at('shell-reward'))) && (await round()) === now; t++) await wait(200);
  }
  return shown(at('shell-reward'));
};
const back = async () => {
  await page.click(at('shell-back'));
  await page.waitForSelector(at('hub'));
  await wait(600);
};

await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });

// ---- every N a grade can need has its line ----
const lines = await page.evaluate(async () => {
  const { lessonsFor, FINISH_FIRST = {} } = await import('/src/apps/reading/engine/lessons.ts');
  return ['kindergarten', 'grade1', 'grade2'].map(g => {
    const n = lessonsFor(g).length;
    const missing = Array.from({ length: Math.max(0, n - 1) }, (_, i) => i + 1).filter(k => !FINISH_FIRST[k]);
    return { g, n, missing };
  });
});
check(`a line for every lesson a grade can have up next (${lines.map(l => `${l.g} ${l.n}`).join(', ')})`, lines.every(l => l.missing.length === 0));

// ---- a fresh save, each grade ----
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[0].click();
await page.waitForSelector(at('hub'));
await hook();
await wait(600);
const kFresh = await states();
check(`fresh save, K: only Lesson 1 open (${kFresh.join(' ')})`, kFresh[0] === 'next' && kFresh.slice(1).every(s => s === 'locked'));
for (const [i, name] of [[1, '1st'], [2, '2nd']]) {
  await page.click(at('change-grade'));
  await page.waitForSelector(at('grade-card'));
  await (await page.$$(at('grade-card')))[i].click();
  await page.waitForSelector(at('hub'));
  await wait(600);
  const s = await states();
  check(`fresh save, ${name}: only Lesson 1 open (${s.join(' ')})`, s[0] === 'next' && s.slice(1).every(x => x === 'locked'));
}
await page.click(at('change-grade'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[0].click();
await page.waitForSelector(at('hub'));
await wait(2500);

// ---- a locked tap ----
const lockedTap = await tapLocked(2);
check(
  `tapping locked Lesson 3: not opened, wobbled, Luna says ${JSON.stringify(lockedTap.said)} (${lockedTap.clips} clip)`,
  !lockedTap.opened && lockedTap.wobbled && lockedTap.said.includes('Let’s finish Lesson 1 first!') && lockedTap.clips >= 1
);

// ---- every game opens ----
const games = (await page.$$(at('game-tile'))).length;
let opened = 0;
for (let i = 0; i < games; i++) {
  await (await page.$$(at('game-tile')))[i].click();
  if (await page.waitForSelector(at('shell-intro'), { timeout: 5000 }).then(() => true, () => false)) opened++;
  await back();
}
check(`every game opens (${opened} of ${games})`, opened === games && games === 8);

// ---- finishing Lesson 1 ----
const finished = await playLesson(0);
const nextOffered = await nextLessonOffered();
await back();
const afterOne = await states();
check(`finishing Lesson 1 offers "Next lesson" and opens Lesson 2 (${finished ? 'done screen' : 'never finished'}; ${afterOne.join(' ')})`,
  finished && nextOffered && afterOne[0] === 'done' && afterOne[1] === 'next' && afterOne.slice(2).every(s => s === 'locked'));
await wait(1500);
const lockedTwo = await tapLocked(3);
check(`then a locked tap names Lesson 2 (${JSON.stringify(lockedTwo.said)})`, !lockedTwo.opened && lockedTwo.said.includes('Let’s finish Lesson 2 first!'));

// ---- an old save, done out of order ----
const ids = await lessonIds('kindergarten');
await setDone([ids[0], ids[2]]);
await page.reload({ waitUntil: 'networkidle0' });
await intoLibrary();
const oldSave = await states();
await page.reload({ waitUntil: 'networkidle0' });
await intoLibrary();
const reloaded = await states();
const want = 'done next done locked locked locked';
check(`Lessons 1 and 3 done: ${oldSave.join(' ')}, after a reload ${reloaded.join(' ')}`, oldSave.join(' ') === want && reloaded.join(' ') === want);
const three = await playLesson(2);
const nextAfterThree = await nextLessonOffered();
check(`replaying Lesson 3 there: ${three ? 'done screen' : 'never finished'}, no "Next lesson" while Lesson 4 is locked`, three && !nextAfterThree);
await back();

const spoke = await page.evaluate(() => window.__browserSpoke);
check(`no line fell back to the browser voice${spoke.length ? `: ${JSON.stringify(spoke)}` : ''}`, spoke.length === 0);

for (const [what, ok] of results) console.log(`${ok ? '✅' : '❌'} ${what}`);
await browser.close();
process.exit(results.every(([, ok]) => ok) ? 0 : 1);
