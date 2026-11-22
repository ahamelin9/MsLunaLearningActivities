#!/usr/bin/env node
// Are a sentence's words spaced like a book, each still a 48px target? (CUR-26)
//
//   node .claude/skills/know-how/word-space-check.mjs [port=5199]
//
// Needs Vite on the port. Opens 1st grade's Animal Action Sentences and
// Little Stories (the sentence and story lessons, whose words are tapped one
// by one) and, on every line, measures the space between each word and the
// next on the same row (letter to letter): they should all be the same, about a space wide
// (before CUR-26 a short word sat in a 48px box, so "a" had wide gaps). Then
// it checks every word's tap area: at least 48px wide, and a tap at the
// word's middle, and 23px either side of the middle of a short word, lands
// on a word, the word itself at its middle.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';
import { lessonCard } from './library.mjs';

const port = process.argv.slice(2).find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? '✅' : '❌'} ${name}${detail !== '' ? `  (${detail})` : ''}`);
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
await (await page.$$(at('grade-card')))[1].click();
await page.waitForSelector(at('hub'));
const titles = await page.evaluate(async () => {
  const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
  const key = 'ms_luna_learning_progress_v1';
  const saved = JSON.parse(localStorage.getItem(key));
  saved.completedLessons = lessonsFor('grade1').map(l => l.lesson.id);
  localStorage.setItem(key, JSON.stringify(saved));
  return lessonsFor('grade1').map(l => l.title);
});
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));

for (const title of ['Animal Action Sentences', 'Little Stories']) {
  const card = await lessonCard(page, titles.indexOf(title));
  await card.evaluate(e => e.scrollIntoView({ block: 'center' }));
  await card.click();
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await wait(1200);
  const m = await page.evaluate(() => {
    const lines = [...document.querySelectorAll('[data-shot="stage"] [class*="sentence"]')].filter(l => l.querySelector('button'));
    const gaps = [];
    const targets = [];
    for (const line of lines) {
      const words = [...line.querySelectorAll(':scope > button')];
      const boxes = words.map(w => w.getBoundingClientRect());
      // the ink, not the box: a word's padding is inside its box
      const ink = words.map(w => {
        const r = document.createRange();
        r.selectNodeContents(w);
        return r.getBoundingClientRect();
      });
      for (let i = 1; i < boxes.length; i++) {
        // the next word on the same row
        if (Math.abs(boxes[i].top - boxes[i - 1].top) < 4) gaps.push({ between: `${words[i - 1].textContent} ${words[i].textContent}`, px: Math.round(ink[i].left - ink[i - 1].right) });
      }
      words.forEach((w, i) => {
        const b = boxes[i];
        const area = parseFloat(getComputedStyle(w, '::before').width);
        const y = b.top + b.height / 2;
        const mid = document.elementFromPoint(b.left + b.width / 2, y);
        const sides = b.width < 48 ? [-23, 23].map(dx => document.elementFromPoint(b.left + b.width / 2 + dx, y)?.closest('button')) : [];
        targets.push({
          word: w.textContent,
          width: Math.round(b.width),
          area: Math.round(area),
          mid: mid?.closest('button') === w,
          sides: sides.every(s => s && s.parentElement === line)
        });
      });
    }
    // a space in the reading type, for comparison
    const probe = document.createElement('span');
    probe.style.font = getComputedStyle(lines[0]).font;
    probe.style.position = 'absolute';
    probe.style.whiteSpace = 'pre';
    probe.textContent = ' ';
    document.body.append(probe);
    const space = probe.getBoundingClientRect().width;
    probe.remove();
    return { gaps, targets, space: Math.round(space * 10) / 10 };
  });
  const px = m.gaps.map(g => g.px);
  const spread = Math.max(...px) - Math.min(...px);
  ok(
    `${title}: every space between words is the same (within 1px)`,
    px.length > 2 && spread <= 1,
    `${Math.min(...px)}–${Math.max(...px)} px over ${px.length} spaces; widest: ${m.gaps.sort((a, b) => b.px - a.px)[0]?.between}`
  );
  ok(`… about a space wide (a space is ${m.space} px)`, px.every(p => p >= m.space * 0.8 && p <= m.space * 2.5), `${Math.max(...px)} px at most`);
  const small = m.targets.filter(t => Math.max(t.width, t.area) < 48);
  ok('… every word has a tap area of 48px or more', m.targets.length > 0 && small.length === 0, small.map(t => `${t.word} ${t.width}/${t.area}`).join(', '));
  const missed = m.targets.filter(t => !t.mid || !t.sides);
  ok('… a tap on a word is that word, and beside a short one lands on a word', missed.length === 0, missed.map(t => t.word).join(', ') || `${m.targets.length} words`);
  await page.click(at('shell-back'));
  await page.waitForSelector(at('hub'));
  await wait(200);
}

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
