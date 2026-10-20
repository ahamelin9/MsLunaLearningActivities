#!/usr/bin/env node
// Shoots one lesson's first round, the ones `ui:shots` doesn't reach (it plays
// only Lesson 1), at 1180×820 and 744×1133, in light or dark (CUR-5).
//
//   node .claude/skills/know-how/lesson-shot.mjs <lesson number> <outPrefix> [light|dark] [grade 0|1|2]
//
// Needs Vite on 5199. Every lesson of the grade is marked done so the lesson
// is open (lessons open in order, PRG-7). Saves <outPrefix>-<width>-<theme>.png.
import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const [number, out, theme = 'light', grade = '0'] = process.argv.slice(2);
if (!number || !out) {
  console.error('usage: node .claude/skills/know-how/lesson-shot.mjs <lesson number> <outPrefix> [light|dark] [grade 0|1|2]');
  process.exit(1);
}
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
for (const [width, height] of [[1180, 820], [744, 1133]]) {
  await page.setViewport({ width, height });
  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.evaluate(async g => {
    const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
    const grades = ['kindergarten', 'grade1', 'grade2'];
    localStorage.clear();
    localStorage.setItem('ms_luna_learning_progress_v1', JSON.stringify({
      selectedGrade: grades[g],
      completedLessons: lessonsFor(grades[g]).map(l => l.lesson.id)
    }));
  }, Number(grade));
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  await wait(500);
  const tiles = await page.$$(at('lesson-tile'));
  await tiles[Number(number) - 1].click();
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('shell-play'));
  await wait(1200);
  await page.screenshot({ path: `${out}-${width}-${theme}.png` });
}
await browser.close();
console.log(`saved ${out}-{1180,744}-${theme}.png`);
