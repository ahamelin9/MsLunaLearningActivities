// Does the app still work offline? (DES-4) Blocks every request that leaves this
// machine, loads the app, plays into the first game, and reports the font faces
// that loaded, the font the game letters use, and anything it tried to fetch
// from outside. Writes a crop of two letter tiles set to "I" and "l".
//
//   node --input-type=module -e "$(cat .claude/skills/know-how/offline-check.mjs)" <out.png>
//
// Run from the repo root (it starts its own Vite). Under -e the first argument
// is process.argv[1].

import { createRequire } from 'node:module';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { createServer } from 'vite';
// Under -e there's no file to be relative to, so the helper is found from the repo root
const { chromePath } = createRequire(join(process.cwd(), 'package.json'))('./scripts/chrome-path.cjs');
const out = process.argv[1];
const server = await createServer({ root: process.cwd(), logLevel: 'error', server: { open: false } });
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
await page.setRequestInterception(true);
const blocked = [];
page.on('request', r => { if (new URL(r.url()).hostname !== 'localhost') { blocked.push(r.url()); r.abort(); } else r.continue(); });
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(url, { waitUntil: 'networkidle0' });
const fontsOf = () => page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter(f => f.status === 'loaded').map(f => `${f.family.replace(/"/g, '')} ${f.weight}`); });
const usedFont = sel => page.evaluate(s => { const e = document.querySelector(s); return e ? getComputedStyle(e).fontFamily : 'missing'; }, sel);
const click = async sel => { await page.waitForSelector(sel); await page.click(sel); await new Promise(r => setTimeout(r, 900)); };
console.log('home: icon label', await page.evaluate(() => { const e = [...document.querySelectorAll('*')].find(x => x.children.length === 0 && x.textContent.trim() === 'Reading'); return e ? getComputedStyle(e).fontFamily : 'missing'; }));
await click('[data-shot="open-reading"]');
await click('[data-shot="grade-card"]');
await click('[data-shot="game-tile"]');
await click('[data-shot="play"]');
await new Promise(r => setTimeout(r, 1500));
// the game's letters: short text drawn big
const letters = await page.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /^[A-Za-z]{1,2}$/.test(e.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) >= 28).map(e => `${e.textContent.trim()}:${getComputedStyle(e).fontFamily.split(',')[0]}`).slice(0, 8));
console.log('game letters:', letters.join(' '));
// put I and l on two of those tiles and photograph them
const box = await page.evaluate(() => {
  const tiles = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /^[A-Za-z]{1,2}$/.test(e.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) >= 28);
  if (tiles.length < 2) return null;
  tiles[0].textContent = 'I'; tiles[1].textContent = 'l';
  const rects = tiles.slice(0, 2).map(t => (t.parentElement ?? t).getBoundingClientRect());
  const x = Math.min(...rects.map(r => r.left)) - 10, y = Math.min(...rects.map(r => r.top)) - 10;
  return { x, y, width: Math.max(...rects.map(r => r.right)) - x + 10, height: Math.max(...rects.map(r => r.bottom)) - y + 10 };
});
if (box) await page.screenshot({ path: out, clip: box });
console.log('loaded font faces:', (await fontsOf()).join(', '));
console.log('blocked requests:', blocked.length ? blocked.join(' ') : 'none');
await browser.close(); await server.close(); process.exit(0);
