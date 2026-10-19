// Story check (GAME-2, BUG-9): holds Story Corner's stories (MINI_STORIES in
// src/apps/reading/engine/content.ts) to their rules, then builds plays at
// every grade and dial. Exits 1 if anything breaks one. Run by voice:audit.
//
//   node .claude/skills/know-how/story-check.mjs            # this tree
//   node .claude/skills/know-how/story-check.mjs <src-root> # another copy
//
// The rules:
// - at least 3 stories per tier;
// - every story has a title, a picture, 2–4 lines and a question with exactly
//   one right answer among different answers;
// - the right answer never repeats 3 words in a row from a line of its story
//   (nor is a whole line), so it can't be found by matching text;
// - in the plays the game builds (300 per grade and dial): no story twice in
//   one play (BUG-9), none above the play's tier.
// A self-test plants a copying answer and a short tier first, so a rule that
// stops working fails too.

import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const root = resolve(process.argv[2] ?? repo);

const out = mkdtempSync(join(tmpdir(), 'story-check-'));
const entry = `
  export { MINI_STORIES, tierFor } from ${JSON.stringify(join(root, 'src/apps/reading/engine/content.ts'))};
  export { GAMES } from ${JSON.stringify(join(root, 'src/apps/reading/games/index.ts'))};
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
const { MINI_STORIES, GAMES, tierFor } = await import(pathToFileURL(join(out, 'bundle.mjs')).href);
rmSync(out, { recursive: true, force: true });

const PER_TIER = 3;
const COPY_RUN = 3;
const PLAYS = 300;
const words = text => text.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z'\s]/g, ' ').split(/\s+/).filter(Boolean);
const runs = (list, n) => list.slice(0, Math.max(0, list.length - n + 1)).map((_, i) => list.slice(i, i + n).join(' '));

/** Every broken rule in a set of stories, as lines. */
function storyProblems(stories) {
  const problems = [];
  for (const tier of [1, 2, 3]) {
    const n = stories.filter(s => s.tier === tier).length;
    if (n < PER_TIER) problems.push(`tier ${tier} has ${n} stories, needs ${PER_TIER}`);
  }
  for (const s of stories) {
    if (!s.title || !s.emoji) problems.push(`${s.id}: no title or picture`);
    if (s.lines.length < 2 || s.lines.length > 4) problems.push(`${s.id}: ${s.lines.length} lines`);
    const right = s.answers.filter(a => a.correct);
    if (right.length !== 1) problems.push(`${s.id}: ${right.length} right answers`);
    if (new Set(s.answers.map(a => a.text.toLowerCase())).size !== s.answers.length) problems.push(`${s.id}: two answers the same`);
    const lineRuns = new Set(s.lines.flatMap(l => runs(words(l), COPY_RUN)));
    for (const a of right) {
      const copied = runs(words(a.text), COPY_RUN).filter(r => lineRuns.has(r));
      if (copied.length) problems.push(`${s.id}: the answer "${a.text}" copies "${copied[0]}"`);
      if (s.lines.some(l => words(l).join(' ') === words(a.text).join(' '))) problems.push(`${s.id}: the answer is a whole line`);
    }
  }
  return problems;
}

/** Every repeat or out-of-tier story in plays built by the game. */
function playProblems(game, stories) {
  const problems = [];
  for (const grade of ['kindergarten', 'grade1', 'grade2']) {
    for (const difficulty of [1, 2, 3]) {
      for (let i = 0; i < PLAYS; i++) {
        const rounds = game.makeRounds({ grade, difficulty, count: game.roundsPerPlay });
        const ids = rounds.map(r => r.story.id);
        if (new Set(ids).size !== ids.length) {
          problems.push(`${grade}, dial ${difficulty}: "${ids[0]}" twice in one play`);
          break;
        }
        const tier = tierFor(grade, difficulty);
        const above = rounds.find(r => r.story.tier > tier);
        if (above) {
          problems.push(`${grade}, dial ${difficulty}: "${above.story.id}" is above tier ${tier}`);
          break;
        }
      }
    }
  }
  return problems;
}

const game = GAMES.find(g => g.id === 'story-time');
let failed = false;
const report = (name, problems) => {
  if (problems.length) failed = true;
  console.log(`${problems.length ? '❌' : '✅'} ${name}${problems.length ? `\n   ${[...new Set(problems)].slice(0, 8).join('\n   ')}` : ''}`);
};

// the self-test: each rule must catch a planted break
const planted = [
  { id: 'planted-copy', title: 'x', emoji: 'x', tier: 1, lines: ['The cat sat on the mat.', 'It was warm.'], question: 'q', answers: [{ text: 'It sat on the mat', correct: true }, { text: 'b', correct: false }] }
];
const selfTest = [
  storyProblems([...MINI_STORIES, ...planted]).some(p => p.startsWith('planted-copy')),
  storyProblems(MINI_STORIES.filter(s => s.tier !== 3 || s.id === MINI_STORIES.find(x => x.tier === 3).id)).some(p => p.startsWith('tier 3 has 1'))
];
report('self-test: a planted copy and a short tier are both caught', selfTest.every(Boolean) ? [] : ['a planted break went through']);

report(`${MINI_STORIES.length} stories keep the rules`, storyProblems(MINI_STORIES));
report(`${PLAYS} plays per grade and dial: no story twice in a play (BUG-9), none above its tier`, game ? playProblems(game, MINI_STORIES) : ['no story-time game']);

console.log(failed ? '\nSOME FAILED' : '\nALL PASS');
process.exit(failed ? 1 : 0);
