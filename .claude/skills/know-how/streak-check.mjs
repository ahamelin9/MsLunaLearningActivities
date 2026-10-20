#!/usr/bin/env node
// The day streak counts the iPad's own days (BUG-12).
//
//   node .claude/skills/know-how/streak-check.mjs [port=5199]
//
// Needs Vite running on the port. In a Chrome set to New York time, with
// the page's clock set by hand, it records finished games through the app's
// own storage module and reads `streakDays`:
//   - 8 pm one evening, then 9 am the next morning: 2 days in a row (in UTC
//     both are the same date, so the old code counted 1);
//   - twice on one evening, 6 pm and 11 pm: still 1 (11 pm is already the
//     next UTC date, so the old code counted 2);
//   - a day skipped: back to 1.
// It fails on the commit before BUG-12.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.emulateTimezone('America/New_York');
// a clock the check can set: new Date() and Date.now() read window.__now when it is set
await page.evaluateOnNewDocument(() => {
  window.speechSynthesis.speak = () => {};
  const Real = Date;
  window.__now = null;
  class Clock extends Real {
    constructor(...a) { if (a.length === 0 && window.__now != null) super(window.__now); else super(...a); }
    static now() { return window.__now ?? Real.now(); }
  }
  window.Date = Clock;
});
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });

/** plays one game at a New York time ("2026-10-19T20:00") from a fresh save's history, returns the streak after each */
const streakAfter = times => page.evaluate(async list => {
  localStorage.clear();
  const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/storage.ts')) ?? '/src/utils/storage.ts';
  const { storageService } = await import(src);
  storageService.resetProgress?.();
  const out = [];
  for (const t of list) {
    // New York is UTC-4 in October
    window.__now = new Date(`${t}:00-04:00`).getTime();
    storageService.recordGameCompletion({ gameId: 'letter-jar', starsEarned: 1 });
    out.push(storageService.getProgress().streakDays);
  }
  window.__now = null;
  return out;
}, times);

const overnight = await streakAfter(['2026-10-19T20:00', '2026-10-20T09:00']);
ok('8 pm, then 9 am the next morning: 2 days in a row', overnight.at(-1) === 2, `streak ${overnight.join(' → ')}`);
const evening = await streakAfter(['2026-10-19T18:00', '2026-10-19T23:00']);
ok('6 pm and 11 pm the same evening: still 1 day', evening.at(-1) === 1, `streak ${evening.join(' → ')}`);
const skipped = await streakAfter(['2026-10-19T10:00', '2026-10-20T10:00', '2026-10-22T10:00']);
ok('two days in a row, then a day skipped: back to 1', skipped[1] === 2 && skipped[2] === 1, `streak ${skipped.join(' → ')}`);

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
