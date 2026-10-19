// Does every Treasure Path stone fit? (DES-22c) Plays all 5 stones at a grade
// and size and checks the game's own pieces, the path of stones at the top
// and the answers at the bottom, sit inside the stage. Found by data-shot and
// Choice's data-kind, so it works on the kit (it replaced treasure-fit.cjs,
// which clicked class names that are gone: OPS-9). With Vite on the port:
//   node .claude/skills/know-how/treasure-fit.mjs 5199 1024x768 2   # grade 0, 1 or 2
//   node .claude/skills/know-how/treasure-fit.mjs 5199 1180x820 2 <outDir> [dark]
// 2nd grade's passages run to 50 words; run it a few times to meet them. With
// an outDir it also saves each stone (`ui:shots` only plays Kindergarten),
// named by grade, size, stone and question kind (GAME-1c).
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
const require = createRequire(join(process.cwd(), 'package.json'));
const puppeteer = require('puppeteer-core');
const { chromePath } = require('./scripts/chrome-path.cjs');
const [port = '5199', size = '1024x768', grade = '2', outDir, theme = 'light'] = process.argv.slice(2);
const [W, H] = size.split('x').map(Number);
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H });
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
const cards = await page.$$(at('grade-card'));
await cards[Number(grade)].click();
await page.waitForSelector(at('hub'));
for (const t of await page.$$(at('game-tile'))) {
  if ((await t.evaluate(e => e.textContent)).includes('Treasure Path')) { await t.click(); break; }
}
await page.waitForSelector(at('play'));
await page.click(at('play'));
let bad = 0;
for (let stone = 1; stone <= 5; stone++) {
  await page.waitForSelector('[data-shot="stage"] button[data-kind]');
  await wait(800);
  const m = await page.evaluate(() => {
    const stage = document.querySelector('[data-shot="stage"]').getBoundingClientRect();
    // the game's own pieces: the path of stones at the top, the answers at the bottom
    const path = document.querySelector('[data-shot="stage"] [aria-label^="Stone"]').getBoundingClientRect();
    const answers = [...document.querySelectorAll('[data-shot="stage"] button[data-kind]')].map(e => e.getBoundingClientRect());
    const lowest = Math.max(...answers.map(r => r.bottom));
    const highest = path.top;
    const words = document.querySelector('[data-shot="treasure-passage"]')?.textContent.split(' ').length;
    const pips = document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label');
    return { pips, stageTop: Math.round(stage.top), stageBottom: Math.round(stage.bottom), highest: Math.round(highest), lowest: Math.round(lowest), words };
  });
  const fits = m.lowest <= m.stageBottom && m.highest >= m.stageTop;
  if (!fits) bad++;
  console.log(`${fits ? '✅' : '❌'} stone ${stone}: ${m.words} words, content ${m.highest}–${m.lowest} in stage ${m.stageTop}–${m.stageBottom}`);
  if (outDir) {
    const kind = (await page.$('[data-shot="treasure-claim"]')) ? 'truefalse' : 'cloze';
    mkdirSync(outDir, { recursive: true });
    await page.screenshot({ path: join(outDir, `g${grade}-${size}-${theme}-stone${stone}-${kind}.png`) });
  }
  if (stone === 5) break;
  // answer it: try each choice until right
  for (let i = 0; i < 6; i++) {
    const choices = await page.$$('[data-shot="stage"] button[data-kind]');
    await choices[i % choices.length].click().catch(() => {});
    await wait(60);
    if (await page.$('[data-shot="stage"] button[data-kind][data-state~="right"]')) break;
    await wait(700);
  }
  // on to the next stone once the round has moved on, so no stone is measured twice
  await page.waitForFunction(
    p => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') !== p,
    { timeout: 15000 },
    m.pips
  );
}
await browser.close();
console.log(bad ? `${bad} stone(s) don't fit` : 'every stone fits');
