// Review shots of games mid-play (DES-22b), which ui:shots (its clock stopped
// at a round's start) never reaches: Bubble Sounds' bubbles up in the water,
// two Muddled Cards turned over, a wrong and a caught Letter Jar letter, a
// wrong cookie. From the repo root, with Vite on the port:
//   node .claude/skills/know-how/game-shot.mjs 5199 screenshots/games light 1180x820
// Add a game's own moments the same way; untilState() taps pieces in turn
// until one takes a data-state (wrong, right), then shoots it.
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

const require = createRequire(join(process.cwd(), 'package.json'));
const puppeteer = require('puppeteer-core');
const { chromePath } = require('./scripts/chrome-path.cjs');

const [port = '5199', outDir = 'screenshots/games', theme = 'light', size = '1180x820'] = process.argv.slice(2);
const [W, H] = size.split('x').map(Number);
mkdirSync(outDir, { recursive: true });
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });

async function open(title) {
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
    if ((await t.evaluate(e => e.textContent)).includes(title)) { await t.click(); break; }
  }
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await wait(1500);
  return page;
}
const shot = async (page, name) => {
  const file = join(outDir, `${name}-${theme}-${size}.png`);
  await page.screenshot({ path: file });
  console.log(file);
};
// tap pieces in turn until one takes the state, then shoot it a moment later
async function untilState(page, selector, state, name, delay = 150) {
  for (let i = 0; i < 24; i++) {
    const pieces = await page.$$(selector);
    const p = pieces[i % Math.max(1, pieces.length)];
    if (!p) { await wait(300); continue; }
    await p.click().catch(() => {});
    await wait(40);
    if (await page.$(`${selector}[data-state~="${state}"]`)) { await wait(delay); await shot(page, name); return; }
    await wait(700);
  }
  console.log(`no ${state} for ${name}`);
}

const only = process.env.GAMES ?? 'all'; // '22b', '22c' or 'all'
let page;

if (only !== '22b') {
  // What's Missing?: the guess, then a wrong pick mid-wobble
  page = await open('What');
  await page.waitForSelector('[data-shot="stage"] button[data-kind]', { timeout: 20000 });
  await wait(700);
  await shot(page, 'missing-guess');
  await untilState(page, '[data-shot="stage"] button[data-kind]', 'wrong', 'missing-wrong', 120);
  await page.close();

  // Treasure Path: a wrong answer mid-wobble, then the right one
  page = await open('Treasure Path');
  await untilState(page, '[data-shot="stage"] button[data-kind]', 'wrong', 'treasure-wrong', 120);
  await wait(800);
  await untilState(page, '[data-shot="stage"] button[data-kind]', 'right', 'treasure-right', 400);
  await page.close();

  // Words Off the Page: every word tapped onto the page in the shelf's order
  page = await open('Words Off');
  for (let i = 0; i < 8; i++) {
    const tiles = await page.$$('[data-shot="stage"] button:not([aria-label]):not([data-variant])');
    if (!tiles.length) break;
    await tiles[0].click();
    await wait(350);
  }
  await wait(500);
  await shot(page, 'words-placed');
  await page.close();

  // Story Corner: read to the end, then the word hunt
  page = await open('Story Corner');
  for (let i = 0; i < 8; i++) {
    const next = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find(b => /Next line|I have read it/.test(b.textContent)));
    if (!(await next.evaluate(b => Boolean(b)))) break;
    await next.click();
    await wait(400);
  }
  await wait(600);
  await shot(page, 'story-hunt');
  await page.close();
}
if (only === '22c') { await browser.close(); process.exit(0); }

// Bubble Sounds: bubbles up in the water, then a wrong and a right pop
page = await open('Bubble Sounds');
await wait(3500);
await shot(page, 'bubbles-rising');
await page.close();

// Muddled Cards: two cards turned over
page = await open('Muddled Cards');
const cards = await page.$$('[data-shot="stage"] button[aria-label]');
await cards[0].click();
await wait(300);
await cards[1].click();
await wait(700);
await shot(page, 'cards-open');
await page.close();

// Letter Jar: a wrong bug mid-wobble, then a caught one mid-pop
page = await open('Letter Jar');
await untilState(page, '[data-shot="stage"] button[aria-label^="letter"]', 'wrong', 'jar-wrong', 120);
await wait(800);
await untilState(page, '[data-shot="stage"] button[aria-label^="letter"]', 'right', 'jar-right', 150);
await page.close();

// Letter Cookies: a wrong cookie mid-wobble
page = await open('Letter Cookies');
await untilState(page, '[data-shot="stage"] button[aria-label^="letter"]', 'wrong', 'cookies-wrong', 120);
await page.close();

await browser.close();
