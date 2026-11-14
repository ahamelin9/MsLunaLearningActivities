// Deck check (GAME-8): does a game keep dealing something new, about 20
// answers a play (CUR-15)? Plays each of
// the 8 games at every grade and dial with no browser, reads what each round is
// about, and fails if anything comes back before its whole pool has been dealt.
// Words Off the Page, Treasure Path and Story Corner hold two plays of their
// own, so the next play is all new (CUR-17a–c).
// Then every lesson (CUR-12): 20 rounds a play (a story lesson 2), every
// question once before any comes again, never the same one twice in a row, a
// question missed back in the next play, and "about 7 min" (a story's "about
// 3 min") before any play is timed.
//
//   node .claude/skills/know-how/deck-check.mjs            # this tree
//   node .claude/skills/know-how/deck-check.mjs <src-root> # another copy
//
// <src-root> holds a `src/` to judge, for example the last commit's:
//   mkdir -p <scratch>/head && git archive HEAD src | tar -x -C <scratch>/head
// It fails there: that is how it proves it can fail.

import { build } from 'esbuild';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const root = resolve(process.argv[2] ?? repo);
const out = mkdtempSync(join(tmpdir(), 'deck-check-'));
const deckFile = join(root, 'src/apps/reading/engine/deck.ts');
await build({
  stdin: {
    // an old copy has no deck, so nothing to forget between plays
    contents: `export { GAMES } from ${JSON.stringify(join(root, 'src/apps/reading/games/index.ts'))};
      export { lessonsFor } from ${JSON.stringify(join(root, 'src/apps/reading/engine/lessons.ts'))};
      export { estimateMinutes } from ${JSON.stringify(join(root, 'src/apps/reading/engine/times.ts'))};
      ${existsSync(deckFile) ? `export { forgetDecks } from ${JSON.stringify(deckFile)};` : 'export const forgetDecks = () => {};'}`,
    resolveDir: repo,
    loader: 'ts'
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: join(out, 'bundle.mjs'),
  loader: { '.scss': 'empty', '.css': 'empty' },
  alias: { '@': join(root, 'src') },
  nodePaths: [join(repo, 'node_modules')],
  jsx: 'automatic',
  logLevel: 'error'
});
// a little of a browser's storage, so the memory path runs too
const saved = new Map();
globalThis.localStorage = {
  getItem: k => saved.get(k) ?? null,
  setItem: (k, v) => saved.set(k, v),
  removeItem: k => saved.delete(k)
};
const { GAMES, lessonsFor, estimateMinutes, forgetDecks } = await import(pathToFileURL(join(out, 'bundle.mjs')).href);
rmSync(out, { recursive: true, force: true });

/** What a round is about, by game: its target (several, for a board of pairs). */
const TARGETS = {
  'letter-hunt': r => [r.target],
  'bubble-sounds': r => [r.letter.letter],
  'feed-luna': r => [r.answer.toUpperCase()],
  'memory-match': r => [...new Set(r.cards.map(c => c.pair))],
  'build-sentence': r => [r.sentence.text],
  'whats-missing': r => [r.missing.word],
  // each stone asks two questions about one passage (CUR-15): the passage
  // counts once, on its first question
  'treasure-read': r => (r.kind === 'truefalse' ? [r.passage.id] : []),
  'story-time': r => [r.story.id]
};
const GRADES = ['kindergarten', 'grade1', 'grade2'];
const PLAYS = 60;
let failed = false;

/**
 * How many answers a round asks for (CUR-15: about 20 a play, as a lesson): a
 * board's pairs, a story's word hunt and question; one for the rest.
 */
const ANSWERS = {
  'memory-match': r => r.pairCount,
  'story-time': () => 2
};
const ABOUT_20 = [16, 24];
/**
 * Games whose pool holds two plays of its own at every grade and dial, so the
 * next play is all new (CUR-17a–c): Words Off the Page 40 sentences a tier,
 * Treasure Path 20 passages a grade, Story Corner 18 stories at a tier and below.
 */
const TWO_PLAYS = ['build-sentence', 'treasure-read', 'story-time'];

for (const game of GAMES) {
  const targets = TARGETS[game.id];
  if (!targets) {
    console.log(`❌ ${game.id}: no adapter in deck-check.mjs`);
    failed = true;
    continue;
  }
  for (const grade of GRADES) {
    for (const difficulty of [1, 2, 3]) {
      // each setting from a fresh save; what another dial dealt would count
      // as seen and look like a short first cycle here
      forgetDecks();
      // the pool, learned by playing, then each play's targets in order
      const plays = Array.from({ length: PLAYS }, () =>
        game.makeRounds({ grade, difficulty, count: game.roundsPerPlay }).flatMap(targets)
      );
      const pool = new Set(plays.flat());
      const flat = plays.flat();
      // how soon each target comes back
      const last = new Map();
      let soonest = Infinity;
      flat.forEach((t, i) => {
        if (last.has(t)) soonest = Math.min(soonest, i - last.get(t));
        last.set(t, i);
      });
      const perPlay = plays[0].length;
      // the fair gap: at least a deal's worth, if the pool has room for two
      // deals; a smaller pool has to bring something straight back
      const fair = pool.size >= 2 * perPlay ? perPlay : 1;
      // nothing twice in one play unless the pool is too small to allow it
      const repeated = plays.filter(p => new Set(p).size < Math.min(p.length, pool.size)).length;
      // the first cycle: every target seen once before any comes twice
      const firstRepeat = flat.findIndex((t, i) => flat.indexOf(t) !== i);
      const beforeRepeat = firstRepeat === -1 ? flat.length : firstRepeat;
      const whole = beforeRepeat >= Math.min(pool.size - perPlay, flat.length);
      // about 20 answers a play (CUR-15)
      const rounds = game.makeRounds({ grade, difficulty, count: game.roundsPerPlay });
      const answers = rounds.reduce((n, r) => n + (ANSWERS[game.id]?.(r) ?? 1), 0);
      const long = answers >= ABOUT_20[0] && answers <= ABOUT_20[1];
      // Treasure Path's stones: each passage asked true-or-false, then its missing word
      const stones =
        game.id !== 'treasure-read' ||
        rounds.every((r, i) => r.kind === (i % 2 ? 'cloze' : 'truefalse') && (i % 2 === 0 || r.passage.id === rounds[i - 1].passage.id));
      // two plays of its own: the next play is all new (CUR-17a–c)
      const roomy = !TWO_PLAYS.includes(game.id) || pool.size >= 2 * perPlay;
      const ok = repeated === 0 && soonest >= fair && whole && long && stones && roomy;
      if (!ok) failed = true;
      console.log(
        `${ok ? '✅' : '❌'} ${game.id}, ${grade}, dial ${difficulty}: pool ${pool.size}, ${perPlay} a play, ` +
          `${beforeRepeat} dealt before the first repeat, soonest back after ${soonest}${repeated ? `, ${repeated} plays repeated within` : ''}, ` +
          `${answers} answers${long ? '' : ` (want ${ABOUT_20.join(' to ')})`}${stones ? '' : ', a stone not asked twice about one passage'}` +
          `${roomy ? '' : ` (want a pool of two plays, ${2 * perPlay})`}`
      );
    }
  }
}

// ---- lessons (CUR-12) ----
const LESSON_PLAYS = 20;
for (const grade of GRADES) {
  for (const lesson of lessonsFor(grade)) {
    forgetDecks();
    const story = lesson.makeRounds({ count: 1 })[0]?.type === 'story-read';
    const want = story ? 2 : 20;
    const pool = new Set(Array.from({ length: 10 }, () => lesson.makeRounds({ count: 50 }).map(q => q.id)).flat()).size;
    forgetDecks();
    const plays = [];
    let missedBack = true;
    let sharedIds = false;
    for (let n = 0; n < LESSON_PLAYS; n++) {
      const play = lesson.makeRounds({ count: lesson.roundsPerPlay });
      const ids = play.map(q => q.id);
      // two questions with one id are one to the deck (k-rh-pairs had two "sun"s)
      if (new Set(play).size !== new Set(ids).size) sharedIds = true;
      // the play before missed its first question: it's back, and asked
      // twice if this play goes round the lesson a second time
      if (n > 0) {
        const missed = plays[n - 1][0];
        const times = ids.filter(id => id === missed).length;
        if (times < (pool < want ? 2 : 1)) missedBack = false;
      }
      lesson.lesson.missed(play[0]);
      plays.push(ids);
    }
    const sizes = new Set(plays.map(p => p.length));
    const inARow = plays.filter(p => p.some((id, i) => i > 0 && id === p[i - 1])).length;
    // every question once before any comes twice, within a play
    const early = plays.filter(p => {
      const firstTwice = p.findIndex((id, i) => p.indexOf(id) !== i);
      return firstTwice !== -1 && firstTwice < Math.min(pool, p.length);
    }).length;
    const minutes = estimateMinutes(lesson);
    const ok = lesson.roundsPerPlay === want && sizes.size === 1 && sizes.has(want) && inARow === 0 && early === 0 && missedBack && !sharedIds && minutes === (story ? 3 : 7);
    if (!ok) failed = true;
    console.log(
      `${ok ? '✅' : '❌'} lesson ${lesson.id}: pool ${pool}, ${[...sizes].join('/')} a play (want ${want}), about ${minutes} min` +
        `${inARow ? `, ${inARow} plays with one twice in a row` : ''}${early ? `, ${early} plays repeating before the lesson ran out` : ''}${missedBack ? '' : ', a missed one not back'}${sharedIds ? ', two questions share an id' : ''}`
    );
  }
}

// the memory is saved, so it lasts across a reload, and the reset clears it
const after = saved.has('ms_luna_seen_v1');
console.log(after ? '✅ the deck saves under its own key' : '❌ nothing saved under ms_luna_seen_v1');
forgetDecks();
const cleared = !saved.has('ms_luna_seen_v1');
console.log(cleared ? '✅ the reset forgets it' : '❌ the reset left the deck saved');
if (!after || !cleared) failed = true;

console.log(failed ? '\nSOME FAILED' : '\nALL PASS');
process.exit(failed ? 1 : 0);
