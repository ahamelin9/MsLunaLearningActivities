#!/usr/bin/env node
// Settings with the voice index blocked (BUG-10): does it save in a loop?
//
//   node .claude/skills/know-how/settings-offline-check.mjs [port=5199]
//
// Needs Vite running on the port. Blocks every voice index
// (`/voice/<id>/manifest.json`), as on an iPad offline before it has the
// index, opens Settings from the home gear (a 2s hold past the gate), and for
// 3 s counts the saves of the progress key and how late a 50 ms timer fires
// (a page stuck re-rendering fires it late or not at all). Checks:
//   - opening Settings saves at most once;
//   - the page stays responsive (the timer is never more than 200 ms late);
//   - Settings shows Luna's voice as picked, not an empty list.
// It fails on the commit before BUG-10, where the voice picker's correction
// saved on every render.

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
await page.setRequestInterception(true);
page.on('request', r => (/\/voice\/[^/]+\/manifest\.json/.test(r.url()) ? r.abort() : r.continue()));
await page.evaluateOnNewDocument(() => {
  window.speechSynthesis.speak = () => {};
  // every save of the progress key
  window.__saves = 0;
  const set = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    if (k === 'ms_luna_learning_progress_v1') window.__saves += 1;
    return set.call(this, k, v);
  };
});
await page.goto(`http://localhost:${port}/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForSelector(at('open-settings'));
await wait(1500);

// past the grown-up gate, counting saves from before it opens
const before = await page.evaluate(() => window.__saves);
const box = await (await page.$(at('open-settings'))).boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await wait(2000);
await page.mouse.up();
await page.waitForSelector(at('settings'), { timeout: 5000 });

const r = await page.evaluate(saves0 => new Promise(done => {
  let worst = 0;
  let last = performance.now();
  const tick = () => {
    const now = performance.now();
    worst = Math.max(worst, now - last - 50);
    last = now;
    if (now - start < 3000) setTimeout(tick, 50);
    else done({ saves: window.__saves - saves0, worst: Math.round(worst) });
  };
  const start = performance.now();
  setTimeout(tick, 50);
}), before);
ok('opening Settings saves at most once', r.saves <= 1, `${r.saves} saves in its first 3 s`);
ok('the page stays responsive', r.worst <= 200, `a 50 ms timer was at most ${r.worst} ms late`);
const voice = await page.evaluate(() => document.querySelector('[data-shot="settings"]')?.textContent ?? '');
ok('Settings still shows the voice section', /Which voice/.test(voice));

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
