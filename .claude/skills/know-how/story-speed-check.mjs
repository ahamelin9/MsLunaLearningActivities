#!/usr/bin/env node
// Story lessons at every voice speed (BUG-8): do a story's lines and words
// play the clips of the speed picked in Settings?
//
//   node .claude/skills/know-how/story-speed-check.mjs [port=5199]
//
// Needs Vite running on the port. For Beginner, Normal and Quick (Settings'
// voice speed: 0.75, 0.95, 1.15) it opens 2nd grade's first story lesson
// (the lessons before it marked done), taps a word, answers once so the
// lines can be heard, taps "Read this line", and logs the speed bucket of
// every clip asked for (pronunciation.say's request). It expects slow,
// normal and quick. It fails on the commit before BUG-8's fix, where the
// story's rate overrides (0.9, 0.85) always landed on normal.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const KEY = 'ms_luna_learning_progress_v1';
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });

for (const [speed, rate, bucket] of [['Beginner', 0.75, 'slow'], ['Normal', 0.95, 'normal'], ['Quick', 1.15, 'quick']]) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 820 });
  await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  // 2nd grade, every lesson before its first story done, and the speed set
  const story = await page.evaluate(async () => {
    const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
    const lessons = lessonsFor('grade2');
    const i = lessons.findIndex(l => l.makeRounds({}).some(q => q.type === 'story-read'));
    return { index: i, done: lessons.slice(0, i).map(l => l.lesson.id), count: lessons.length };
  });
  await page.evaluate((key, done, rate) => {
    localStorage.setItem(key, JSON.stringify({ selectedGrade: 'grade2', completedLessons: done, settings: { speechRate: rate } }));
  }, KEY, story.done, rate);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  await (await page.$$(at('lesson-tile')))[story.index].click();
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await wait(1500);
  // every clip asked for, with its speed bucket
  await page.evaluate(async () => {
    const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/pronunciation.ts')) ?? '/src/utils/pronunciation.ts';
    const { pronunciation } = await import(src);
    window.__asked = [];
    const say = pronunciation.say.bind(pronunciation);
    pronunciation.say = (req, text, o) => { window.__asked.push({ text: String(text), bucket: req.bucket }); return say(req, text, o); };
  });
  const asked = () => page.evaluate(() => window.__asked.splice(0));

  // a word in the story
  const word = (await page.$$(`${at('stage')} button:not([aria-label]):not([data-variant])`))[1];
  await word.click();
  await wait(800);
  const wordClips = await asked();
  // answer once (any answer), so the lines can be heard, then a line
  await (await page.$$(at('lesson-choice')))[0].click();
  await wait(4000);
  await asked();
  await page.click(`${at('stage')} button[aria-label="Read this line"]`);
  await wait(1200);
  const lineClips = await asked();

  ok(`${speed}: a tapped word plays the ${bucket} clip`, wordClips.length > 0 && wordClips.every(c => c.bucket === bucket), wordClips.map(c => `${c.text}:${c.bucket}`).join(', '));
  ok(`${speed}: a line plays the ${bucket} clip`, lineClips.length > 0 && lineClips.every(c => c.bucket === bucket), lineClips.map(c => `${c.text.slice(0, 24)}:${c.bucket}`).join(', '));
  await page.close();
}

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
