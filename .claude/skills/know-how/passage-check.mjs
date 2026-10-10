// Passage check (GAME-1a, GAME-1b): holds Treasure Path's passages (PASSAGES
// in src/apps/reading/engine/content.ts) to their writing rules, then plays
// the game at every grade and dial and holds its rounds to theirs. Exits 1 if
// anything breaks one.
//
//   node .claude/skills/know-how/passage-check.mjs            # this tree
//   node .claude/skills/know-how/passage-check.mjs <src-root> # another copy
//
// The rules:
// - 6 passages per grade, of that grade's length in sentences;
// - each passage has at least one true/false and one fill-in-the-blank;
// - no statement copies 4 or more words in a row from its passage;
// - every blank has its list of words that also fit (CNT-1b), its key is a
//   word of its statement, and no wrong word is on the list or in the statement;
// - the words beside a blank never sit beside its answer in the passage, so
//   the answer can't be found by matching text ("a ___ flower" against
//   "a yellow flower").
// And for the rounds the game builds:
// - every play has both kinds of question and no passage twice, all of them
//   from the play's grade;
// - a fill-in-the-blank can't be solved by matching the words beside its gap
//   against the passage, and a claim copies no 4 words in a row;
// - "Read it to me" never says the missing word before the round is solved.
// A self-test plants one bad passage or play per rule first, so a rule that
// stops working fails too. The wrong words are also held to every distractor rule by
// distractor-check.mjs.

import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const root = resolve(process.argv[2] ?? repo);

const out = mkdtempSync(join(tmpdir(), 'passage-check-'));
const entry = `
  export { PASSAGES } from ${JSON.stringify(join(root, 'src/apps/reading/engine/content.ts'))};
  export { GAMES } from ${JSON.stringify(join(root, 'src/apps/reading/games/index.ts'))};
`;
await build({
  stdin: { contents: entry, resolveDir: repo, loader: 'ts' },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: join(out, 'bundle.mjs'),
  loader: { '.scss': 'empty', '.css': 'empty' },
  nodePaths: [join(repo, 'node_modules')],
  jsx: 'automatic',
  logLevel: 'error'
});
const { PASSAGES, GAMES } = await import(pathToFileURL(join(out, 'bundle.mjs')).href);
rmSync(out, { recursive: true, force: true });

const PER_GRADE = 6;
const PLAYS = 300;
const GAP = '_____';
const LENGTH = { kindergarten: [2, 2], grade1: [3, 3], grade2: [4, 5] };
const COPY_RUN = 4;

const words = text =>
  text
    .toLowerCase()
    .replace(/[^a-z'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
const runs = (list, n) => list.slice(0, list.length - n + 1).map((_, i) => list.slice(i, i + n).join(' '));
const same = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** A pair of words beside position `at` that also stands in the passage, if any. */
const matchBeside = (said, at, passagePairs) =>
  [at > 0 && `${said[at - 1]} ${said[at]}`, at < said.length - 1 && `${said[at]} ${said[at + 1]}`]
    .filter(Boolean)
    .find(pair => passagePairs.has(pair));

/** Every rule one passage breaks, in words. */
function passageBreaks(p) {
  const breaks = [];
  const [min, max] = LENGTH[p.grade] ?? [0, Infinity];
  if (p.lines.length < min || p.lines.length > max) {
    breaks.push(`length: ${p.lines.length} sentences, ${p.grade} wants ${min === max ? min : `${min}–${max}`}`);
  }
  if (!(p.truth?.length > 0)) breaks.push('no true/false statement');
  if (!(p.blanks?.length > 0)) breaks.push('no fill-in-the-blank statement');

  const passage = words(p.lines.join(' '));
  const passageRuns = new Set(runs(passage, COPY_RUN));
  const passagePairs = new Set(runs(passage, 2));
  const statements = [...(p.truth ?? []).map(t => t.claim), ...(p.blanks ?? []).map(b => b.text)];
  for (const s of statements) {
    const copied = runs(words(s), COPY_RUN).find(r => passageRuns.has(r));
    if (copied) breaks.push(`copies the passage: "${s}" has "${copied}"`);
  }

  for (const b of p.blanks ?? []) {
    if (!Array.isArray(b.alsoFits)) breaks.push(`no list: "${b.text}" doesn't say which words also fit`);
    for (const d of b.decoys ?? []) {
      if (b.alsoFits?.some(f => same(f, d))) breaks.push(`also fits: "${d}" would make "${b.text}" true too`);
    }
    const said = words(b.text);
    const at = said.indexOf(b.key.toLowerCase());
    if (at < 0) {
      breaks.push(`no key: "${b.key}" isn't a word of "${b.text}"`);
      continue;
    }
    for (const d of b.decoys ?? []) {
      if (said.includes(d.toLowerCase())) breaks.push(`on screen: "${d}" is already in "${b.text}"`);
    }
    const match = matchBeside(said, at, passagePairs);
    if (match) breaks.push(`found by matching: "${match}" is in the passage, beside the gap in "${b.text}"`);
  }
  return breaks;
}

/** Every rule one round breaks, in words. */
function roundBreaks(r, grade) {
  if (!r.passage) return ['no passage: the round has no passage to read'];
  const breaks = [];
  if (r.passage.grade !== grade) breaks.push(`wrong grade: ${r.passage.id} in a ${grade} play`);
  const passage = words(r.passage.lines.join(' '));
  if (r.kind === 'cloze') {
    // the statement as the child sees it, with the answer put back in the gap
    const said = words(r.statement.replace(GAP, ` ${r.answer} `));
    const match = matchBeside(said, said.indexOf(r.answer.toLowerCase()), new Set(runs(passage, 2)));
    if (match) breaks.push(`found by matching: "${match}" is in the passage, beside the gap in "${r.statement}"`);
    const lines = new Set(r.passage.lines);
    const tells = (r.readBefore ?? []).find(
      p => p.text && !lines.has(p.text) && words(p.text).includes(r.answer.toLowerCase())
    );
    if (tells) breaks.push(`read it to me: "${tells.text}" says "${r.answer}" before it is solved`);
  } else {
    const copied = runs(words(r.statement), COPY_RUN).find(run => new Set(runs(passage, COPY_RUN)).has(run));
    if (copied) breaks.push(`copies the passage: "${r.statement}" has "${copied}"`);
  }
  return breaks;
}

/** Every rule one play breaks, in words. */
function playBreaks(rounds) {
  const breaks = [];
  const kinds = new Set(rounds.map(r => r.kind));
  if (rounds.length > 1 && kinds.size < 2) breaks.push(`one kind only: every round is ${[...kinds][0]}`);
  const ids = rounds.map(r => r.passage?.id);
  const twice = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (twice.length > 0) breaks.push(`passage twice: ${[...new Set(twice)].join(', ')}`);
  return breaks;
}

// ---- self-test: one planted bad passage per rule ----

const good = {
  id: 'planted',
  grade: 'kindergarten',
  emoji: '🦉',
  lines: ['Luna has a red ball.', 'She rolls it to the cat.'],
  truth: [{ claim: 'The ball is red.', isTrue: true }],
  blanks: [{ text: "The cat gets Luna's ball.", key: 'ball', decoys: ['hat', 'cake'], alsoFits: ['toy'] }]
};
const blank = change => ({ ...good, blanks: [{ ...good.blanks[0], ...change }] });
const planted = [
  ['length', { ...good, lines: [...good.lines, 'The cat is happy.'] }],
  ['no true/false', { ...good, truth: [] }],
  ['no fill-in-the-blank', { ...good, blanks: [] }],
  ['copies the passage', { ...good, truth: [{ claim: 'She rolls it to the dog.', isTrue: false }] }],
  ['no list', blank({ alsoFits: undefined })],
  ['also fits', blank({ decoys: ['toy', 'hat'] })],
  ['no key', blank({ key: 'ball', text: "The cat gets Luna's toy." })],
  ['on screen', blank({ decoys: ['cat', 'hat'] })],
  ['found by matching', blank({ text: 'Luna has a red ball.', key: 'red', decoys: ['blue'], alsoFits: [] })]
];
const tf = { kind: 'truefalse', passage: good, statement: 'The ball is red.', answer: 'True', readBefore: [] };
const cloze = {
  kind: 'cloze',
  passage: good,
  statement: `The cat gets Luna's ${GAP}.`,
  answer: 'ball',
  readBefore: [{ text: 'Luna has a red ball.' }, { text: "The cat gets Luna's..." }, { pause: 300 }, { text: 'what?' }]
};
const other = { ...good, id: 'other' };
const plantedRounds = [
  ['wrong grade', { ...tf, passage: { ...good, grade: 'grade2' } }],
  ['found by matching', { ...cloze, statement: `Luna has a red ${GAP}.` }],
  ['read it to me', { ...cloze, readBefore: [...cloze.readBefore, { text: "The cat gets Luna's ball." }] }],
  ['copies the passage', { ...tf, statement: 'She rolls it to the dog.' }]
];
const plantedPlays = [
  ['one kind only', [tf, { ...tf, passage: other }]],
  ['passage twice', [tf, cloze]]
];
const selfTest = [
  ...plantedRounds
    .filter(([rule, r]) => !roundBreaks(r, 'kindergarten').some(b => b.startsWith(rule)))
    .map(([rule]) => `missed a planted "${rule}" round`),
  ...plantedPlays.filter(([rule, play]) => !playBreaks(play).some(b => b.startsWith(rule))).map(([rule]) => `missed a planted "${rule}" play`),
  ...[tf, cloze].flatMap(r => roundBreaks(r, 'kindergarten')).map(b => `flagged a fair round: ${b}`),
  ...playBreaks([tf, { ...cloze, passage: other }]).map(b => `flagged a fair play: ${b}`),
  ...planted.filter(([rule, p]) => !passageBreaks(p).some(b => b.startsWith(rule))).map(([rule]) => `missed a planted "${rule}"`),
  ...passageBreaks(good).map(b => `flagged a fair passage: ${b}`)
];
if (selfTest.length > 0) {
  console.log(`❌ The rules themselves are wrong:\n  ${selfTest.join('\n  ')}`);
  process.exit(1);
}

// ---- the real passages ----

const found = [];
if (!Array.isArray(PASSAGES)) found.push('no PASSAGES in content.ts');
for (const grade of Object.keys(LENGTH)) {
  const n = (PASSAGES ?? []).filter(p => p.grade === grade).length;
  if (n !== PER_GRADE) found.push(`${grade}: ${n} passages, wants ${PER_GRADE}`);
}
const ids = (PASSAGES ?? []).map(p => p.id);
for (const id of new Set(ids.filter((id, i) => ids.indexOf(id) !== i))) found.push(`${id}: id used twice`);
for (const p of PASSAGES ?? []) for (const b of passageBreaks(p)) found.push(`${p.id}: ${b}`);

// ---- the game's rounds, many plays at every grade and dial ----

const treasure = (GAMES ?? []).find(g => g.id === 'treasure-read');
let plays = 0;
const roundFound = new Map(); // rule -> { count, at: grade/dial set, examples }
if (!treasure) found.push('no treasure-read game');
else {
  for (const grade of Object.keys(LENGTH)) {
    for (const difficulty of [1, 2, 3]) {
      for (let play = 0; play < PLAYS; play++) {
        plays++;
        const rounds = treasure.makeRounds({ grade, difficulty, count: treasure.roundsPerPlay });
        const problems = [...playBreaks(rounds), ...rounds.flatMap(r => roundBreaks(r, grade))];
        for (const b of problems) {
          const rule = b.split(':')[0];
          const e = roundFound.get(rule) ?? { count: 0, at: new Set(), examples: new Set() };
          e.count++;
          e.at.add(`${grade.replace('kindergarten', 'K').replace('grade', 'g')}/${difficulty}`);
          e.examples.add(b.split(': ').slice(1).join(': '));
          roundFound.set(rule, e);
        }
      }
    }
  }
}
// one line per rule, with the grades and dials it broke at and a few examples
for (const [rule, { count, at, examples }] of [...roundFound].sort()) {
  const shown = [...examples].sort().slice(0, 3).map(x => `\n      ${x}`).join('');
  found.push(`rounds · ${rule} ×${count} [${[...at].join(' ')}]${shown}`);
}

const statements = (PASSAGES ?? []).reduce((n, p) => n + p.truth.length + p.blanks.length, 0);
console.log(`Checked ${PASSAGES?.length ?? 0} passages, ${statements} statements and ${plays} plays, from ${root === repo ? 'this tree' : root}.`);
if (found.length === 0) {
  console.log('✅ Every passage and round keeps the rules.');
  process.exit(0);
}
console.log(`❌ ${found.length} broken:\n  ${found.join('\n  ')}`);
process.exit(1);
