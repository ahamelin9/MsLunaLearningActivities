// Deck check (GAME-8): does a game keep dealing something new? Plays each of
// the 8 games at every grade and dial with no browser, reads what each round is
// about, and fails if anything comes back before its whole pool has been dealt.
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
const { GAMES, forgetDecks } = await import(pathToFileURL(join(out, 'bundle.mjs')).href);
rmSync(out, { recursive: true, force: true });

/** What a round is about, by game: its target (several, for a board of pairs). */
const TARGETS = {
  'letter-hunt': r => [r.target],
  'bubble-sounds': r => [r.letter.letter],
  'feed-luna': r => [r.answer.toUpperCase()],
  'memory-match': r => [...new Set(r.cards.map(c => c.pair))],
  'build-sentence': r => [r.sentence.text],
  'whats-missing': r => [r.missing.word],
  'treasure-read': r => [r.passage.id],
  'story-time': r => [r.story.id]
};
const GRADES = ['kindergarten', 'grade1', 'grade2'];
const PLAYS = 60;
let failed = false;

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
      const ok = repeated === 0 && soonest >= fair && whole;
      if (!ok) failed = true;
      console.log(
        `${ok ? '✅' : '❌'} ${game.id}, ${grade}, dial ${difficulty}: pool ${pool.size}, ${perPlay} a play, ` +
          `${beforeRepeat} dealt before the first repeat, soonest back after ${soonest}${repeated ? `, ${repeated} plays repeated within` : ''}`
      );
    }
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
