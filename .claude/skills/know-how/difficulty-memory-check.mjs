#!/usr/bin/env node
// A game remembers its dial (LVL-2): reopening a game pre-selects the
// difficulty last picked for it, after a reload too, and only for that game.
//
//   node .claude/skills/know-how/difficulty-memory-check.mjs [port=5199]
//
// Needs Vite running on the port. At kindergarten it opens The Letter Jar
// (expects "Just right"), picks "Tricky", goes back, reopens it, reloads and
// reopens it again, and opens Feed Luna (expects "Just right"). It fails on
// the commit before LVL-2, where every game opened on "Just right".

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
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

const open = async title => {
  await page.waitForSelector(at('game-tile'));
  for (const t of await page.$$(at('game-tile'))) {
    if ((await t.evaluate(e => e.textContent)).includes(title)) { await t.click(); break; }
  }
  await page.waitForSelector(at('play'));
  await wait(300);
};
const picked = () => page.$eval('[role="group"][aria-label="Choose how tricky"] [aria-pressed="true"]', el => el.textContent.trim());
const back = async () => {
  await page.click(at('shell-back'));
  await page.waitForSelector(at('hub'));
  await wait(400);
};

await open('Letter Jar');
ok('a game first opens on "Just right"', (await picked()) === 'Just right', await picked());
await page.evaluate(() => [...document.querySelectorAll('[role="group"][aria-label="Choose how tricky"] button')].find(b => b.textContent.trim() === 'Tricky').click());
await wait(300);
await back();
await open('Letter Jar');
ok('reopened, it pre-selects "Tricky", the last picked', (await picked()) === 'Tricky', await picked());
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await open('Letter Jar');
ok('… after a reload too', (await picked()) === 'Tricky', await picked());
await back();
await open('Feed Luna');
ok('another game still opens on "Just right"', (await picked()) === 'Just right', await picked());

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
