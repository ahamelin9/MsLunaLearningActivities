#!/usr/bin/env node
// Does a story lesson ask a story's questions in turn, the bar counting each?
// (CUR-22a/b)
//
//   node .claude/skills/know-how/story-lesson-check.mjs [port=5199] [grade=1] ["title part"=Little Stories]
//
// Needs Vite on the port. It opens the lesson as a child would and plays two
// stories: on each it answers every question right, in turn (one wrong answer
// first on the second question), and checks that the questions come in the
// story's own order, that a wrong answer doesn't move the bar, that each right
// one does (Round 2, 3, 4, then the next story at 5), that the read-aloud
// opens after the first answer, and that the next story is a new one. On the
// code before CUR-22a the bar says "of 2" and a story asks one question.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';
import { lessonCard } from './library.mjs';

const args = process.argv.slice(2);
const port = args.find(a => /^\d{4}$/.test(a)) ?? '5199';
const grade = Number(args.find(a => /^grade=/.test(a))?.slice(6) ?? 1);
const title = args.find(a => !/^\d{4}$/.test(a) && !a.startsWith('grade=')) ?? 'Little Stories';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? '✅' : '❌'} ${name}${detail !== '' ? `  (${detail})` : ''}`);
};
const until = async (fn, ms = 12000) => {
  for (let t = 0; t < ms; t += 150) {
    if (await fn()) return true;
    await wait(150);
  }
  return false;
};

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820, hasTouch: true });
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[grade].click();
await page.waitForSelector(at('hub'));
// every lesson open, so any can be played
const titles = await page.evaluate(async g => {
  const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
  const key = 'ms_luna_learning_progress_v1';
  const saved = JSON.parse(localStorage.getItem(key));
  saved.completedLessons = lessonsFor(g).map(l => l.lesson.id);
  localStorage.setItem(key, JSON.stringify(saved));
  return lessonsFor(g).map(l => l.title);
}, ['kindergarten', 'grade1', 'grade2'][grade]);
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await wait(300);
const index = titles.findIndex(t => t.includes(title));
if (index < 0) throw new Error(`no lesson "${title}": ${titles.join(', ')}`);
const card = await lessonCard(page, index);
await card.evaluate(e => e.scrollIntoView({ block: 'center' }));
await card.click();
await page.waitForSelector(at('play'));
await page.click(at('play'));
await page.waitForSelector(at('lesson-choice'));
await wait(600);

const bar = () => page.$eval(at('round-pips'), e => e.getAttribute('aria-label')).catch(() => null);
/** the round's story, and the question on screen, from React */
const now = () =>
  page.evaluate(() => {
    const el = document.querySelector('[data-shot="lesson-choice"]');
    if (!el) return null;
    const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
    let quiz = null;
    for (let f = el[key]; f; f = f.return) {
      quiz = quiz ?? f.memoizedProps?.quiz;
      const q = f.memoizedProps?.question;
      if (q?.questions && quiz) return { id: q.id, asked: q.questions.map(z => z.question), quiz: quiz.question, right: quiz.options[quiz.correctIndex], wrong: quiz.options.find((_, i) => i !== quiz.correctIndex) };
    }
    return null;
  });
const tap = label => page.$$eval(at('lesson-choice'), (bs, l) => bs.find(b => b.textContent.trim() === l)?.click(), label);
const storyOpen = () => page.$$eval('button', bs => !bs.find(b => b.textContent.includes('Read me the whole story'))?.disabled);

ok(`${title}: the bar opens on Round 1 of 20`, (await bar()) === 'Round 1 of 20', await bar());

const seen = [];
const stories = [];
for (let story = 0; story < 2; story++) {
  await until(async () => (await now())?.id && (await now()).id !== stories.at(-1));
  const first = await now();
  if (!first) {
    ok(`story ${story + 1}: a list of questions to ask`, false, 'none: one question a story');
    break;
  }
  stories.push(first.id);
  const order = [];
  for (let n = 0; n < first.asked.length; n++) {
    await until(async () => (await now())?.quiz === first.asked[n], 8000);
    const q = await now();
    order.push(q?.quiz);
    if (story === 1 && n === 1) {
      const before = await bar();
      await tap(q.wrong);
      await wait(4500);
      ok('a wrong answer leaves the bar where it was', (await bar()) === before, `${before} → ${await bar()}`);
    }
    const before = await bar();
    await until(() => tap(q.right).then(() => true));
    await until(async () => (await bar()) !== before, 9000);
    seen.push((await bar())?.replace('Round ', ''));
    if (story === 0 && n === 0) ok('the read-aloud opens after the first answer', await storyOpen());
  }
  ok(`story ${story + 1} (${first.id}): its ${first.asked.length} questions in its own order`, first.asked.length === 4 && order.join('|') === first.asked.join('|'), order.length);
}
ok('the bar moves once per right answer, then on to the next story', seen.join(' ') === '2 of 20 3 of 20 4 of 20 5 of 20 6 of 20 7 of 20 8 of 20 9 of 20', seen.join(', '));
ok('the second story is a new one', stories[0] !== stories[1], stories.join(' → '));

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
