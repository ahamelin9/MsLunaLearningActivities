#!/usr/bin/env node
// Does every game and lesson, at every grade, say 20 on its bar? (CUR-15)
//
//   node .claude/skills/know-how/twenty-check.mjs [port=5199]
//
// Needs Vite running on the port. Opens each of the 8 games and every lesson at
// each grade, as a child would, and reads what the bar says at the first round
// ("Round 1 of 20"). It lists each one with its count and fails any under 20,
// since the teacher reads the bar as how many questions a play has.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';
import { lessonCard } from './library.mjs';

const port = process.argv.slice(2).find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const GRADES = ['kindergarten', 'grade1', 'grade2'];

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820, deviceScaleFactor: 1, hasTouch: true });
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });

/** A fresh save at this grade with every lesson open. */
const enter = async grade => {
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('grade-card'));
  await (await page.$$(at('grade-card')))[grade].click();
  await page.waitForSelector(at('hub'));
  await page.evaluate(async g => {
    const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
    const key = 'ms_luna_learning_progress_v1';
    const saved = JSON.parse(localStorage.getItem(key));
    saved.completedLessons = lessonsFor(g).map(l => l.lesson.id);
    localStorage.setItem(key, JSON.stringify(saved));
  }, GRADES[grade]);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  await wait(300);
};

/** What the bar says once the first round is up: "1 of 20" → 20. */
const barCount = async tile => {
  await tile.evaluate(e => e.scrollIntoView({ block: 'center' }));
  await tile.click();
  await page.waitForSelector(at('shell-intro'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await wait(600);
  const said = await page.evaluate(() => document.body.innerText.match(/Round\s+\d+\s+of\s+(\d+)/i)?.[0] ?? null);
  await page.click(at('shell-back'));
  await page.waitForSelector(at('hub'));
  await wait(150);
  return said;
};

const rows = [];
for (let grade = 0; grade < 3; grade++) {
  await enter(grade);
  const names = await page.$$eval(at('game-tile'), ts => ts.map(t => { const ls = t.innerText.split('\n'); return ls[ls.findIndex(l => /min$/.test(l)) - 1]; }));
  for (const [i, name] of names.entries()) {
    const said = await barCount((await page.$$(at('game-tile')))[i]);
    rows.push({ grade: GRADES[grade], what: `game · ${name}`, said });
  }
  const lessons = await page.evaluate(async g => (await import('/src/apps/reading/engine/lessons.ts')).lessonsFor(g).map(l => l.title), GRADES[grade]);
  for (const [i, title] of lessons.entries()) {
    const said = await barCount(await lessonCard(page, i));
    rows.push({ grade: GRADES[grade], what: `lesson ${i + 1} · ${title}`, said });
  }
}
await browser.close();

let failed = 0;
for (const r of rows) {
  const n = Number(r.said?.match(/of\s+(\d+)/i)?.[1] ?? 0);
  const ok = n >= 20;
  if (!ok) failed++;
  console.log(`${ok ? '✅' : '❌'} ${r.grade.padEnd(12)} ${r.what}: ${r.said ?? 'no "Round 1 of N" on screen'}`);
}
console.log(failed ? `\n❌ ${failed} of ${rows.length} say less than 20.` : `\n✅ all ${rows.length} say 20 or more.`);
process.exit(failed ? 1 : 0);
