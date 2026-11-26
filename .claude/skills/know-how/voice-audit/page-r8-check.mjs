// Round 8 on a local copy of the Sound Check page (after page-r8.py): opens
// on round 8, each group shows its cards, every clip is there, a pick and
// "B on the rest" count, the group plays in a row, rounds 6 and 7 still
// draw, and nothing overflows the width.
//   node .claude/skills/know-how/voice-audit/page-r8-check.mjs <repo> <pagedir> [width]
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const [repo, dir] = process.argv.slice(2);
const width = Number(process.argv[4] || 1000);
const require = createRequire(join(repo, 'package.json'));
const puppeteer = require('puppeteer-core');
const { chromePath } = require(join(repo, 'scripts/chrome-path.cjs'));
const server = createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const p = join(dir, u === '/' ? 'index.html' : u);
  if (!existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : 'application/json' });
  res.end(readFileSync(p));
}).listen(0);
// the group bars redraw whenever a count changes, so click by selector inside the page
const tap = sel => page.evaluate(sel => document.querySelector(sel).click(), sel);
const ok = (n, pass, d = '') => { console.log(`${pass ? '✅' : '❌'} ${n}${d ? `  (${d})` : ''}`); if (!pass) process.exitCode = 1; };
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width, height: 900 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(`http://localhost:${server.address().port}/`, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));
ok('opens on round 8', (await page.$eval('.tab[aria-selected="true"]', e => e.dataset.tab)) === 'r8');
const groups = await page.evaluate(() => R8_GROUPS.map(([g]) => g));
let shown = 0;
for (const g of groups) {
  await tap(`#r8-groups [data-r8group="${g}"]`);
  const [n, want] = await page.evaluate(g => [document.querySelectorAll('#r8 article.card').length, R8.filter(c => c.group === g).length], g);
  shown += n;
  if (n !== want) ok(`group ${g} shows its cards`, false, `${n}/${want}`);
}
const total = await page.evaluate(() => R8.length);
ok('every card shows in its group', shown === total, `${shown}/${total}`);
const missing = await page.evaluate(() => R8.flatMap(c => c.takes.map(([id]) => `r8:${c.sid}:${id}`)).filter(id => !AUDIO_R8?.[id]));
ok('every clip is there', missing.length === 0, missing.slice(0, 5).join(', '));
await tap('#r8-groups [data-r8group="short"]');
const dur = await page.evaluate(async () => {
  const a = new Audio(clip(document.querySelector('#r8 [data-clip]').dataset.clip));
  return new Promise(r => { a.onloadedmetadata = () => r(a.duration); a.onerror = () => r(-1); });
});
ok('a clip decodes', dur > 0, `${dur.toFixed(2)} s`);
await page.click('#r8 article.card:first-of-type .pick');
ok('a pick counts on the tab', (await page.$eval('#c-r8', e => e.textContent)) === `1/${total}`);
await page.click('#r8 [data-r8rest="short"]');
const [shortDone, shortAll, firstChoice] = await page.evaluate(() => [R8.filter(c => c.group === 'short' && picks[`r8:${c.sid}`]?.choice).length,
  R8.filter(c => c.group === 'short').length, picks[`r8:${R8.find(c => c.group === "short").sid}`]?.choice]);
ok('B on the rest picks the group, keeping a pick already made', shortDone === shortAll && firstChoice === 'today', `${shortDone}/${shortAll}, first ${firstChoice}`);
ok('the group bar follows', (await page.$eval('#r8-groups [data-r8group="short"] .bucket-count', e => e.textContent)) === `${shortAll}/${shortAll}`);
await page.click('#r8 [data-r8row="b"]');
await new Promise(r => setTimeout(r, 400));
ok('the group plays in a row', (await page.$eval('#r8 [data-r8row="b"]', e => e.dataset.playing)) === 'true');
// the sticky tabs can sit over the question after scrolling: start from the top
await page.evaluate(() => window.scrollTo(0, 0));
await page.click('[data-item="r8:q:row"][data-choice="b"]');
ok('the question saves', await page.evaluate(() => picks['r8:q:row']?.choice === 'b'));
// undo the test picks, on this device only (headless has no Claude save)
await page.evaluate(() => { for (const k of Object.keys(picks)) if (k.startsWith('r8:')) delete picks[k]; localStorage.clear(); });
const tabsH = await page.evaluate(() => document.querySelector('.tabs').getBoundingClientRect().height);
if (width < 700) ok('on a phone the tab bar is one short row', tabsH < 80, `${Math.round(tabsH)}px`);
const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
ok('nothing wider than the screen', over <= 0, `${over}px over`);
await page.click('.tab[data-tab="r7"]');
ok('round 7 still draws', (await page.evaluate(() => document.querySelectorAll('#r7 article.card').length)) === (await page.evaluate(() => R7.length)));
await page.click('.tab[data-tab="r6"]');
ok('round 6 still draws', (await page.evaluate(() => document.querySelectorAll('#r6 article.card').length)) > 0);
ok('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
await browser.close();
server.close();
