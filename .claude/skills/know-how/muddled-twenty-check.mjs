#!/usr/bin/env node
// Does Muddled Cards' bar count its 20 pairs? (CUR-20)
//
//   node .claude/skills/know-how/muddled-twenty-check.mjs [port=5199]
//
// Needs Vite on the port. Checks:
//   - every level deals 4 boards adding up to 20 pairs, none twice on one
//     board, and none on two boards of a play, except at the first level,
//     whose 14 letters bring 6 back on a later board (dealt 30 times a
//     level, from the game's own makeRounds);
//   - at each grade the bar opens on "Round 1 of 20";
//   - at Kindergarten, played by matching pairs (big and little letters, by
//     their names): the bar moves one step per pair found, through the first
//     two boards, so after board 1's last pair it says the next board's
//     first pair is up ("Round 5 of 20" after 4 pairs).
// On the code before CUR-20 the bar says "of 4" and doesn't move with a pair.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.slice(2).find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? '✅' : '❌'} ${name}${detail !== '' ? `  (${detail})` : ''}`);
};

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820, hasTouch: true });
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });

// ---- the deal, from the game itself ----
const deal = await page.evaluate(async () => {
  const { memoryMatch } = await import('/src/apps/reading/games/MemoryMatch/MemoryMatch.tsx');
  const out = {};
  // the three tiers: Kindergarten "Just right" is 1, 1st grade's 2, 2nd grade's 3
  for (const [grade, difficulty] of [['kindergarten', 2], ['grade1', 2], ['grade2', 2]]) {
    const plays = [];
    for (let n = 0; n < 30; n++) {
      const boards = memoryMatch.makeRounds({ grade, difficulty, count: memoryMatch.roundsPerPlay });
      const pairs = boards.flatMap(b => [...new Set(b.cards.map(c => c.pair))]);
      plays.push({ dup: pairs.filter((x, i) => pairs.indexOf(x) !== i).join(','), sizes: boards.map(b => b.pairCount).join('+'), total: boards.reduce((a, b) => a + b.pairCount, 0), repeats: pairs.length - new Set(pairs).size, real: boards.every(b => new Set(b.cards.map(c => c.pair)).size === b.pairCount) });
    }
    out[`${grade}/${difficulty}`] = plays;
  }
  return out;
});
for (const [level, plays] of Object.entries(deal)) {
  const back = level.startsWith('kindergarten') ? 6 : 0;
  ok(
    `${level}: every play deals 20 pairs on 4 boards, none twice on one board${back ? `, ${back} back on a later one` : ', nor on two'}`,
    plays.every(p => p.total === 20 && p.repeats === back && p.real && p.sizes.split('+').length === 4),
    [...new Set(plays.map(p => p.sizes))].join(', ') + plays.filter(p => p.dup).map(p => ` · twice: ${p.dup}`).slice(0, 3).join('')
  );
}

// ---- the bar ----
const barText = () => page.$eval(at('round-pips'), e => e.getAttribute('aria-label')).catch(() => null);
async function open(grade) {
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('grade-card'));
  await (await page.$$(at('grade-card')))[grade].click();
  await page.waitForSelector(at('hub'));
  for (const t of await page.$$(at('game-tile'))) if ((await t.evaluate(e => e.textContent)).includes('Muddled Cards')) await t.click();
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await wait(800);
}
for (const grade of [0, 1, 2]) {
  await open(grade);
  ok(`${['Kindergarten', '1st grade', '2nd grade'][grade]}: the bar opens on Round 1 of 20`, (await barText()) === 'Round 1 of 20', await barText());
}

/** the round's cards' pairs, in the order of their buttons (read from the round in React) */
const pairsOf = () =>
  page.evaluate(() => {
    const first = document.querySelector('[data-shot="stage"] button[aria-label]');
    const key = first && Object.keys(first).find(k => k.startsWith('__reactFiber'));
    for (let f = key ? first[key] : null; f; f = f.return) if (f.memoizedProps?.round?.cards) return f.memoizedProps.round.cards.map(c => c.pair);
    return null;
  });

// Kindergarten, played: each pair's two cards, flipped one after the other
await open(0);
const seen = [];
for (let board = 0; board < 2; board++) {
  let pairs = null;
  for (let t = 0; t < 60 && !pairs; t++) {
    pairs = await pairsOf();
    if (!pairs) await wait(150);
  }
  for (const pair of [...new Set(pairs)]) {
    const before = await barText();
    for (const [i] of pairs.map((p, i) => [i, p]).filter(([, p]) => p === pair)) {
      await page.$$eval(`${at('stage')} button[aria-label]`, (bs, n) => bs[n].click(), i);
      await wait(350);
    }
    // the bar moves as the pair is found; a board's last pair waits for the next board
    for (let t = 0; t < 60 && (await barText()) === before; t++) await wait(150);
    seen.push(await barText());
  }
  // the next board comes in after the win
  for (let t = 0; t < 60 && JSON.stringify(await pairsOf()) === JSON.stringify(pairs); t++) await wait(150);
}
const want = Array.from({ length: seen.length }, (_, i) => `Round ${i + 2} of 20`);
ok(
  'Kindergarten, played: one step per pair found, across two boards',
  seen.length >= 8 && seen.every((s, i) => s === want[i]),
  seen.map(s => s?.replace('Round ', '').replace(' of 20', '')).join(' → ')
);

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
