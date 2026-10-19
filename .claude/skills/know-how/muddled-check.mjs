#!/usr/bin/env node
// Muddled Cards: reading required at tier 2+ (GAME-4).
//
//   node .claude/skills/know-how/muddled-check.mjs [port=5199]
//
// Needs Vite running on the port. At 1st grade (tier 2 on "Just right") and
// 2nd grade (tier 3) it plays the first round of picture + word pairs,
// logging every line Luna asks for (`pronunciation.say`), and checks:
//   - flipping a word card first says nothing, so its word can't be heard;
//   - flipping a word card second, onto a picture it doesn't belong to, says
//     nothing either;
//   - flipping a picture card says its word (the vocabulary help stays);
//   - a found pair is read aloud, the word card with it;
//   - (1st grade) the same two word cards tried again and again: neither is
//     read, and the hint ("Hear my clue") names neither.
// And at Kindergarten (tier 1, big + little letters) a flipped letter is
// still named. The cards are read from the round in React (buttons follow
// round.cards). It fails on the commit before GAME-4, where every card was
// read aloud when flipped.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });

async function open(grade) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 820 });
  await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  // every line asked for, from the app's own speech module
  await page.evaluate(async () => {
    const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/pronunciation.ts')) ?? '/src/utils/pronunciation.ts';
    const { pronunciation } = await import(src);
    window.__said = [];
    const say = pronunciation.say.bind(pronunciation);
    pronunciation.say = (req, text, o) => { window.__said.push(String(text)); return say(req, text, o); };
  });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('grade-card'));
  await (await page.$$(at('grade-card')))[grade].click();
  await page.waitForSelector(at('hub'));
  for (const t of await page.$$(at('game-tile'))) {
    if ((await t.evaluate(e => e.textContent)).includes('Muddled Cards')) { await t.click(); break; }
  }
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector('[data-shot="stage"] button[aria-label="face down card"]');
  await wait(3500); // the round's opening lines
  return page;
}

/** the round's cards, in the order of their buttons */
const cardsOf = page => page.evaluate(() => {
  const first = document.querySelector('[data-shot="stage"] button[aria-label="face down card"]');
  const key = Object.keys(first).find(k => k.startsWith('__reactFiber'));
  for (let f = first[key]; f; f = f.return) if (f.memoizedProps?.round?.cards) return f.memoizedProps.round.cards.map(c => ({ pair: c.pair, picture: Boolean(c.emoji), label: c.label }));
  return null;
});

/** taps card i and returns what Luna asked to say in the next ms */
async function tap(page, i, ms = 1500) {
  const from = await page.evaluate(() => window.__said.length);
  await page.evaluate(n => document.querySelectorAll('[data-shot="stage"] button[aria-label]')[n].click(), i);
  await wait(ms);
  return page.evaluate(n => window.__said.slice(n), from);
}

for (const grade of [1, 2]) {
  const where = ['K', '1st', '2nd'][grade];
  const page = await open(grade);
  const cards = await cardsOf(page);
  const wordAt = pair => cards.findIndex(c => c.pair === pair && !c.picture);
  const pictureAt = pair => cards.findIndex(c => c.pair === pair && c.picture);
  const [a, b] = [...new Set(cards.map(c => c.pair))];

  // a word card first: silent; then its picture: the pair is found and read
  const firstWord = await tap(page, wordAt(a));
  ok(`${where}: a word card flipped first says nothing`, !firstWord.includes(a), `said: ${JSON.stringify(firstWord)}`);
  const found = await tap(page, pictureAt(a), 2500);
  ok(`${where}: a found pair is read aloud`, found.includes(a), `said: ${JSON.stringify(found)}`);

  // a picture first: its word; then a word card that isn't its partner: silent
  const picture = await tap(page, pictureAt(b));
  ok(`${where}: a picture card says its word`, picture.includes(b), `said: ${JSON.stringify(picture)}`);
  const other = cards.find(c => !c.picture && c.pair !== a && c.pair !== b).pair;
  const wrongWord = await tap(page, wordAt(other), 2500);
  ok(`${where}: a word card flipped onto the wrong picture says nothing of its word`, !wrongWord.includes(other), `said: ${JSON.stringify(wrongWord)}`);

  // two word cards, tried twice: Luna's hint names no word either
  if (grade === 1) {
    const [c, d] = cards.filter(x => !x.picture && ![a, b, other].includes(x.pair)).map(x => x.pair);
    await tap(page, wordAt(c), 600);
    await tap(page, wordAt(d), 2500);
    await tap(page, wordAt(c), 600);
    const again = await tap(page, wordAt(d), 4000);
    // only a repeat counts as a miss here, and "Hear my clue" comes with the
    // second: once more, then the hint plays from it on Luna's perch
    await tap(page, wordAt(c), 600);
    again.push(...(await tap(page, wordAt(d), 4000)));
    const from = await page.evaluate(() => window.__said.length);
    await page.evaluate(() => [...document.querySelectorAll('button')].find(e => e.textContent.trim() === 'Hear my clue')?.click());
    await wait(4000);
    const hint = await page.evaluate(n => window.__said.slice(n), from);
    ok(`${where}: the same two word cards again: neither is read, and the clue names neither`,
      !again.includes(c) && !again.includes(d) && hint.length > 0 && !hint.includes(c) && !hint.includes(d),
      `said: ${JSON.stringify(again)}, then the clue: ${JSON.stringify(hint)}`);
  }
  await page.close();
}

// Kindergarten's letters are still named
{
  const page = await open(0);
  const said = await tap(page, 0);
  // "big" or "little", then the letter's name as Luna says it ("dee")
  const i = said.findIndex(t => t === 'big' || t === 'little');
  ok('K: a flipped letter is still named', i >= 0 && said.length > i + 1, `said: ${JSON.stringify(said)}`);
  await page.close();
}

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
