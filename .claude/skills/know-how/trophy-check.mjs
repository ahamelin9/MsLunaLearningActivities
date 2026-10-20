#!/usr/bin/env node
// The secret trophy for a full squishy shelf (PRG-4).
//
//   node .claude/skills/know-how/trophy-check.mjs [port=5199]
//   SHOT=<dir> THEME=dark node …   also saves the moon's visit and the Trophy room
//
// Needs Vite running on the port. From a save at Kindergarten with 7 of the 8
// kinds on the shelf (the bear missing):
//   - the Trophy room doesn't show the trophy, and the shelf hints at it only
//     with the "?" at the top of its arch;
//   - Letter Cookies (whose squishy is the bear) brings the last one: the
//     milestone moon visits, saying a full-shelf line, and Luna then says the
//     secret-trophy line;
//   - the Trophy room shows "Squishy Champion" won, and still does after a
//     reload;
//   - the next game finished doesn't bring the moon for the shelf again.
// It fails on the commit before PRG-4.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const shotDir = process.env.SHOT;
const theme = process.env.THEME === 'dark' ? 'dark' : 'light';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const KEY = 'ms_luna_learning_progress_v1';
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(key => {
  localStorage.clear();
  localStorage.setItem(key, JSON.stringify({
    selectedGrade: 'kindergarten',
    stickers: ['ball:oat', 'cat:caramel', 'bunny:cream', 'butter:cream', 'peach:oat', 'cloud:cream', 'moon:oat']
  }));
}, KEY);
await page.reload({ waitUntil: 'networkidle0' });

/** every line said, from the page's own speech module */
const hookSpeech = () => page.evaluate(async () => {
  const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/pronunciation.ts')) ?? '/src/utils/pronunciation.ts';
  const { pronunciation } = await import(src);
  window.__said = window.__said ?? [];
  if (pronunciation.__hooked) return;
  pronunciation.__hooked = true;
  const say = pronunciation.say.bind(pronunciation);
  pronunciation.say = (req, text, o) => { window.__said.push(String(text)); return say(req, text, o); };
});
const lines = () => page.evaluate(async () => {
  const sq = await import('/src/apps/reading/engine/squishies.ts');
  const luna = await import('/src/apps/reading/engine/luna.ts');
  return { full: sq.SHELF_LINES.full, moon: (luna.MOON.fullShelf ?? []).map(l => l.text) };
});
const badges = async shot => {
  await page.click(at('open-trophies'));
  await page.waitForSelector(at('trophies'));
  await wait(400);
  if (shotDir && shot) await page.screenshot({ path: `${shotDir}/${shot}-${theme}.png` });
  const titles = await page.$eval(at('trophies'), m => m.innerText);
  await page.click(at('modal-close'));
  await wait(400);
  return titles;
};
const round = () => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null);
const playCookies = async () => {
  for (const t of await page.$$(at('game-tile'))) if ((await t.evaluate(e => e.textContent)).includes('Letter Cookies')) { await t.click(); break; }
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  for (let r = 0; r < 8 && !(await page.$(at('shell-reward'))); r++) {
    await page.waitForSelector(at('cookie'));
    await wait(1000);
    const now = await round();
    const answer = await page.evaluate(() => {
      const el = document.querySelector('[data-shot="cookie"]');
      const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
      for (let f = el[key]; f; f = f.return) if (f.memoizedProps?.round?.answer) return f.memoizedProps.round.answer;
      return null;
    });
    await page.evaluate(a => document.querySelector(`[data-shot="cookie"][aria-label="letter ${a}"]`)?.click(), answer);
    for (let t = 0; t < 80 && !(await page.$(at('shell-reward'))) && (await round()) === now; t++) await wait(200);
  }
  await page.waitForSelector(at('shell-reward'), { timeout: 20000 });
};
/** samples the done screen for the moon, and gathers what's said, for a while */
const watchDone = async (ms, shot) => {
  let moon = false;
  for (let t = 0; t < ms; t += 100) {
    if (!moon && (await page.$(at('moon-visit'))) && shotDir && shot) {
      await wait(1200);
      await page.screenshot({ path: `${shotDir}/${shot}-${theme}.png` });
    }
    if (await page.$(at('moon-visit'))) moon = true;
    await wait(100);
  }
  return { moon, said: await page.evaluate(() => window.__said.slice()) };
};

await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await wait(600);
await hookSpeech();
const L = await lines();

let room = await badges();
ok('with one kind missing, the Trophy room shows no secret trophy', !/Squishy Champion/.test(room), room.includes('Badges') ? 'not there' : room.slice(0, 80));
await page.click(at('open-shelf'));
await page.waitForSelector(at('shelf'));
const hint = await page.$eval(at('shelf'), s => s.innerText);
ok('… and the shelf hints at it only with the "?" on top', !/trophy|champion/i.test(hint));
await page.click(at('shell-back'));
await page.waitForSelector(at('hub'));
await wait(600);

// ---- the last kind ----
await page.evaluate(() => { window.__said = []; });
await playCookies();
let done = await watchDone(14000, 'full-shelf-done');
ok('the last kind brings the milestone moon, with a full-shelf line', done.moon && L.moon.some(l => done.said.includes(l)), done.said.join(' | '));
ok('… and Luna says the secret-trophy line', done.said.includes(L.full));
await page.click(at('shell-back'));
await page.waitForSelector(at('hub'));
await wait(600);
room = await badges('trophy-room');
ok('the Trophy room shows "Squishy Champion", won', /Squishy Champion/.test(room));

await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await wait(600);
await hookSpeech();
room = await badges();
ok('… and still does after a reload', /Squishy Champion/.test(room));

// ---- the next game: no shelf visit again ----
await page.evaluate(() => { window.__said = []; });
await playCookies();
done = await watchDone(8000);
ok('the next game doesn\'t bring the moon for the shelf again', !L.moon.some(l => done.said.includes(l)) && !done.said.includes(L.full), done.said.join(' | '));

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
