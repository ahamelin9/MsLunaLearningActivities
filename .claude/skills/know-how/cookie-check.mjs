#!/usr/bin/env node
// Letter Cookies' cookies (DES-14): does every round mix different cookies,
// and does every letter still read at the answer size?
//
//   node .claude/skills/know-how/cookie-check.mjs [port=5199]
//
// Needs Vite running on the port. At each grade it plays Letter Cookies through,
// trying the cookies in turn until the round moves on (the target is heard,
// never shown, so it can't be read first), and for each round's plate checks:
//   - at least two different chip layouts (`data-chips`), and no two neighbours alike;
//   - every letter at least 32px (the answer-word minimum, foundations.md) in
//     --illo-cookie-letter.
// It fails on the commit before DES-14, where every cookie had the same chips.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const COOKIE = `${at('stage')} button[aria-label^="letter"]`;

for (const grade of [0, 1, 2]) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 820 });
  await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('grade-card'));
  await (await page.$$(at('grade-card')))[grade].click();
  await page.waitForSelector(at('hub'));
  for (const t of await page.$$(at('game-tile'))) {
    if ((await t.evaluate(e => e.textContent)).includes('Letter Cookies')) { await t.click(); break; }
  }
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));

  const plates = [];
  for (let r = 0; r < 12 && !(await page.$(at('shell-reward'))); r++) {
    await page.waitForSelector(COOKIE, { timeout: 8000 }).catch(() => {});
    await wait(800);
    const plate = await page.$$eval(COOKIE, els => els.map(el => {
      const ch = el.querySelector('span');
      const probe = document.createElement('span');
      probe.style.color = 'var(--illo-cookie-letter)';
      document.body.append(probe);
      const ink = getComputedStyle(probe).color;
      probe.remove();
      return {
        kind: el.getAttribute('data-chips'),
        size: parseFloat(getComputedStyle(ch).fontSize),
        inked: getComputedStyle(ch).color === ink
      };
    }));
    if (!plate.length) break;
    plates.push(plate);
    // feed the cookies in turn until the round moves on
    const before = await page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label'));
    for (let i = 0; i < plate.length; i++) {
      const c = (await page.$$(COOKIE))[i];
      if (!c) break;
      await c.click().catch(() => {});
      await wait(1500);
      const now = await page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label'));
      if (now !== before || (await page.$(at('shell-reward')))) break;
    }
    await wait(1500);
  }

  const name = ['K', '1st', '2nd'][grade];
  const kinds = plates.map(p => p.map(c => c.kind));
  ok(`${name}: every round mixes at least two chip layouts`, plates.length > 0 && kinds.every(k => new Set(k).size >= 2), kinds.map(k => k.join('/')).join(' · '));
  ok(`${name}: no two neighbours alike`, kinds.every(k => k.every((x, i) => i === 0 || x !== k[i - 1])));
  const letters = plates.flat();
  ok(`${name}: every letter at least 32px, in the cookie's letter colour`, letters.every(c => c.size >= 32 && c.inked), `${Math.min(...letters.map(c => c.size))}px smallest`);
  await page.close();
}

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
