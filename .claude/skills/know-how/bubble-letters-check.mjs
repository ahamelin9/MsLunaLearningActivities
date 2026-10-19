#!/usr/bin/env node
// Bubble Sounds' targets (BUG-21): over many plays at every grade and dial,
// is every letter in the tier's pool asked for, and never twice in one play?
//
//   node .claude/skills/know-how/bubble-letters-check.mjs            # this tree
//   node .claude/skills/know-how/bubble-letters-check.mjs <src-root> # another copy
//
// No browser: it bundles the game the way distractor-check.mjs does and calls
// its makeRounds 400 times per grade × dial. <src-root> is a folder holding a
// `src/` (for example last commit's, from `git archive HEAD src`), which is how
// it proves it can fail: before BUG-21 only the pool's first 12 letters came up.

import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const root = resolve(process.argv[2] ?? repo);
const PLAYS = 400;

const out = mkdtempSync(join(tmpdir(), 'bubble-letters-'));
const entry = `
  export { GAMES } from ${JSON.stringify(join(root, 'src/apps/reading/games/index.ts'))};
  export * as content from ${JSON.stringify(join(root, 'src/apps/reading/engine/content.ts'))};
`;
await build({
  stdin: { contents: entry, resolveDir: repo, loader: 'ts' },
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
const { GAMES, content } = await import(pathToFileURL(join(out, 'bundle.mjs')).href);
rmSync(out, { recursive: true, force: true });

const game = GAMES.find(g => g.id === 'bubble-sounds' || g.title === 'Bubble Sounds');
let failed = false;
for (const grade of ['kindergarten', 'grade1', 'grade2']) {
  for (const difficulty of [1, 2, 3]) {
    const pool = content.lettersFor(content.tierFor(grade, difficulty)).map(l => l.letter);
    const asked = new Set();
    let repeats = 0;
    for (let p = 0; p < PLAYS; p++) {
      const letters = game.makeRounds({ grade, difficulty, count: game.roundsPerPlay }).map(r => r.letter.letter);
      letters.forEach(l => asked.add(l));
      if (new Set(letters).size !== letters.length) repeats += 1;
    }
    const never = pool.filter(l => !asked.has(l));
    const ok = never.length === 0 && repeats === 0;
    if (!ok) failed = true;
    console.log(`${ok ? '✅' : '❌'} ${grade}, dial ${difficulty}: ${asked.size} of ${pool.length} letters asked${never.length ? `; never: ${never.join(' ')}` : ''}${repeats ? `; ${repeats} plays repeated a letter` : ''}`);
  }
}
console.log(failed ? '\nSOME FAILED' : '\nALL PASS');
process.exit(failed ? 1 : 0);
