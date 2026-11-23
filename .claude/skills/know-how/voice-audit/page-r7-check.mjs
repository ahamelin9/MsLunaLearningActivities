// Round 7 on a local copy of the Sound Check page (after page-r7.py): opens
// on round 7, every card and clip is there, a pick counts, nothing breaks.
//   node .claude/skills/know-how/voice-audit/page-r7-check.mjs <repo> <pagedir> [width]
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
const ok = (n, pass, d = '') => { console.log(`${pass ? '✅' : '❌'} ${n}${d ? `  (${d})` : ''}`); if (!pass) process.exitCode = 1; };
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true });
const page = await browser.newPage();
await page.setViewport({ width, height: 900 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(`http://localhost:${server.address().port}/`, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));
ok('opens on round 7', (await page.$eval('.tab[aria-selected="true"]', e => e.dataset.tab)) === 'r7');
const [cards, want] = await page.evaluate(() => [document.querySelectorAll('#r7 article.card').length, R7.length]);
ok('every card shows', cards === want && want > 0, `${cards}/${want}`);
const missing = await page.evaluate(() => R7.flatMap(c => c.takes.map(([id]) => `r7:${c.sid}:${id}`)).filter(id => !AUDIO_R7?.[id]));
ok('every clip is there', missing.length === 0, missing.slice(0, 5).join(', '));
const dur = await page.evaluate(async () => {
  const a = new Audio(clip(document.querySelector('#r7 [data-clip]').dataset.clip));
  return new Promise(r => { a.onloadedmetadata = () => r(a.duration); a.onerror = () => r(-1); });
});
ok('a clip decodes', dur > 0, `${dur.toFixed(2)} s`);
await page.click('#r7 article.card:first-of-type .pick');
ok('a pick counts on the tab', (await page.$eval('#c-r7', e => e.textContent)) === `1/${want}`);
await page.click('#r7 article.card:first-of-type .pick');
ok('no sideways scroll', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
await page.screenshot({ path: join(dir, '..', `r7-${width}.png`) });
ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
server.close();
