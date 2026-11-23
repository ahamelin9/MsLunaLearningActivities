// Round 5 on a local copy of the Sound Check page: serves the folder, opens it
// headless, and checks the tab, groups, cards, picks and clips.
//   node check5.mjs <repo> <pagedir>
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const [repo, dir] = process.argv.slice(2);
const require = createRequire(join(repo, 'package.json'));
const puppeteer = require('puppeteer-core');
const { chromePath } = require(join(repo, 'scripts/chrome-path.cjs'));

const server = createServer((req, res) => {
  const p = join(dir, decodeURIComponent(req.url.split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
  if (!existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : 'application/json' });
  res.end(readFileSync(p));
}).listen(0);
const port = server.address().port;
const ok = (n, pass, d = '') => { console.log(`${pass ? '✅' : '❌'} ${n}${d ? `  (${d})` : ''}`); if (!pass) process.exitCode = 1; };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true });
const page = await browser.newPage();
await page.setViewport({ width: Number(process.argv[4] || 1000), height: 900 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));

const tab = await page.$eval('.tab[aria-selected="true"]', e => e.dataset.tab);
ok('opens on round 5', tab === 'r5', tab);
const buckets = await page.$$eval('.bucket', bs => bs.map(b => b.textContent.replace(/\s+/g, ' ').trim()));
ok('six groups with counts and bars', buckets.length === 6 && (await page.$$('.bucket .bar')).length === 6, buckets.join(' | '));
const counts = [];
for (let i = 0; i < 6; i++) {
  await (await page.$$('.bucket'))[i].click();
  counts.push(await page.$$eval('#r5 .card', c => c.length));
}
ok('groups hold 51 sounds', counts.reduce((a, b) => a + b, 0) === 51, counts.join(' + '));
await (await page.$$('.bucket'))[2].click(); // quick sounds: p has breath takes
const pTakes = await page.$$eval('#r5 article.card:first-of-type .take', ts => ts.map(t => t.dataset.take));
ok('a breathy card has today, 3 as Luna, 3 his, the word', pTakes.join() === 'today,luna1,luna2,luna3,his1,his2,his3,lunaword', pTakes.join());
// every clip a card names is in the clips file
const missing = await page.evaluate(() => [...document.querySelectorAll('#r5 [data-clip]')].map(b => b.dataset.clip).filter(id => !AUDIO_R5 || !AUDIO_R5[id]));
ok('quick sounds: every clip is there', missing.length === 0, missing.slice(0, 6).join(', '));
const allMissing = await page.evaluate(() => {
  const ids = R5.flatMap(([sid, , , , breath]) => ['today', 'luna1', 'luna2', 'luna3', 'lunaword', ...(breath ? ['his1', 'his2', 'his3'] : [])].map(t => `r5:${sid}:${t}`));
  return ids.filter(id => !AUDIO_R5[id]);
});
ok('every clip of all 51 cards is there', allMissing.length === 0, `${allMissing.length} missing ${allMissing.slice(0, 4).join(', ')}`);
// a clip decodes and plays
const played = await page.evaluate(async () => {
  const a = new Audio(clip(document.querySelector('#r5 [data-clip]').dataset.clip));
  return new Promise(r => { a.onloadedmetadata = () => r(a.duration); a.onerror = () => r(-1); });
});
ok('a clip decodes', played > 0, `${played?.toFixed?.(2)} s`);
// a pick fills its group's bar and the tab count, and Next moves on
await page.click('#r5 article.card:first-of-type .pick[data-choice="luna2"]');
const after = await page.evaluate(() => [document.getElementById('c-r5').textContent, document.querySelectorAll('.bucket')[2].textContent.replace(/\s+/g, ' ').trim(), document.querySelector('#r5 article.card:first-of-type').dataset.done]);
ok('a pick counts on the tab and the group bar', after[0] === '1/51' && after[1].includes('1/9') && after[2] === 'true', after.join(' | '));
await page.click('#r5 article.card:first-of-type .pick[data-choice="luna2"]');
await page.click('.next-group');
ok('Next goes to the held sounds', (await page.$eval('#r5 h3', h => h.textContent)) === 'Held sounds');
const wide = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
ok('no sideways scroll', wide);
await page.screenshot({ path: join(dir, '..', `r5-${process.argv[4] || 1000}.png`), fullPage: false });
ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
server.close();
