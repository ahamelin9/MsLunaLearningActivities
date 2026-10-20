#!/usr/bin/env node
// Time moves the stars a little (PRG-10).
//
//   node .claude/skills/know-how/star-time-check.mjs [port=5199]
//   SHOT=<dir> THEME=dark WIDTH=744 node …   also saves the done screens it reaches
//
// Needs Vite running on the port. First the rule itself, from the page's own
// `engine/stars.ts`, at its edges. Then Lesson 1 played three times from a
// fresh save, each with one miss in round 1 (3 of 4 first try: 2 stars by
// PRG-1), with the clock moved on (`window.__skip`, as in time-check.mjs):
//   - fast (inside its "about N min"): 3 stars, "Quick and careful: a star!";
//   - normal (past it, under 3 times it): 2 stars, nothing said;
//   - very slow (over 3 times it): 1 star, "A very long time: one star less".
// The estimate stays the default for all three: it averages only from the
// third play on (PRG-6), and each is worked out before its own play.
// It fails on the commit before PRG-10, which had no time rule.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const shotDir = process.env.SHOT;
const theme = process.env.THEME === 'dark' ? 'dark' : 'light';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
// WIDTH=744 shoots a portrait iPad mini
const width = Number(process.env.WIDTH ?? 1180);
await page.setViewport(width < 1000 ? { width, height: 1133 } : { width, height: 820 });
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
await page.evaluateOnNewDocument(() => {
  window.speechSynthesis.speak = () => {};
  window.__skip = 0;
  const realNow = Date.now.bind(Date);
  Date.now = () => realNow() + window.__skip;
});
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });

// ---- the rule at its edges ----
const rule = await page.evaluate(async () => {
  const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/apps/reading/engine/stars.ts')) ?? '/src/apps/reading/engine/stars.ts';
  const { starsWithTime } = await import(src);
  const cases = [
    [2, 240, 4, 3, 'quick'], // 4 min, about 4: inside
    [2, 270, 4, 2, null], // 4.5 min rounds to 5: past it
    [3, 30, 4, 3, null], // 3 stays 3
    [1, 30, 4, 1, null], // quick lifts only a 2
    [3, 721, 4, 2, 'slow'], // over 12 min
    [2, 720, 4, 2, null], // exactly 3 times: not over
    [1, 3000, 4, 1, null] // never below 1
  ];
  return cases.map(([stars, seconds, est, want, time]) => {
    const got = starsWithTime(stars, seconds, est);
    return { pass: got.stars === want && got.time === time, line: `${stars}★ ${seconds}s/${est}min → ${got.stars}★ ${got.time}` };
  });
});
ok('the rule at its edges', rule.every(r => r.pass), rule.filter(r => !r.pass).map(r => r.line).join('; ') || `${rule.length} cases`);

// ---- three plays of Lesson 1 ----
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[0].click();
await page.waitForSelector(at('hub'));
await wait(600);

const round = () => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null);
const answers = () => page.evaluate(() => {
  const el = document.querySelector('[data-shot="lesson-choice"]');
  const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
  for (let f = el[key]; f; f = f.return) {
    const list = f.memoizedProps?.question?.options;
    if (Array.isArray(list)) {
      const label = o => (o.letter ? `letter ${o.letter}` : o.text ?? o.word);
      return { right: label(list.find(x => x.isCorrect ?? x.isRhyme)), wrong: label(list.find(x => !(x.isCorrect ?? x.isRhyme))) };
    }
  }
  return null;
});
const tap = l => page.evaluate(l => [...document.querySelectorAll('[data-shot="lesson-choice"]')].find(e => (e.getAttribute('aria-label') ?? e.textContent).trim() === l)?.click(), l);

const play = async (skipMinutes, name) => {
  await (await page.$$(at('lesson-tile')))[0].click();
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('lesson-choice'));
  await page.evaluate(m => { window.__skip += m * 60000; }, skipMinutes);
  for (let r = 0; r < 12 && !(await page.$(at('shell-reward'))); r++) {
    await page.waitForSelector(at('lesson-choice'));
    await wait(800);
    const now = await round();
    const a = await answers();
    if (r === 0) { await tap(a.wrong); await wait(2500); } // one miss: 3 of 4 first try
    await tap(a.right);
    for (let t = 0; t < 80 && !(await page.$(at('shell-reward'))) && (await round()) === now; t++) await wait(200);
  }
  await page.waitForSelector(at('done-time'), { timeout: 20000 });
  await wait(1500);
  const done = await page.evaluate(() => ({
    stars: Number(document.querySelector('[aria-label$="of 3 stars"]')?.getAttribute('aria-label').match(/^(\d)/)?.[1] ?? NaN),
    firstTry: document.querySelector('[data-shot="shell-reward"]')?.innerText.match(/(\d+) of (\d+) first try/)?.[0] ?? '',
    said: document.querySelector('[data-shot="done-time-star"]')?.innerText.trim() ?? '',
    estimate: document.querySelector('[data-shot="done-time"]')?.innerText.match(/about (\d+) min/)?.[1] ?? ''
  }));
  if (shotDir) await page.screenshot({ path: `${shotDir}/done-${name}-${theme}-${width}.png` });
  await wait(3000);
  await page.click(at('shell-back'));
  await page.waitForSelector(at('hub'));
  await wait(600);
  return done;
};

let d = await play(0, 'fast');
ok('fast: 3 stars, "Quick and careful: a star!"', d.firstTry === '3 of 4 first try' && d.stars === 3 && d.said === 'Quick and careful: a star!', JSON.stringify(d));
d = await play(6, 'normal');
ok('normal: 2 stars, nothing said', d.firstTry === '3 of 4 first try' && d.stars === 2 && d.said === '', JSON.stringify(d));
d = await play(13, 'slow');
ok('very slow: 1 star, "A very long time: one star less"', d.firstTry === '3 of 4 first try' && d.stars === 1 && d.said === 'A very long time: one star less', JSON.stringify(d));

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
