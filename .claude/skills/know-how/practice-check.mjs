#!/usr/bin/env node
// A lesson is practiced until it's learned (CUR-6).
//
//   node .claude/skills/know-how/practice-check.mjs [port=5199]
//
// Needs Vite running on the port. Plays Kindergarten's lessons for real, reading
// the right answer from React each round:
//   - from a fresh save: 2 good plays leave the next lesson locked, a weak play
//     doesn't count, and the 3rd good play opens it;
//   - 6 plays of any kind open it too, so no child is stuck;
//   - an older save's finished lessons stay done, and replaying one says so;
//   - a play is 20 rounds (CUR-12): every question of the lesson once before any
//     comes again, never one twice in a row, and a round missed comes back in
//     the next play (asked twice there, since the lesson holds fewer than 20).
// It fails on the commit before CUR-6, where one play opened the next lesson.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';
import { allLessonCards, lessonCard } from './library.mjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const KEY = 'ms_luna_learning_progress_v1';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });

const shown = sel => page.evaluate(s => Boolean(document.querySelector(s)), sel);

/** opens the library on a save of this shape */
async function startFrom(save) {
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
  await page.evaluate((key, s) => {
    localStorage.clear();
    localStorage.setItem(key, JSON.stringify({ selectedGrade: 'kindergarten', ...s }));
  }, KEY, save);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  await wait(500);
}

// every lesson's card label, in path order, across the skills (CUR-7)
const cards = () => allLessonCards(page, e => e.getAttribute('aria-label'));
// Lesson n of the first lesson's skill (Letter sounds): since CUR-11 a skill's
// lessons go 1, 2, 3, and Lesson 1 opens that skill's Lesson 2
const firstSkill = () =>
  page.evaluate(async () => {
    const all = (await import('/src/apps/reading/engine/lessons.ts')).lessonsFor('kindergarten');
    return all.flatMap((l, i) => (l.lesson.skillId === all[0].lesson.skillId ? [i] : []));
  });
const stateOf = async n => {
  const label = (await cards())[(await firstSkill())[n - 1]] ?? '';
  return /, done/.test(label) ? 'done' : /, up next/.test(label) ? 'next' : /, locked/.test(label) ? 'locked' : label;
};

/** this round's question, as the lesson has it */
const question = () => page.evaluate(() => {
  const el = document.querySelector('[data-shot="lesson-choice"]');
  if (!el) return null;
  const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
  for (let f = el[key]; f; f = f.return) {
    const q = f.memoizedProps?.question;
    if (Array.isArray(q?.options)) {
      const label = o => (o.letter ? `letter ${o.letter}` : o.word ?? o.text);
      return {
        id: q.id,
        right: q.options.filter(o => o.isCorrect ?? o.isRhyme).map(label),
        wrong: q.options.filter(o => !(o.isCorrect ?? o.isRhyme)).map(label)
      };
    }
  }
  return null;
});
const tap = label => page.evaluate(l => {
  [...document.querySelectorAll('[data-shot="lesson-choice"]')]
    .find(e => (e.getAttribute('aria-label') ?? e.textContent).trim() === l)
    ?.click();
}, label);
const roundNow = () => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null);

/**
 * Plays a lesson through: `misses(id, round)` wrong taps first each round.
 * Returns the questions it asked and what the done screen says.
 */
async function play(misses, { number = 1, again = false } = {}) {
  if (again) {
    await page.click(at('play-again'));
  } else {
    await (await lessonCard(page, number - 1)).click();
    await page.waitForSelector(at('play'));
    await page.click(at('play'));
  }
  await page.waitForSelector(at('shell-play'));
  const asked = [];
  for (let r = 0; r < 25 && !(await shown(at('shell-reward'))); r++) {
    await page.waitForSelector(at('lesson-choice'));
    await wait(700);
    const now = await roundNow();
    const q = await question();
    asked.push(q.id);
    for (let m = 0; m < misses(q.id, r); m++) { await tap(q.wrong[m % q.wrong.length]); await wait(2600); }
    await tap(q.right[0]);
    for (let t = 0; t < 80; t++) {
      if ((await shown(at('shell-reward'))) || (await roundNow()) !== now) break;
      await wait(200);
    }
  }
  await page.waitForSelector(at('shell-reward'), { timeout: 20000 });
  await wait(1000);
  const done = await page.evaluate(sel => {
    const r = document.querySelector(sel);
    const buttons = [...r.querySelectorAll('button')].map(b => b.textContent.trim());
    return {
      title: r.querySelector('h2')?.textContent.trim(),
      practice: document.querySelector('[data-shot="done-practice"]')?.textContent.replace(/\s+/g, ' ').trim() ?? null,
      opened: [...r.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /is open now$/.test(t)) ?? null,
      hasNext: buttons.includes('Next lesson'),
      primary: document.querySelector('[data-shot="play-again"]')?.textContent.trim()
    };
  }, at('shell-reward'));
  return { asked, done };
}
async function back() {
  await wait(2500); // past the moon's visit, if she came
  await page.click(at('shell-back'));
  await page.waitForSelector(at('hub'));
  await wait(500);
}
const clean = () => 0;
const weak = () => 1;

// ---- the rule ----
const rule = await (async () => {
  await startFrom({});
  return page.evaluate(async () => (await import('/src/apps/reading/engine/practice.ts')).LEARN_RULE).catch(() => null);
})();
ok('the rule is one constant: 3 good plays of 80%, or 6 of any kind', rule?.goodPlays === 3 && rule?.goodShare === 0.8 && rule?.anyPlays === 6, JSON.stringify(rule));

// ---- 3 good plays, and a weak one that doesn't count ----
await startFrom({});
const one = await play(clean);
ok('a good play: "Nice practice!", 1 of 3, and it leads back into practice', one.done.title === 'Nice practice!' && /1 of 3 good plays/.test(one.done.practice ?? '') && one.done.primary === 'Practice again', JSON.stringify(one.done));
ok('after it there is no way on: no "Next lesson", nothing opened', !one.done.hasNext && !one.done.opened);
await back();
ok('the next lesson stays locked after 1 good play', (await stateOf(2)) === 'locked', await stateOf(2));
ok('the card shows the practice', /practice 1 of 3/.test((await cards())[0]), (await cards())[0]);

const poor = await play(weak);
ok('a weak play doesn\'t count: still 1 of 3, and it says what a good play is', /1 of 3 good plays/.test(poor.done.practice ?? '') && /A good play is \d+ of \d+ first try/.test(poor.done.practice ?? ''), poor.done.practice);
await back();

const two = await play(clean);
ok('2 good plays: 2 of 3', /2 of 3 good plays/.test(two.done.practice ?? ''), two.done.practice);
await back();
ok('the next lesson stays locked after 2 good plays', (await stateOf(2)) === 'locked', await stateOf(2));

const three = await play(clean);
ok('the 3rd good play: "Lesson learned!", and Lesson 2 opens', three.done.title === 'Lesson learned!' && three.done.opened === 'Lesson 2 is open now', JSON.stringify(three.done));
ok('its done screen has "Next lesson" and "Play again", and no practice bar', three.done.hasNext && three.done.primary === 'Play again' && three.done.practice === null, JSON.stringify(three.done));
await back();
ok('the library agrees: Lesson 1 done, Lesson 2 up next', (await stateOf(1)) === 'done' && (await stateOf(2)) === 'next');

// ---- no child is stuck ----
await startFrom({ lessonPractice: { 'k-ms-m-s-b-t': { good: 0, plays: 4 } } });
const fifth = await play(weak);
await back();
ok('a 5th weak play still leaves it locked', (await stateOf(2)) === 'locked' && fifth.done.title === 'Nice practice!', fifth.done.title);
const sixth = await play(weak);
ok('the 6th play of any kind moves on: "Lesson done!", not "learned", and Lesson 2 opens', sixth.done.title === 'Lesson done!' && sixth.done.opened === 'Lesson 2 is open now', JSON.stringify(sixth.done));
await back();

// ---- an older save ----
// Letter sounds' Lessons 1 and 2 done (CUR-11: one skill's lessons in a row)
const letterSounds = await page.evaluate(async () => {
  const all = (await import('/src/apps/reading/engine/lessons.ts')).lessonsFor('kindergarten');
  return all.filter(l => l.lesson.skillId === all[0].lesson.skillId).map(l => l.lesson.id);
});
await startFrom({ completedLessons: letterSounds.slice(0, 2) });
ok('an older save\'s finished lessons stay done, with no practice to do', (await stateOf(1)) === 'done' && (await stateOf(2)) === 'done' && (await stateOf(3)) === 'next');
const replay = await play(clean);
ok('replaying one: "Lesson done!", "Play again", no practice bar', replay.done.title === 'Lesson done!' && replay.done.primary === 'Play again' && replay.done.practice === null, JSON.stringify(replay.done));
await back();

// ---- a play of 20 goes round its lesson, and what was missed comes back (CUR-12) ----
const lesson1 = await page.evaluate(async () => {
  const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
  const { READING_CURRICULUM } = await import('/src/data/readingCurriculum.ts');
  const l = lessonsFor('kindergarten')[0];
  return { perPlay: l.roundsPerPlay, pool: READING_CURRICULUM.kindergarten.flatMap(s => s.lessons).find(x => x.id === l.id).questions.length };
});
ok(`a lesson's play is 20 rounds, more than its ${lesson1.pool} questions`, lesson1.perPlay === 20 && lesson1.pool < 20, JSON.stringify(lesson1));
await startFrom({});
let missedId = null;
const first = await play((id, r) => { if (r === 0) { missedId = id; return 1; } return 0; });
const second = await play(clean, { again: true });
const onceFirst = p => { const i = p.findIndex((id, n) => p.indexOf(id) !== n); return i === -1 || i >= lesson1.pool; };
const inARow = p => p.some((id, n) => n > 0 && id === p[n - 1]);
ok('each play asked 20', first.asked.length === 20 && second.asked.length === 20, `${first.asked.length}, ${second.asked.length}`);
ok('every question once before any comes again', onceFirst(first.asked) && onceFirst(second.asked), `${first.asked.join(' ')} → ${second.asked.join(' ')}`);
ok('never the same question twice in a row', !inARow(first.asked) && !inARow(second.asked));
ok('the round missed comes back in the next play, twice', second.asked.filter(id => id === missedId).length === 2, `missed ${missedId}`);

ok('no error on the page', errors.length === 0, errors[0] ?? '');
await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
