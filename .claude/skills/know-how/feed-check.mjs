#!/usr/bin/env node
// Feed Luna's three ways to feed (BUG-2): does one wrong tap count as one
// miss, and do a tap, a drag and the keyboard each still feed her?
//
//   node .claude/skills/know-how/feed-check.mjs [port=5199]
//
// Needs Vite running on the port. It reads the round's answer from the game's
// props (it's heard, never shown), counts misses by the shell's try-again
// sound (one per miss, GameShell's handleMiss), and checks:
//   - one wrong tap (a mouse press and release, which the browser also turns
//     into a click) is one miss;
//   - a wrong cookie chosen with the keyboard (Enter) is one miss;
//   - dragging the right cookie to her beak feeds her (the round is won);
//   - a tap on the right cookie feeds her too;
//   - a drag let go away from her beak feeds nothing (with pointer capture,
//     its release also fired a click, which fed her from anywhere).
// It fails on the commit before BUG-2's fix, where the tap's pointer-up fed
// the cookie and its click fed it again: two misses.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };
const COOKIE = `${at('stage')} button[aria-label^="letter"]`;

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });

async function open() {
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 820 });
  await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('grade-card'));
  await (await page.$$(at('grade-card')))[0].click();
  await page.waitForSelector(at('hub'));
  for (const t of await page.$$(at('game-tile'))) {
    if ((await t.evaluate(e => e.textContent)).includes('Feed Luna')) { await t.click(); break; }
  }
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(COOKIE);
  await wait(1500);
  // count misses by the shell's try-again sound
  await page.evaluate(async () => {
    const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/audio.ts')) ?? '/src/utils/audio.ts';
    const { soundManager } = await import(src);
    window.__misses = 0;
    const tryAgain = soundManager.playTryAgain.bind(soundManager);
    soundManager.playTryAgain = () => { window.__misses += 1; return tryAgain(); };
  });
  return page;
}

// the round's answer, from the game's props
const answerOf = page => page.evaluate(() => {
  const el = document.querySelector('[data-shot="stage"] button[aria-label^="letter"]');
  const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
  for (let f = el[key]; f; f = f.return) if (f.memoizedProps?.round?.answer) return f.memoizedProps.round.answer;
  return null;
});
const cookieFor = async (page, wanted) => {
  for (const c of await page.$$(COOKIE)) {
    const label = await c.evaluate(e => e.getAttribute('aria-label'));
    if (wanted(label.replace(/^letter /, ''))) return c;
  }
  return null;
};
const misses = page => page.evaluate(() => window.__misses);
const rounds = page => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label'));

// ---- a wrong tap ----
let page = await open();
let answer = await answerOf(page);
let wrong = await cookieFor(page, l => l !== answer);
let box = await wrong.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.up();
await wait(1500);
ok('one wrong tap is one miss', (await misses(page)) === 1, `${await misses(page)} miss(es)`);

// ---- a wrong cookie by keyboard ----
await wait(1200);
const before = await misses(page);
wrong = await cookieFor(page, l => l !== answer);
await wrong.focus();
await page.keyboard.press('Enter');
await wait(1500);
ok('a wrong cookie chosen with Enter is one miss', (await misses(page)) - before === 1, `${(await misses(page)) - before} miss(es)`);

// ---- a tap on the right one ----
let round = await rounds(page);
const right = await cookieFor(page, l => l === answer);
box = await right.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.up();
for (let i = 0; i < 30 && (await rounds(page)) === round; i++) await wait(300);
ok('a tap on the right cookie feeds her (the round moves on)', (await rounds(page)) !== round, `${round} → ${await rounds(page)}`);
await page.close();

// ---- a drag of the right one to her beak ----
page = await open();
answer = await answerOf(page);
round = await rounds(page);
const drag = await cookieFor(page, l => l === answer);
box = await drag.boundingBox();
const zone = await page.evaluate(() => {
  // the beak zone: the parent of the "drop here" span (the zone's own text is "drop here" too)
  const el = [...document.querySelectorAll('[data-shot="stage"] span[aria-hidden="true"]')].find(e => e.textContent.trim() === 'drop here')?.parentElement;
  const r = el?.getBoundingClientRect();
  return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null;
});
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
for (let s = 1; s <= 10; s++) {
  await page.mouse.move(box.x + box.width / 2 + ((zone.x - box.x - box.width / 2) * s) / 10, box.y + box.height / 2 + ((zone.y - box.y - box.height / 2) * s) / 10);
  await wait(30);
}
await page.mouse.up();
for (let i = 0; i < 30 && (await rounds(page)) === round; i++) await wait(300);
ok('dragging the right cookie to her beak feeds her', (await rounds(page)) !== round, `${round} → ${await rounds(page)}`);
ok('… and the drag counted no miss', (await misses(page)) === 0, `${await misses(page)} miss(es)`);
await page.close();

// ---- a drag let go far from her beak ----
page = await open();
answer = await answerOf(page);
round = await rounds(page);
const stray = await cookieFor(page, l => l !== answer);
box = await stray.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
for (let s = 1; s <= 10; s++) {
  await page.mouse.move(box.x + box.width / 2 + 20 * s, box.y + box.height / 2 + 12 * s);
  await wait(30);
}
await page.mouse.up();
await wait(1500);
ok('a wrong cookie dragged and let go away from her beak feeds nothing', (await misses(page)) === 0 && (await rounds(page)) === round, `${await misses(page)} miss(es)`);

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
