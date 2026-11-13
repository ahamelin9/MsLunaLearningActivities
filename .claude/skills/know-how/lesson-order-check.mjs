#!/usr/bin/env node
// Do each skill's lessons open in order, 1, 2, 3? (PRG-7, CUR-11)
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
//   - finishing Lesson 1 (on its last play of practice, CUR-6; played through
//     for real) offers "Next lesson" and
//     opens Lesson 2, whose card pops in back on the library (DES-13), and a
//     locked tap then names Lesson 2;
//   - an old save with Lessons 1 and 3 done keeps both done and open, opens
//     only Lesson 2, and survives a reload; replaying Lesson 3 there offers no
//     "Next lesson", since Lesson 4 is still locked;
//   - the done screen's lesson pieces (DES-22d): after Lesson 1 the header
//     reads "Lesson 1 · …", the bar moves on from 0 to 1 and "Lesson 2 is
//     open now" shows; replaying Lesson 3 there, the bar stays and nothing
//     says it opened;
//   - the skills (CUR-7): with one lesson to go, the skill holding it is open
//     and the only one saying "Up next"; with every lesson done, the first
//     skill is open, none says "Up next", and every lesson is there, done;
//   - nothing falls back to the browser voice.
// Lines are matched by what pronunciation.say was asked (clip labels stick,
// know-how). Lesson cards are read by data-state: "done", "locked", or
// neither for the one up next. The library shows one skill's lessons at a
// time, so cards are found through library.mjs, which opens their skill.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';
import { allLessonCards, lessonCard, shownLessonCard, stateOf } from './library.mjs';

const port = process.argv[2] ?? '5199';
const at = n => `[data-shot="${n}"]`;
const shownLesson = i => shownLessonCard(page, i);
const wait = ms => new Promise(r => setTimeout(r, ms));
// the grown-up gate (SET-1): press and hold for --dur-hold (1.5s), then let go
const hold = async selector => {
  const box = await (await page.$(selector)).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await wait(2300);
  await page.mouse.up();
};
const KEY = 'ms_luna_learning_progress_v1';

const browser = await puppeteer.launch({
  executablePath: chromePath(),
  headless: true,
  args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required']
});
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
await page.evaluateOnNewDocument(() => {
  window.__browserSpoke = [];
  window.speechSynthesis.speak = u => window.__browserSpoke.push(u.text);
  // every count the done screen's lessons bar shows, in turn (DES-22d)
  window.__barSeen = [];
  new MutationObserver(() => {
    const v = document.querySelector('[data-shot="shell-reward"] [role="progressbar"]')?.getAttribute('aria-valuenow');
    if (v != null && window.__barSeen.at(-1) !== v) window.__barSeen.push(v);
  }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-valuenow'] });
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
// every lesson's state in path order, across the skills (CUR-7: one skill's
// lessons show at a time)
const states = async () => (await allLessonCards(page, el => el.getAttribute('data-state') ?? '')).map(stateOf);
// the skill cards as the library opens: which is open, and which says "Up next"
const skills = () =>
  page.$$eval(at('skill-card'), els => els.map(el => ({
    name: el.getAttribute('aria-label').split(',')[0],
    open: el.getAttribute('aria-expanded') === 'true',
    next: /\bnext\b/.test(el.getAttribute('data-state') ?? '')
  })));
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
const skillIds = grade =>
  page.evaluate(async g => (await import('/src/apps/reading/engine/lessons.ts')).lessonsFor(g).map(l => l.lesson.skillId), grade);
/** What each lesson should be with `done` finished: in each skill, done stays done, the first not done is next, the rest locked. */
const expected = (skills, ids, done) => {
  const nextFound = new Set();
  return ids.map((id, i) => {
    if (done.includes(id)) return 'done';
    if (nextFound.has(skills[i])) return 'locked';
    nextFound.add(skills[i]);
    return 'next';
  });
};
/** Each skill's lesson cards, in the order they show: their numbers ("Lesson N, ..."). */
const numbersBySkill = async () => {
  const out = [];
  for (const skill of await page.$$(at('skill-card'))) {
    await skill.click();
    await wait(150);
    out.push({
      name: await skill.evaluate(el => el.getAttribute('aria-label').split(',')[0]),
      numbers: await page.$$eval(at('lesson-tile'), els => els.map(el => Number(/^Lesson (\d+),/.exec(el.getAttribute('aria-label'))?.[1])))
    });
  }
  return out;
};
const setDone = ids =>
  page.evaluate((key, list) => {
    const saved = JSON.parse(localStorage.getItem(key));
    saved.completedLessons = list;
    localStorage.setItem(key, JSON.stringify(saved));
  }, KEY, ids);

// a lesson is done once it's practiced (CUR-6): this puts one on its last play,
// so whatever the next play's like, it finishes it
const onLastPlay = id =>
  page.evaluate((key, lesson) => {
    const saved = JSON.parse(localStorage.getItem(key));
    saved.lessonPractice = { ...saved.lessonPractice, [lesson]: { good: 2, plays: 5 } };
    localStorage.setItem(key, JSON.stringify(saved));
  }, KEY, id);

/** Taps lesson card i while it's locked; returns whether it opened and what was said. */
const tapLocked = async i => {
  const before = (await said()).length;
  const clips = await page.evaluate(() => window.__starts);
  const card = await lessonCard(page, i);
  await card.click();
  const wobbled = await card.evaluate(el => /\bwobbling\b/.test(el.getAttribute('data-state') ?? ''));
  await wait(2500);
  const opened = await shown(at('shell-intro'));
  const result = { opened, wobbled, said: (await said()).slice(before), clips: (await page.evaluate(() => window.__starts)) - clips };
  // older code opened it: go back, so the rest of the check still runs
  if (opened) await back();
  return result;
};

/** Plays the open lesson card i through to its done screen, each round's right choice first time. */
const playLesson = async i => {
  await page.evaluate(() => { window.__barSeen = []; });
  await (await lessonCard(page, i)).click();
  await page.waitForSelector(at('shell-intro'));
  await page.click(at('play'));
  await page.waitForSelector(at('shell-play'));
  const round = () => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null);
  // 20 rounds a play since CUR-12: the right choice is read from React, as
  // practice-check does, rather than found by trying each (8 s a miss)
  for (let guard = 0; guard < 40; guard++) {
    if (await shown(at('shell-reward'))) return true;
    await page.waitForSelector(`${at('lesson-choice')}, ${at('shell-reward')}`);
    if (await shown(at('shell-reward'))) return true;
    await wait(600);
    const now = await round();
    await page.evaluate(() => {
      const el = document.querySelector('[data-shot="lesson-choice"]');
      const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
      for (let f = el[key]; f; f = f.return) {
        const list = f.memoizedProps?.question?.options;
        if (Array.isArray(list)) {
          const o = list.find(x => x.isCorrect ?? x.isRhyme);
          const label = o.letter ? `letter ${o.letter}` : o.word ?? o.text;
          [...document.querySelectorAll('[data-shot="lesson-choice"]')].find(e => (e.getAttribute('aria-label') ?? e.textContent).trim() === label)?.click();
          return;
        }
      }
    });
    for (let t = 0; t < 80 && !(await shown(at('shell-reward'))) && (await round()) === now; t++) await wait(200);
  }
  return shown(at('shell-reward'));
};
/** The done screen's lesson pieces, once the result has been saved (DES-22d). */
const doneScreen = async () => {
  await wait(1200);
  return page.evaluate(() => {
    const r = document.querySelector('[data-shot="shell-reward"]');
    return {
      title: document.querySelector('header h1, header h2')?.textContent?.trim() ?? [...document.querySelectorAll('header *')].map(e => e.textContent.trim()).find(t => /^Lesson \d+ · /.test(t)) ?? null,
      seen: window.__barSeen.slice(),
      opened: [...(r?.querySelectorAll('span') ?? [])].map(s => s.textContent.trim()).find(t => /is open now$/.test(t)) ?? null
    };
  });
};
const back = async () => {
  await page.click(at('shell-back'));
  await page.waitForSelector(at('hub'));
  await wait(600);
};

await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });

// ---- every N a skill can need has its line (N is a lesson's number in its skill) ----
const lines = await page.evaluate(async () => {
  const { lessonsFor, lessonNumbers, FINISH_FIRST = {} } = await import('/src/apps/reading/engine/lessons.ts');
  return ['kindergarten', 'grade1', 'grade2'].map(g => {
    const n = Math.max(...lessonNumbers(lessonsFor(g)));
    const missing = Array.from({ length: Math.max(0, n - 1) }, (_, i) => i + 1).filter(k => !FINISH_FIRST[k]);
    return { g, n, missing };
  });
});
check(`a line for every lesson a skill can have up next (longest skill: ${lines.map(l => `${l.g} ${l.n}`).join(', ')})`, lines.every(l => l.missing.length === 0));

// ---- a fresh save, each grade ----
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[0].click();
await page.waitForSelector(at('hub'));
await hook();
await wait(600);
const fresh = async (name, grade) => {
  const s = await states();
  const want = expected(await skillIds(grade), await lessonIds(grade), []);
  check(`fresh save, ${name}: each skill's Lesson 1 open, the rest locked (${s.join(' ')})`, s.join(' ') === want.join(' '));
  const numbers = await numbersBySkill();
  check(`${name}: each skill's lessons read Lesson 1, 2, 3 in order (${numbers.map(b => `${b.name} ${b.numbers.join(',')}`).join('; ')})`,
    numbers.every(b => b.numbers.every((n, i) => n === i + 1)));
  return numbers;
};
await fresh('K', 'kindergarten');
for (const [i, name, grade] of [[1, '1st', 'grade1'], [2, '2nd', 'grade2']]) {
  await hold(at('change-grade'));
  await page.waitForSelector(at('grade-card'));
  await (await page.$$(at('grade-card')))[i].click();
  await page.waitForSelector(at('hub'));
  await wait(600);
  const numbers = await fresh(name, grade);
  if (grade === 'grade2') {
    const vowelTeams = numbers.find(b => b.name === 'Vowel teams');
    check(`2nd grade's Vowel teams shows its lessons together (${vowelTeams?.numbers.length})`, vowelTeams?.numbers.length === 7);
  }
}
await hold(at('change-grade'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[0].click();
await page.waitForSelector(at('hub'));
await wait(2500);

// ---- a locked tap: Letter sounds' Lesson 2 ----
const ids = await lessonIds('kindergarten');
const kSkills = await skillIds('kindergarten');
const inSkill = (n, skill = kSkills[0]) => kSkills.map((s, i) => [s, i]).filter(([s]) => s === skill)[n - 1][1];
const lockedTap = await tapLocked(inSkill(2));
check(
  `tapping locked Letter sounds Lesson 2: not opened, wobbled, Luna says ${JSON.stringify(lockedTap.said)} (${lockedTap.clips} clip)`,
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

// ---- finishing Letter sounds' Lesson 1 ----
await onLastPlay(ids[0]);
await page.reload({ waitUntil: 'networkidle0' });
await intoLibrary();
const finished = await playLesson(0);
const doneOne = await doneScreen();
const nextOffered = await nextLessonOffered();
await page.click(at('shell-back'));
await page.waitForSelector(at('hub'));
// DES-13: the lesson that just opened pops in once, back on the library (its
// skill is open, since it holds the lesson that just opened: CUR-11)
const pop = await (await lessonCard(page, inSkill(2))).evaluate(el =>
  ({ opened: /\bopened\b/.test(el.getAttribute('data-state') ?? ''), motion: getComputedStyle(el).animationName }));
await wait(600);
const afterOne = await states();
check(`back on the library, Lesson 2 pops in once (${JSON.stringify(pop)})`, pop.opened && pop.motion.includes('luna-pop'));
check(`finishing Lesson 1 offers "Next lesson" and opens Letter sounds' Lesson 2, nothing else (${finished ? 'done screen' : 'never finished'}; ${afterOne.join(' ')})`,
  finished && nextOffered && afterOne.join(' ') === expected(kSkills, ids, [ids[0]]).join(' '));
await wait(1500);
const lockedTwo = await tapLocked(inSkill(3));
check(`then a locked tap on its Lesson 3 names Lesson 2 (${JSON.stringify(lockedTwo.said)})`, !lockedTwo.opened && lockedTwo.said.includes('Let’s finish Lesson 2 first!'));

// ---- an old save, done out of order: Letter sounds' Lessons 1 and 3 ----
const oldDone = [ids[0], ids[inSkill(3)]];
await setDone(oldDone);
await page.reload({ waitUntil: 'networkidle0' });
await intoLibrary();
const oldSave = await states();
await page.reload({ waitUntil: 'networkidle0' });
await intoLibrary();
const reloaded = await states();
const want = expected(kSkills, ids, oldDone).join(' ');
check(`Letter sounds' Lessons 1 and 3 done: ${oldSave.join(' ')}, after a reload ${reloaded.join(' ')}`, oldSave.join(' ') === want && reloaded.join(' ') === want);
const three = await playLesson(inSkill(3));
const doneThree = await doneScreen();
const nextAfterThree = await nextLessonOffered();
check(`replaying Lesson 3 there: ${three ? 'done screen' : 'never finished'}, no "Next lesson" while its Lesson 4 is locked`, three && !nextAfterThree);
check(`after Lesson 1 the done screen reads "${doneOne.title}", its skill's bar moves on (${doneOne.seen.join(' → ')}) and says "${doneOne.opened}"`,
  /^Lesson 1 · /.test(doneOne.title ?? '') && doneOne.seen.join(' ') === '0 1' && doneOne.opened === 'Lesson 2 is open now');
check(`replaying Lesson 3, the bar stays (${doneThree.seen.join(' → ')}) and nothing opened (${doneThree.opened})`,
  doneThree.seen.join(' ') === '2' && doneThree.opened === null);
await back();

// ---- a late lesson up next is on screen as the library opens (CUR-4) ----
for (const [width, height] of [[1180, 820], [744, 1133]]) {
  await page.setViewport({ width, height });
  await setDone(ids.slice(0, ids.length - 1));
  await page.reload({ waitUntil: 'networkidle0' });
  await intoLibrary();
  const last = await shownLesson(ids.length - 1);
  const onScreen = last && (await last.evaluate(el => {
    const r = el.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= window.innerHeight;
  }));
  check(`at ${width} wide, the last lesson, up next, is on screen as the library opens`, onScreen);
}
await page.setViewport({ width: 1180, height: 820 });

// ---- which skill opens first (CUR-7, CUR-11) ----
// the first not finished, which says "Up next" too; once every lesson is
// done, the first
await setDone(ids.slice(0, ids.length - 1));
await page.reload({ waitUntil: 'networkidle0' });
await intoLibrary();
const nearEnd = await skills();
const lastShown = !!(await shownLesson(ids.length - 1));
check(`one lesson to go: the skill holding it is open and says "Up next" (${nearEnd.filter(s => s.open).map(s => s.name)}), with its lesson showing`,
  nearEnd.filter(s => s.open).length === 1 && nearEnd.find(s => s.open).next && nearEnd.filter(s => s.next).length === 1 && lastShown);
await setDone(ids);
await page.reload({ waitUntil: 'networkidle0' });
await intoLibrary();
const allDone = await skills();
check(`every lesson done: the first skill is open (${allDone.filter(s => s.open).map(s => s.name)}) and none says "Up next"`,
  allDone[0].open && allDone.filter(s => s.open).length === 1 && !allDone.some(s => s.next));
const every = await states();
check(`every lesson done: all ${ids.length} are there, one skill tap away (${every.length} found, ${every.filter(s => s === 'done').length} done)`,
  every.length === ids.length && every.every(s => s === 'done'));

const spoke = await page.evaluate(() => window.__browserSpoke);
check(`no line fell back to the browser voice${spoke.length ? `: ${JSON.stringify(spoke)}` : ''}`, spoke.length === 0);

for (const [what, ok] of results) console.log(`${ok ? '✅' : '❌'} ${what}`);
await browser.close();
process.exit(results.every(([, ok]) => ok) ? 0 : 1);
