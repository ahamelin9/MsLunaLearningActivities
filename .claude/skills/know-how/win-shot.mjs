// A won round, shot just after the win (DES-11), for review sheets: ui:shots
// never wins one. Feed Luna at Kindergarten, cookies tried in turn until the
// stage's flash says "win", then shots 350, 900, 1500 and 2300ms after it
// (the last one in the next round). With DONE=1 it wins the other rounds too
// and shoots the done screen as its petals fall. From the repo root, with
// Vite on the port:
//   node .claude/skills/know-how/win-shot.mjs 5199 screenshots/win light 1180x820
//   DONE=1 node .claude/skills/know-how/win-shot.mjs 5199 screenshots/win dark 1024x768
// Another game needs its own way to find its pieces (the cookie selector below).
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

const require = createRequire(join(process.cwd(), 'package.json'));
const puppeteer = require('puppeteer-core');
const { chromePath } = require('./scripts/chrome-path.cjs');

const [port = '5199', outDir = 'screenshots/win', theme = 'light', size = '1180x820'] = process.argv.slice(2);
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
await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);

await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await page.click(at('grade-card'));
await page.waitForSelector(at('hub'));
for (const t of await page.$$(at('game-tile'))) {
  if ((await t.evaluate(e => e.textContent)).includes('Feed Luna')) { await t.click(); break; }
}
await page.waitForSelector(at('play'));
await page.click(at('play'));
await page.waitForSelector(at('stage'));
await wait(2500);

const flash = () => page.evaluate(() => document.querySelector('[data-shot="stage"]')?.getAttribute('data-flash'));
let won = false;
for (let tries = 0; tries < 8 && !won; tries++) {
  const cookies = await page.$$('[data-shot="stage"] button[aria-label^="letter"]');
  const c = cookies[tries % Math.max(1, cookies.length)];
  if (!c) { await wait(500); continue; }
  await c.click();
  for (let t = 0; t < 20; t++) {
    const f = await flash();
    if (f === 'win') { won = true; break; }
    if (f === 'miss') break;
    await wait(25);
  }
  if (!won) await wait(800);
}
if (!won) { console.log('never won a round'); await browser.close(); process.exit(1); }
const t0 = Date.now();
for (const ms of [350, 900, 1500, 2300]) {
  await wait(Math.max(0, ms - (Date.now() - t0)));
  const file = join(outDir, `win-${theme}-${size}-${ms}ms.png`);
  await page.screenshot({ path: file });
  console.log(file);
}

// DONE=1: win the other rounds too, then shoot the done screen as its petals fall
if (process.env.DONE) {
  for (let tries = 0; tries < 60; tries++) {
    if (await page.$(at('shell-reward'))) break;
    const cookies = await page.$$('[data-shot="stage"] button[aria-label^="letter"]');
    const c = cookies[tries % Math.max(1, cookies.length)];
    if (c && (await flash()) !== 'win') await c.click().catch(() => {});
    await wait(700);
  }
  await page.waitForSelector(at('shell-reward'));
  const d0 = Date.now();
  for (const ms of [600, 1800, 2600]) {
    await wait(Math.max(0, ms - (Date.now() - d0)));
    const file = join(outDir, `done-${theme}-${size}-${ms}ms.png`);
    await page.screenshot({ path: file });
    console.log(file);
  }
}
await browser.close();
