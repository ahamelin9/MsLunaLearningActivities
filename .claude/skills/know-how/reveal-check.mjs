#!/usr/bin/env node
// "Show me" after repeated misses (FB-2): does every game and lesson point at
// the answer on the third miss, with a reveal line, and can the round then be
// finished?
//
//   node .claude/skills/know-how/reveal-check.mjs [port=5199] [--only <title words>]
//   SHOTS=<dir> … also saves a picture of each revealed state (THEME=dark for dark)
//
// Needs Vite running on the port. At kindergarten, for each of the 8 games and
// Lesson 1 it misses three times in one round, choosing wrong pieces from the
// round's own data in the game's props (the target is heard, never shown),
// counting misses by the shell's try-again sound. It then checks:
//   - after two misses nothing is revealed yet;
//   - after the third, a piece is `revealed`, and it's the answer;
//   - Luna said one of her reveal lines (engine/luna.ts, GENERAL.reveal);
//   - tapping the revealed piece(s) finishes the round.
// It fails on the commit before FB-2, where nothing was ever revealed.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d{4,}$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };
const only = process.argv.indexOf('--only');
const want = t => only === -1 || t.includes(process.argv[only + 1]);

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });

async function open(title, lesson = false) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 820 });
  // light unless THEME=dark: headless Chrome follows the Mac's own setting (DES-16)
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: process.env.THEME === 'dark' ? 'dark' : 'light' }]);
  await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('grade-card'));
  await (await page.$$(at('grade-card')))[0].click();
  await page.waitForSelector(at('hub'));
  if (lesson) await (await page.$$(at('lesson-tile')))[0].click();
  else {
    for (const t of await page.$$(at('game-tile'))) {
      if ((await t.evaluate(e => e.textContent)).includes(title)) { await t.click(); break; }
    }
  }
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await wait(1800);
  await page.evaluate(async () => {
    const find = name => performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes(name));
    const { soundManager } = await import(find('/src/utils/audio.ts') ?? '/src/utils/audio.ts');
    const { pronunciation } = await import(find('/src/utils/pronunciation.ts') ?? '/src/utils/pronunciation.ts');
    const { GENERAL } = await import(find('/src/apps/reading/engine/luna.ts') ?? '/src/apps/reading/engine/luna.ts');
    window.__misses = 0;
    window.__revealLines = GENERAL.reveal.map(l => l.text.replace(/[…]/g, '...'));
    window.__said = [];
    const tryAgain = soundManager.playTryAgain.bind(soundManager);
    soundManager.playTryAgain = () => { window.__misses += 1; return tryAgain(); };
    const say = pronunciation.say.bind(pronunciation);
    pronunciation.say = (r, text, o) => { window.__said.push(String(text)); return say(r, text, o); };
  });
  return page;
}

// the round in the game's props, from any piece up the React tree
const round = page => page.evaluate(() => {
  const el = document.querySelector('[data-shot="stage"] button, [data-shot="stage"] [data-state="huntable"] span');
  if (!el) return null;
  const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
  for (let f = el[key]; f; f = f.return) if (f.memoizedProps?.round) return JSON.parse(JSON.stringify(f.memoizedProps.round));
  return null;
});
const misses = page => page.evaluate(() => window.__misses);
const revealed = page => page.$$eval('[data-shot="stage"] [data-state~="revealed"]', els => els.map(e => (e.getAttribute('aria-label') ?? e.textContent).trim()));
const pips = page => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label'));
const saidReveal = page => page.evaluate(() => window.__said.some(t => window.__revealLines.some(l => t.startsWith(l.slice(0, 12)))));
const settle = () => wait(2600);

/** Taps the stage element whose label or text passes `test`, the n-th such. */
async function tap(page, selector, test, n = 0) {
  const els = [];
  for (const el of await page.$$(selector)) {
    const label = await el.evaluate(e => (e.getAttribute('aria-label') ?? e.textContent).trim());
    if (test(label)) els.push(el);
  }
  const el = els[n % Math.max(1, els.length)];
  if (!el) return false;
  await el.click();
  return true;
}

/** Misses three times with `missOnce(i)`, checking the reveal, then finishes with `finish()`. */
async function run(name, page, missOnce, isAnswer, finish) {
  const start = await pips(page);
  for (let i = 0; i < 2; i++) { await missOnce(i); await settle(); }
  const early = await revealed(page);
  await missOnce(2);
  await settle();
  const shown = await revealed(page);
  const m = await misses(page);
  // review pictures of the revealed state: SHOTS=<dir>
  if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png` });
  ok(`${name}: nothing revealed after two misses`, early.length === 0, early.join(', '));
  ok(`${name}: the answer is revealed on the third miss`, m >= 3 && shown.length > 0 && shown.every(isAnswer), `${m} misses; revealed: ${shown.join(', ')}`);
  ok(`${name}: Luna says a reveal line`, await saidReveal(page));
  await finish();
  for (let t = 0; t < 30 && (await pips(page)) === start && !(await page.$(at('shell-reward'))); t++) await wait(300);
  ok(`${name}: the revealed answer finishes the round`, (await pips(page)) !== start || Boolean(await page.$(at('shell-reward'))), `${start} → ${await pips(page)}`);
  await page.close();
}

const PIECE = `${at('stage')} button:not([data-variant="prompt"])`;
const tapRevealed = page => async () => {
  for (let i = 0; i < 12; i++) {
    const el = await page.$(`${at('stage')} [data-state~="revealed"]`);
    if (!el) break;
    await el.click();
    await wait(1600);
  }
};

if (want('Letter Jar')) {
  const page = await open('Letter Jar');
  const r = await round(page);
  const targets = r.bugs.filter(b => b.isTarget).map(b => `letter ${b.char}`);
  await run('Letter Jar', page,
    i => tap(page, `${at('stage')} button[aria-label^="letter"]`, l => !targets.includes(l), i),
    l => targets.includes(l), tapRevealed(page));
}

if (want('Bubble Sounds')) {
  const page = await open('Bubble Sounds');
  const r = await round(page);
  const target = r.letter.letter.toLowerCase();
  const isTarget = l => l.replace(/^bubble /, '').toLowerCase() === target;
  await run('Bubble Sounds', page,
    () => tap(page, `${at('stage')} button[aria-label^="bubble"]:not([data-state])`, l => !isTarget(l)),
    isTarget, tapRevealed(page));
}

if (want('Feed Luna')) {
  const page = await open('Feed Luna');
  const r = await round(page);
  await run('Feed Luna', page,
    i => tap(page, `${at('stage')} button[aria-label^="letter"]`, l => l !== `letter ${r.answer}`, i),
    l => l === `letter ${r.answer}`, tapRevealed(page));
}

if (want('Muddled Cards')) {
  const page = await open('Muddled Cards');
  const r = await round(page);
  // two cards of different pairs, tried again and again: a repeat is a miss
  const a = 0;
  const b = r.cards.findIndex(c => c.pair !== r.cards[a].pair);
  const pairOf = r.cards[a].pair;
  const flipTwo = async () => {
    const cards = await page.$$(`${at('stage')} button`);
    await cards[a].click(); await wait(500);
    await cards[b].click(); await wait(2200);
  };
  await flipTwo(); // the first try is free
  // the revealed cards must be the pair of the card tried again (cards are
  // labelled "face down card", so the check reads their places)
  const shownPair = () => page.$$eval(`${at('stage')} button`, els => els.map((e, i) => (/\brevealed\b/.test(e.getAttribute('data-state') ?? '') ? i : -1)).filter(i => i >= 0));
  const both = r.cards.map((c, i) => (c.pair === pairOf ? i : -1)).filter(i => i >= 0);
  let pairOk = false;
  await run('Muddled Cards', page, async i => {
    await flipTwo();
    if (i === 2) pairOk = JSON.stringify(await shownPair()) === JSON.stringify(both);
  },
    () => pairOk,
    async () => {
      const cards = await page.$$(`${at('stage')} button`);
      for (const i of both) { await cards[i].click(); await wait(900); }
      await wait(1200);
      // the rest of the pairs, to finish the round
      const pairs = [...new Set(r.cards.map(c => c.pair))].filter(p => p !== pairOf);
      for (const p of pairs) {
        const idx = r.cards.map((c, i) => (c.pair === p ? i : -1)).filter(i => i >= 0);
        const now = await page.$$(`${at('stage')} button`);
        for (const i of idx) { await now[i].click(); await wait(900); }
        await wait(1200);
      }
    });
}

if (want('Words Off the Page')) {
  const page = await open('Words Off the Page');
  const r = await round(page);
  const reversed = [...r.words].reverse();
  const tileIn = w => tap(page, `${at('stage')} button`, l => l === w);
  const wrongOrder = async () => {
    // take back anything placed, then lay the words in reverse
    for (let k = 0; k < r.words.length + 1; k++) {
      if (!(await tap(page, `${at('stage')} button[aria-label$="tap to take back"]`, () => true))) break;
      await wait(150);
    }
    for (const w of reversed) { await tileIn(w); await wait(200); }
  };
  await run('Words Off the Page', page, wrongOrder,
    l => r.words.includes(l),
    async () => {
      for (let i = 0; i < r.words.length + 2; i++) {
        const el = await page.$(`${at('stage')} [data-state~="revealed"]`);
        if (!el) break;
        await el.click();
        await wait(300);
      }
    });
}

if (want('Missing')) {
  const page = await open('Missing');
  await page.waitForSelector(`${at('stage')} button[aria-label]`, { timeout: 20000 });
  await wait(1500);
  const r = await round(page);
  await run("What's Missing?", page,
    i => tap(page, `${at('stage')} button[aria-label]`, l => l !== r.missing.word, i),
    l => l === r.missing.word, tapRevealed(page));
}

if (want('Treasure Path')) {
  const page = await open('Treasure Path');
  const r = await round(page);
  await run('Treasure Path', page,
    () => tap(page, PIECE, l => r.options?.includes(l) && l !== r.answer),
    l => l === r.answer, tapRevealed(page));
}

if (want('Story Corner')) {
  const page = await open('Story Corner');
  // read through to the hunt
  for (let i = 0; i < 12 && !(await page.$(`${at('stage')} [data-state="huntable"]`)); i++) {
    await page.click(`${at('stage')} button[data-variant="action"]`).catch(() => {});
    await wait(900);
  }
  const r = await round(page);
  const clean = w => w.replace(/[^a-zA-Z]/g, '').toLowerCase();
  await run('Story Corner (the hunt)', page,
    i => tap(page, `${at('stage')} [data-state="huntable"] > span`, l => clean(l) && clean(l) !== r.hunt, i * 3),
    l => clean(l) === r.hunt,
    async () => {
      const el = await page.$(`${at('stage')} [data-state~="revealed"]`);
      await el?.click();
      // then the question: the right answer, from the story's data
      await wait(4500);
      const q = await round(page);
      const answers = q?.story?.answers ?? [];
      const right = answers.find(a => a.correct)?.text;
      if (right) await tap(page, PIECE, l => l === right);
    });
}

if (want('Lesson')) {
  const page = await open('Lesson 1', true);
  // the question's options, from the lesson's props
  const options = await page.evaluate(() => {
    const el = document.querySelector('[data-shot="lesson-choice"]');
    const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
    for (let f = el[key]; f; f = f.return) {
      const p = f.memoizedProps;
      const list = p?.question?.options ?? p?.options;
      if (Array.isArray(list) && list.some(o => 'isCorrect' in o)) return list.map(o => ({ letter: o.letter, text: o.text, word: o.word, isCorrect: o.isCorrect }));
    }
    return null;
  });
  const label = o => (o.letter ? `letter ${o.letter}` : o.text ?? o.word);
  const right = options.filter(o => o.isCorrect).map(label);
  await run('Lesson 1', page,
    i => tap(page, at('lesson-choice'), l => !right.includes(l), i),
    l => right.includes(l), tapRevealed(page));
}

await browser.close();
const passed = results.length > 0 && results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
