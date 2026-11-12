#!/usr/bin/env node
// This week's words (CUR-9): does every game that can use the teacher's words
// deal them in its first play, and none once she clears them?
//
//   node .claude/skills/know-how/week-words-check.mjs [port=5199]
//
// Needs Vite running on the port. From a fresh save playing Kindergarten, it
// opens Settings past the grown-up gate, then "Pick words" (data-shot
// open-week-words), and checks the picker:
//   - it opens on the grade being played, with that grade's bank words;
//   - a tap picks a word (aria-pressed, a chip at the top, "Picked: N of 10")
//     and a second tap takes it off; at 10 the rest are disabled, and taking
//     one off opens them again;
//   - the Teacher's corner names the words (as chips), and they're still picked
//     after a reload.
// Then with cat, dog and rain picked (two Kindergarten words in every reading
// pool, and a 2nd grade one; three first letters for Letter Cookies) it plays
// each of the 8 games once at Kindergarten and once at 2nd Grade, on "Just
// right", and reads what each play dealt from the shell's own rounds (its
// hook state, through React's fiber; the decks' memory can't say, as a deal
// moves a word it deals again to the back). A game that can use a picked word (one in
// its pool at that grade, or a sentence, story or passage with one in it,
// counted here by this check's own rule) must open its deal with as many as
// fit; one that can't (letters only, or none at that grade) is named. After
// "Clear", a play of each game deals nothing its last play dealt, so nothing
// is held back for the cleared words. It fails with the games dealing as
// before: 9 ❌ with dealWeekFirst returning `deal`'s deal, and Letter
// Cookies' ❌ with its weekWordsFor returning none (CUR-9).

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d{4,}$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };
const PROGRESS = 'ms_luna_learning_progress_v1';
const WORDS = ['cat', 'dog', 'rain'];
const ALL_GAMES = ['Letter Jar', 'Bubble Sounds', 'Letter Cookies', 'Muddled Cards', 'Words Off the Page', 'Missing', 'Treasure Path', 'Story Corner'];

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(key => {
  localStorage.clear();
  localStorage.setItem(key, JSON.stringify({ selectedGrade: 'kindergarten' }));
}, PROGRESS);
await page.reload({ waitUntil: 'networkidle0' });

async function openSettings() {
  await page.waitForSelector(at('open-settings'));
  await wait(1200);
  // past the grown-up gate (SET-1): a 2.3s hold on the gear
  const box = await (await page.$(at('open-settings'))).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await wait(2300);
  await page.mouse.up();
  await page.waitForSelector(at('settings'));
}

const tile = word => page.$(`${at('week-word')}[data-word="${word}"]`);
const tap = async word => { await (await tile(word)).click(); await wait(80); };
const pressed = word => page.$eval(`${at('week-word')}[data-word="${word}"]`, el => el.getAttribute('aria-pressed') === 'true');
const pickedHeading = () => page.$eval(`${at('week-picked')} h3`, el => el.textContent.replace(/\s+/g, ' ').trim());
const chips = () => page.$$eval(`${at('week-picked')} li[data-word]`, els => els.map(e => e.dataset.word));

// ── the picker ─────────────────────────────────────────────────────────────
await openSettings();
ok('Settings has "This week\'s words", none picked yet', (await page.$eval(at('week-summary'), el => el.textContent)).includes('Up to 10'));
await page.click(at('open-week-words'));
await page.waitForSelector(at('week-words'));
await wait(300);

const bank = await page.evaluate(async () => {
  const { PICKABLE_WORDS } = await import('/src/apps/reading/engine/weekWords.ts');
  const { tierFor } = await import('/src/apps/reading/engine/content.ts');
  return { words: PICKABLE_WORDS.map(w => ({ word: w.word, tier: w.tier })), tiers: { kindergarten: tierFor('kindergarten', 2), grade1: tierFor('grade1', 2), grade2: tierFor('grade2', 2) } };
});
const shownWords = () => page.$$eval(at('week-word'), els => els.map(e => e.dataset.word));
const kWords = bank.words.filter(w => w.tier === bank.tiers.kindergarten).map(w => w.word);
ok('it opens on Kindergarten, the grade being played', await page.$eval(at('week-grade-kindergarten'), el => el.getAttribute('aria-pressed') === 'true'));
const shownK = await shownWords();
ok('… with every one of its bank words, each once', shownK.length === kWords.length && kWords.every(w => shownK.includes(w)), `${shownK.length} of ${kWords.length}`);

await tap('cat');
await tap('dog');
await page.click(at('week-grade-grade2'));
await wait(200);
const g2Words = bank.words.filter(w => w.tier === bank.tiers.grade2).map(w => w.word);
const shownG2 = await shownWords();
ok('2nd Grade shows its own words', shownG2.length === g2Words.length && g2Words.every(w => shownG2.includes(w)), `${shownG2.length} of ${g2Words.length}`);
await tap('rain');
ok('a tap picks: cat, dog and rain picked, as chips, "Picked: 3 of 10"',
  (await pressed('rain')) && (await chips()).join() === WORDS.join() && (await pickedHeading()) === 'Picked: 3 of 10',
  `${await pickedHeading()}, chips ${(await chips()).join(' ')}`);
await tap('rain');
ok('a second tap takes it off', !(await pressed('rain')) && (await chips()).join() === 'cat,dog');
await tap('rain');

// fill the set to 10, then one off opens the rest again
const extras = shownG2.filter(w => !WORDS.includes(w)).slice(0, 7);
for (const w of extras) await tap(w);
const disabledAt10 = await page.$$eval(at('week-word'), els => els.filter(e => e.getAttribute('aria-pressed') !== 'true').map(e => e.disabled));
ok('at 10, every unpicked word is disabled', (await pickedHeading()) === 'Picked: 10 of 10' && disabledAt10.length > 0 && disabledAt10.every(Boolean), `${disabledAt10.filter(Boolean).length} of ${disabledAt10.length} disabled`);
await tap(extras[0]);
const disabledAt9 = await page.$$eval(at('week-word'), els => els.filter(e => e.disabled).length);
ok('… and taking one off opens them again', (await pickedHeading()) === 'Picked: 9 of 10' && disabledAt9 === 0);
for (const w of extras.slice(1)) await tap(w);
ok('back to the three', (await chips()).join() === WORDS.join());

await page.click(at('week-back'));
await page.waitForSelector(at('settings'));
// the Teacher's corner (DES-29): a count, and the words as chips with their pictures
const corner = await page.evaluate(() => ({
  summary: document.querySelector('[data-shot="week-summary"]').textContent,
  chips: [...document.querySelectorAll('[data-shot="week-chips"] > *')].map(c => c.textContent.replace(/[^a-z ]/g, '').trim())
}));
ok('the Teacher\'s corner names them', corner.summary.startsWith('3 of 10 picked') && corner.chips.join() === 'cat,dog,rain', `${corner.summary} · ${corner.chips.join(', ')}`);
await page.reload({ waitUntil: 'networkidle0' });
const savedAfterReload = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).settings.weekWords, PROGRESS);
ok('saved on the device: still picked after a reload', JSON.stringify(savedAfterReload) === JSON.stringify(WORDS), JSON.stringify(savedAfterReload));

// ── the games ──────────────────────────────────────────────────────────────
/** What each game can use, at a grade's "Just right", by this check's own rule. */
async function usable(grade) {
  return page.evaluate(async (grade, words) => {
    const c = await import('/src/apps/reading/engine/content.ts');
    const tier = c.tierFor(grade, 2);
    const has = text => words.some(w => new RegExp(`\\b${w}(?:e?s)?\\b`, 'i').test(text));
    const inPool = c.wordsUpTo(tier).filter(w => words.includes(w.word)).map(w => w.word);
    const singles = c.lettersFor(tier).filter(l => l.letter.length === 1).map(l => l.letter.toLowerCase());
    return {
      tier,
      'whats-missing': inPool,
      // word boards from tier 2; tier 1's boards are letters
      'memory-match-words': tier >= 2 ? inPool : [],
      // "the first letter of…" plates only at tier 3, one letter at the start
      'feed-luna-words': tier === 3 ? c.wordsUpTo(tier).filter(w => words.includes(w.word) && w.initial.length === 1 && singles.includes(w.initial)).map(w => w.word) : [],
      'build-sentence': c.sentencesFor(tier).filter(s => has(s.text)).map(s => s.text),
      'story-time': c.MINI_STORIES.filter(s => s.tier <= tier && has(s.lines.join(' '))).map(s => s.id),
      'treasure-read': c.passagesFor(grade).filter(p => has(p.lines.join(' '))).map(p => p.id)
    };
  }, grade, WORDS);
}

/** What each game's play can use, by the `usable` list it's judged against, and the letters-only ones. */
const DECK = {
  'Missing': 'whats-missing',
  'Muddled Cards': 'memory-match-words',
  'Letter Cookies': 'feed-luna-words',
  'Words Off the Page': 'build-sentence',
  'Story Corner': 'story-time',
  'Treasure Path': 'treasure-read',
  'Letter Jar': null,
  'Bubble Sounds': null
};

/**
 * Plays a game once, to its first round, and returns what each of the play's
 * rounds is about, in order, read from the shell's own rounds (its hook state:
 * the array of roundsPerPlay objects): the word gone missing, a board's words,
 * a "first letter of" plate's word (null for a plate asking a letter), a
 * sentence, a passage's or a story's id; a letter game's letter.
 */
async function play(title) {
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  let found = false;
  for (const t of await page.$$(at('game-tile'))) {
    if ((await t.evaluate(e => e.textContent)).includes(title)) { await t.click(); found = true; break; }
  }
  if (!found) throw new Error(`no game called ${title}`);
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await wait(300);
  return page.evaluate(() => {
    const el = document.querySelector('[data-shot="stage"]');
    const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
    for (let f = el[key]; f; f = f.return) {
      const game = f.memoizedProps?.game;
      if (!game?.makeRounds) continue;
      for (let h = f.memoizedState; h; h = h.next) {
        const s = h.memoizedState;
        if (!Array.isArray(s) || s.length !== game.roundsPerPlay || !s.every(r => r && typeof r === 'object')) continue;
        const about = {
          'whats-missing': r => r.missing.word,
          'memory-match': r => [...new Set(r.cards.filter(c => c.kind === 'word').map(c => c.pair))],
          'feed-luna': r => (r.mode === 'byWord' ? r.cueParts.find(p => p.word)?.word : null),
          'build-sentence': r => r.sentence.text,
          'treasure-read': r => r.passage.id,
          'story-time': r => r.story.id,
          'letter-hunt': r => r.target,
          'bubble-sounds': r => r.letter.letter
        }[game.id];
        return { game: game.id, rounds: s.map(about) };
      }
    }
    return null;
  });
}

const setGrade = grade => page.evaluate((key, grade) => {
  const p = JSON.parse(localStorage.getItem(key));
  p.selectedGrade = grade;
  localStorage.setItem(key, JSON.stringify(p));
}, PROGRESS, grade);

const firstPlays = {};
for (const grade of ['kindergarten', 'grade2']) {
  await setGrade(grade);
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
  const can = await usable(grade);
  console.log(`\n${grade} (tier ${can.tier}), with ${WORDS.join(', ')} picked:`);
  for (const title of ALL_GAMES) {
    const dealt = await play(title);
    if (!dealt) { ok(`${title}: its rounds can be read`, false); continue; }
    firstPlays[`${grade}:${title}`] = dealt.rounds;
    const deck = DECK[title];
    if (!deck) {
      ok(`${title}: letters only, so it can't use a word, and deals as before`, dealt.rounds.length > 0, dealt.rounds.join(' '));
      continue;
    }
    const want = can[deck];
    // a board holds several words: they count together, in board order
    const got = dealt.rounds.flat().filter(Boolean);
    if (want.length === 0) {
      const why = deck === 'memory-match-words' ? 'letter boards' : deck === 'feed-luna-words' ? 'no "first letter of" plates' : 'none in its pool';
      ok(`${title}: nothing here can use them (${why}), and it deals none`, got.every(k => !want.includes(k)), got.join(' | ') || 'no words dealt');
      continue;
    }
    // the play opens with as many of them as it has room for; a board game and
    // Letter Cookies have room for all three, each on its own plate or a board
    const roomy = deck === 'memory-match-words' || deck === 'feed-luna-words';
    const room = roomy ? want.length : Math.min(dealt.rounds.length, want.length);
    const opening = roomy ? got.filter(k => want.includes(k)) : dealt.rounds.slice(0, room);
    const pass = opening.length === room && opening.every(k => want.includes(k)) &&
      (deck !== 'feed-luna-words' || dealt.rounds.slice(0, room).every(Boolean));
    ok(`${title}: its first play opens with them`, pass, `opens with ${opening.join(' | ') || 'none of them'}; ${want.length} usable here`);
  }
}

// ── after "Clear" ──────────────────────────────────────────────────────────
await setGrade('grade2');
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await openSettings();
await page.click(at('open-week-words'));
await page.waitForSelector(at('week-words'));
await page.click(at('week-clear'));
await wait(200);
ok('"Clear" empties them', (await pickedHeading()) === 'Picked: 0 of 10' && (await chips()).length === 0 && (await page.$eval(at('week-clear'), el => el.disabled)));
const savedAfterClear = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).settings.weekWords, PROGRESS);
ok('… and saves that', Array.isArray(savedAfterClear) && savedAfterClear.length === 0);

console.log('\ngrade2, after "Clear":');
for (const title of ALL_GAMES) {
  const deck = DECK[title];
  if (!deck) continue;
  const dealt = await play(title);
  const got = (dealt?.rounds ?? []).flat().filter(Boolean);
  const last = firstPlays[`grade2:${title}`].flat().filter(Boolean);
  const back = got.filter(k => last.includes(k));
  ok(`${title}: nothing from its last play comes back`, back.length === 0, back.length ? `back: ${back.join(' | ')}` : `${got.length} new`);
}

await browser.close();
const failed = results.filter(r => !r).length;
console.log(`\n${failed ? `${failed} FAILED` : 'ALL PASS'} (${results.length} checks)`);
process.exit(failed ? 1 : 0);
