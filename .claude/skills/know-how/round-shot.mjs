#!/usr/bin/env node
// A shot of one game's or lesson's first round, at a grade, light or dark,
// for a review sheet (ui:shots only reaches Kindergarten's first lesson).
//
//   node .claude/skills/know-how/round-shot.mjs <port> <grade 0|1|2> <game|lesson> "<title part>" <out.png> [--dark] [--wait=ms]
//
// Needs Vite on the port. Every lesson is opened first, so any can be played.
// The title part matches a game tile's text or a lesson's title.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';
import { lessonCard } from './library.mjs';

const [port, grade, kind, title, out] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const dark = process.argv.includes('--dark');
const settle = Number(process.argv.find(a => a.startsWith('--wait='))?.slice(7) ?? 1500);
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const g = ['kindergarten', 'grade1', 'grade2'][Number(grade)];

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820, deviceScaleFactor: 1, hasTouch: true });
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }]);
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[Number(grade)].click();
await page.waitForSelector(at('hub'));
const titles = await page.evaluate(async g => {
  const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
  const key = 'ms_luna_learning_progress_v1';
  const saved = JSON.parse(localStorage.getItem(key));
  saved.completedLessons = lessonsFor(g).map(l => l.lesson.id);
  localStorage.setItem(key, JSON.stringify(saved));
  return lessonsFor(g).map(l => l.title);
}, g);
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await wait(300);

let tile;
if (kind === 'lesson') {
  const i = titles.findIndex(t => t.includes(title));
  if (i < 0) throw new Error(`no lesson "${title}" at ${g}: ${titles.join(', ')}`);
  tile = await lessonCard(page, i);
} else {
  for (const t of await page.$$(at('game-tile'))) if ((await t.evaluate(e => e.textContent)).includes(title)) tile = t;
  if (!tile) throw new Error(`no game "${title}" at ${g}`);
}
await tile.evaluate(e => e.scrollIntoView({ block: 'center' }));
await tile.click();
await page.waitForSelector(at('play'));
await page.click(at('play'));
await page.waitForSelector(at('stage'));
await wait(settle);
await page.screenshot({ path: out });
await browser.close();
console.log(out);
