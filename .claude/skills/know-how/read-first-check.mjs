#!/usr/bin/env node
// The child reads first, then Luna helps (CUR-14).
//
//   node .claude/skills/know-how/read-first-check.mjs [port=5199]
//
// Needs Vite running on the port. Listens to what Luna is asked to say (by
// wrapping pronunciation.say, as moon-check does) while it plays, at 1st Grade:
//   - Sentences' Lesson 1: on round 1 Luna says the instruction; a word tapped
//     before an answer isn't read, and Luna says "Try reading it first!";
//     after a wrong answer the word is read; round 2 starts quiet, and its
//     speaker button still says the instruction;
//   - Little stories' Lesson 1: a word tapped before an answer gets the nudge;
//   - Magic E's Lesson 1 (Read and Match): the instruction on round 1 only;
//   - Letter sounds (Kindergarten), a listening lesson: its question is said
//     every round, since it is the question.
// It fails on the commit before CUR-14, where a word read itself any time and
// every round said its instruction.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';
import { lessonCard } from './library.mjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const KEY = 'ms_luna_learning_progress_v1';
const NUDGE = 'Try reading it first!';
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
const forget = () => page.evaluate(() => { window.__said = []; });
const round = () => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null);

/** this round's question, as the lesson has it */
const question = () => page.evaluate(() => {
  const el = document.querySelector('[data-shot="lesson-choice"]');
  const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
  for (let f = el[key]; f; f = f.return) {
    const q = f.memoizedProps?.question;
    if (q) {
      const options = q.options?.map(o => ({ label: o.letter ? `letter ${o.letter}` : o.word ?? o.text, right: Boolean(o.isCorrect ?? o.isRhyme) }))
        ?? q.comprehensionQuestion.options.map((text, i) => ({ label: text, right: i === q.comprehensionQuestion.correctIndex }));
      return { instruction: q.speechPrompt ?? q.prompt, prompt: q.prompt, options, sentence: q.sentence ?? q.sentences?.[0]?.text };
    }
  }
  return null;
});
const tapChoice = label => page.evaluate(l => [...document.querySelectorAll('[data-shot="lesson-choice"]')].find(e => (e.getAttribute('aria-label') ?? e.textContent).trim() === l)?.click(), label);
/** taps the first word of the sentence or story laid out word by word, and returns it as the reader cleans it */
const tapWord = () => page.evaluate(() => {
  const choices = new Set(document.querySelectorAll('[data-shot="lesson-choice"]'));
  const word = [...document.querySelectorAll('[data-shot="stage"] button')]
    .find(b => !choices.has(b) && !b.closest('[data-shot="lesson-choice"]') && /^[A-Za-z][A-Za-z']*[.,!?]?$/.test(b.textContent.trim()) && !b.disabled);
  word.click();
  return word.textContent.trim().replace(/[^a-zA-Z']/g, '');
});
const nextRound = async now => {
  for (let t = 0; t < 80 && (await round()) === now; t++) await wait(200);
  await page.waitForSelector(at('lesson-choice'));
};

async function openLesson(grade, id) {
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
  await page.evaluate((key, g) => { localStorage.clear(); localStorage.setItem(key, JSON.stringify({ selectedGrade: g })); }, KEY, grade);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  await wait(500);
  await hook();
  const title = await page.evaluate(async (g, lessonId) => (await import('/src/apps/reading/engine/lessons.ts')).lessonsFor(g).find(l => l.id === lessonId).title, grade, id);
  await (await lessonCard(page, title)).click();
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('lesson-choice'));
  await forget();
  await wait(1500);
}
const count = (list, text) => list.filter(t => t === text).length;
// a listening question is said in parts ("What letter makes the", then the sound): its opening part
const begun = (list, text) => list.some(t => t.length > 5 && text.startsWith(t));

// ---- Sentences ----
await openLesson('grade1', 'g1-rs-happy-pets');
let q = await question();
ok('Sentences, round 1: Luna says the instruction', count(await said(), q.instruction) === 1, q.instruction);
await forget();
let word = await tapWord();
await wait(800);
let heard = await said();
const bubble = await page.evaluate(n => document.body.innerText.includes(n), NUDGE);
ok('a word tapped before an answer isn\'t read: Luna says the nudge', heard.includes(NUDGE) && !heard.some(t => t.toLowerCase() === word.toLowerCase()) && bubble, `"${word}" → ${JSON.stringify(heard)}`);
await tapChoice(q.options.find(o => !o.right).label);
await wait(3000);
await forget();
word = await tapWord();
await wait(800);
heard = await said();
ok('after a wrong answer, the word is read', heard.some(t => t.toLowerCase() === word.toLowerCase()) && !heard.includes(NUDGE), `"${word}" → ${JSON.stringify(heard)}`);
let now = await round();
await tapChoice(q.options.find(o => o.right).label);
await nextRound(now);
await forget();
await wait(1500);
q = await question();
ok('round 2 starts quiet: no instruction', count(await said(), q.instruction) === 0, JSON.stringify(await said()));
await page.evaluate(p => [...document.querySelectorAll('[data-shot="stage"] button')].find(b => b.textContent.trim() === p)?.click(), q.prompt);
await wait(800);
ok('… and its speaker button still says it', count(await said(), q.instruction) === 1, JSON.stringify(await said()));

// ---- Little stories ----
await openLesson('grade1', 'g1-story-little');
q = await question();
ok('Little stories, round 1: the instruction', count(await said(), q.instruction) === 1, q.instruction);
await forget();
word = await tapWord();
await wait(800);
heard = await said();
ok('a story word tapped before an answer gets the nudge, not the word', heard.includes(NUDGE) && !heard.some(t => t.toLowerCase() === word.toLowerCase()), `"${word}" → ${JSON.stringify(heard)}`);

// ---- Read and Match ----
await openLesson('grade1', 'g1-bw-magic-e');
q = await question();
ok('Magic E, round 1: the instruction', count(await said(), q.instruction) === 1, q.instruction);
now = await round();
await tapChoice(q.options.find(o => o.right).label);
await nextRound(now);
await forget();
await wait(1500);
q = await question();
ok('Magic E, round 2: no instruction', count(await said(), q.instruction) === 0, JSON.stringify(await said()));

// ---- a listening lesson keeps its question every round ----
await openLesson('kindergarten', 'k-ms-m-s-b-t');
q = await question();
ok('Letter sounds, round 1: its question', begun(await said(), q.instruction), `${q.instruction} → ${JSON.stringify(await said())}`);
now = await round();
await tapChoice(q.options.find(o => o.right).label);
await nextRound(now);
await forget();
await wait(1500);
q = await question();
ok('Letter sounds, round 2: its question again', begun(await said(), q.instruction), `${q.instruction} → ${JSON.stringify(await said())}`);

ok('no error on the page', errors.length === 0, errors[0] ?? '');
await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
