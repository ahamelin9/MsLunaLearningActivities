// Every lesson's first question at one grade, for review sheets (DES-23):
// ui:shots reaches only Lesson 1. Marks the grade's lessons done so each
// opens, as layout-audit.mjs does. From the repo root, with Vite on the port:
//   node .claude/skills/know-how/lesson-shot.mjs 5199 screenshots/lessons light 1180x820 2
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
const require = createRequire(join(process.cwd(), 'package.json'));
const puppeteer = require('puppeteer-core');
const { chromePath } = require('./scripts/chrome-path.cjs');
const [port = '5198', outDir = 'screenshots/lessons', theme = 'light', size = '1180x820', grade = '0'] = process.argv.slice(2);
const [W, H] = size.split('x').map(Number);
mkdirSync(outDir, { recursive: true });
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H });
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[Number(grade)].click();
await page.waitForSelector(at('hub'));
await page.evaluate(async g => {
  const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
  const key = 'ms_luna_learning_progress_v1';
  const saved = JSON.parse(localStorage.getItem(key));
  saved.completedLessons = lessonsFor(['kindergarten', 'grade1', 'grade2'][g]).map(l => l.lesson.id);
  localStorage.setItem(key, JSON.stringify(saved));
}, Number(grade));
const into = async () => {
  await page.reload({ waitUntil: 'networkidle0' });
  await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  await wait(400);
};
await into();
const count = (await page.$$(at('lesson-tile'))).length;
for (let i = 0; i < count; i++) {
  if (i) await into();
  await (await page.$$(at('lesson-tile')))[i].click();
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await wait(1800);
  const file = join(outDir, `g${grade}-lesson${i + 1}-${theme}-${size}.png`);
  await page.screenshot({ path: file });
  console.log(file);
}
await browser.close();
