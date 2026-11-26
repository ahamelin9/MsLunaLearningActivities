// Round 6 on a local copy of the Sound Check page: serves the folder, opens
// it headless, and checks the tab, the cards, every clip and a pick.
//   node .claude/skills/know-how/voice-audit/page-r6-check.mjs <repo> <pagedir> [width]
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

// a later round's tab may come first: open round 6's
const first = await page.$eval('.tab[aria-selected="true"]', e => e.dataset.tab);
ok('opens on round 6 or a later round', /^r([6-9]|\d\d)$/.test(first), first);
if (first !== 'r6') await page.click('.tab[data-tab="r6"]');
// one group at a time: every group's button shows its cards, and they add up
const want = await page.evaluate(() => R6.length);
const groups = (await page.$$('#r6-groups .bucket')).length;
const seen = [];
for (let i = 0; i < groups; i++) {
  await (await page.$$('#r6-groups .bucket'))[i].click();
  seen.push(await page.$$eval('#r6 article.card', c => c.length));
}
ok('every card shows, a group at a time', groups > 0 && seen.reduce((a, b) => a + b, 0) === want, `${seen.join(' + ')} of ${want}`);
await (await page.$$('#r6-groups .bucket'))[0].click();
if (groups > 1) {
  const second = await page.evaluate(() => r6Shown()[1][1]);
  await page.click('#r6 .next-group');
  ok('Next goes to the next group', (await page.$eval('#r6 h3', h => h.textContent)) === second, second);
  await (await page.$$('#r6-groups .bucket'))[0].click();
}
const missing = await page.evaluate(() => R6.flatMap(c => c.takes.map(([id]) => `r6:${c.sid}:${id}`)).filter(id => !AUDIO_R6?.[id]));
ok('every clip is there', missing.length === 0, missing.slice(0, 5).join(', '));
const dur = await page.evaluate(async () => {
  const a = new Audio(clip(document.querySelector('#r6 [data-clip]').dataset.clip));
  return new Promise(r => { a.onloadedmetadata = () => r(a.duration); a.onerror = () => r(-1); });
});
ok('a clip decodes', dur > 0, `${dur.toFixed(2)} s`);
await page.click('#r6 article.card:first-of-type .pick');
ok('a pick counts on the tab', (await page.$eval('#c-r6', e => e.textContent)) === `1/${want}`);
await page.click('#r6 article.card:first-of-type .pick'); // undo it
ok('no sideways scroll', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
await page.screenshot({ path: join(dir, '..', `r6-${width}.png`) });
ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
server.close();
