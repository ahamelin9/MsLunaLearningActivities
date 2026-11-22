#!/usr/bin/env node
// Are a sounded-out word's sounds close enough to blend? (CUR-25)
//
//   node .claude/skills/know-how/blend-gap-check.mjs [port=5199] [--want=100]
//
// Needs Vite on the port. In a Kindergarten blend lesson (Short A Words) it
// taps "Hear the sounds in a row" and times each clip, muted: the wait from one
// sound's end to the next one's start should be about SOUND_GAP_MS (100 ms;
// it was 260 before CUR-25, so this fails on the code before). It also listens
// to the round's own line (Luna says /b/ /a/ /t/ in it) and fails any line
// that fell back to the browser voice.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';
import { lessonCard } from './library.mjs';

const port = process.argv.slice(2).find(a => /^\d+$/.test(a)) ?? '5199';
const want = Number(process.argv.find(a => a.startsWith('--want='))?.slice(7) ?? 100);
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
await page.evaluateOnNewDocument(() => {
  window.__browserSpoke = [];
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: { speak: u => window.__browserSpoke.push(u.text), cancel() {}, pause() {}, resume() {}, getVoices: () => [], addEventListener() {}, removeEventListener() {} }
  });
  // every clip that starts, when, and when it ends
  window.__plays = [];
  window.__clipWhat = new WeakMap();
  const start = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...a) {
    const rec = { what: window.__clipWhat.get(this.buffer) ?? '?', t0: performance.now(), end: null };
    window.__plays.push(rec);
    this.addEventListener('ended', () => (rec.end = rec.end ?? performance.now()));
    return start.apply(this, a);
  };
});
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[0].click();
await page.waitForSelector(at('hub'));
const index = await page.evaluate(async () => {
  const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
  const key = 'ms_luna_learning_progress_v1';
  const all = lessonsFor('kindergarten');
  const saved = JSON.parse(localStorage.getItem(key));
  saved.completedLessons = all.map(l => l.lesson.id);
  localStorage.setItem(key, JSON.stringify(saved));
  return all.findIndex(l => l.title === 'Short A Words');
});
// the save changed under the page: open it again, as a child would
await page.reload({ waitUntil: 'networkidle0' });
// each decoded clip carries what it is: a sound (/b/), a word or a line
await page.evaluate(async () => {
  const { pronunciation } = await import('/src/utils/pronunciation.ts');
  const fetchClip = pronunciation.fetchClip;
  pronunciation.fetchClip = async function (req) {
    const buffer = await fetchClip.call(this, req);
    if (buffer) window.__clipWhat.set(buffer, req.kind === 'sound' ? `/${req.value}/` : String(req.text));
    return buffer;
  };
});
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
const card = await lessonCard(page, index);
await card.evaluate(e => e.scrollIntoView({ block: 'center' }));
await card.click();
await page.waitForSelector(at('play'));
await page.click(at('play'));
await page.waitForSelector(at('stage'));

/** The clips since `from`, and the wait between each sound and the next. */
async function gaps(from) {
  const plays = await page.evaluate(m => window.__plays.filter(p => p.t0 >= m), from);
  const out = [];
  for (let i = 1; i < plays.length; i++) {
    const [a, b] = [plays[i - 1], plays[i]];
    if (/^\//.test(a.what) && /^\//.test(b.what) && a.end) out.push({ pair: `${a.what}→${b.what}`, ms: Math.round(b.t0 - a.end) });
  }
  return { plays: plays.map(p => p.what), out };
}
const near = ms => Math.abs(ms - want) <= 45;

// the round's own line: "Let's sound it out: /b/ /a/ /t/! Which picture matches?"
const start = await page.evaluate(() => performance.now() - 3000);
await wait(9000);
const line = await gaps(start);
ok(
  `the round's line: each sound starts about ${want} ms after the one before`,
  line.out.length >= 2 && line.out.every(g => near(g.ms)),
  line.out.map(g => `${g.pair} ${g.ms} ms`).join(', ') || line.plays.join(' · ')
);

// "Hear the sounds in a row"
const mark = await page.evaluate(() => performance.now());
await page.$$eval('button', bs => bs.find(b => /sounds in a row/i.test(b.textContent))?.click());
await wait(5000);
const row = await gaps(mark);
ok(
  `"Hear the sounds in a row": each sound starts about ${want} ms after the one before`,
  row.out.length >= 2 && row.out.every(g => near(g.ms)),
  row.out.map(g => `${g.pair} ${g.ms} ms`).join(', ') || row.plays.join(' · ')
);

const robot = await page.evaluate(() => window.__browserSpoke);
ok('every line played a clip, none the browser voice', robot.length === 0, robot.join(' | '));
await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
