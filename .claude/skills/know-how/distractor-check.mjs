// Distractor check (CNT-1a, CNT-1b): plays every game at every grade ×
// difficulty many times, reads every lesson question and every
// fill-in-the-blank item in the content, and holds each set of choices to the
// rules in src/apps/reading/engine/distractors.ts (ruleBreaks). Exits 1 if any
// rule is broken anywhere.
//
//   node .claude/skills/know-how/distractor-check.mjs            # this tree
//   node .claude/skills/know-how/distractor-check.mjs <src-root> # another copy
//
// <src-root> is a folder holding a `src/` to check, for example last commit's:
//   mkdir -p <scratch>/head && git archive HEAD src | tar -x -C <scratch>/head
// The rules always come from this tree, so an old copy is judged by today's
// rules. That is how the check proves it can fail.
//
// Each game's rounds are read by an adapter below. A game or lesson type with
// no adapter fails the check, so a new one can't slip past it.

import { build } from 'esbuild';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const root = resolve(process.argv[2] ?? repo);
const PLAYS = 300;

// ---- bundle the games, the curriculum and the rules for plain Node ----

const out = mkdtempSync(join(tmpdir(), 'distractor-check-'));
const entry = `
  export { GAMES } from ${JSON.stringify(join(root, 'src/apps/reading/games/index.ts'))};
  export { READING_CURRICULUM } from ${JSON.stringify(join(root, 'src/data/readingCurriculum.ts'))};
  export * as content from ${JSON.stringify(join(root, 'src/apps/reading/engine/content.ts'))};
  export { ruleBreaks } from ${JSON.stringify(join(repo, 'src/apps/reading/engine/distractors.ts'))};
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
const { GAMES, READING_CURRICULUM, content, ruleBreaks } = await import(pathToFileURL(join(out, 'bundle.mjs')).href);
rmSync(out, { recursive: true, force: true });

// ---- the rules themselves must catch a planted bad choice of every kind ----

const planted = [
  ['same sound', { target: { text: 'C' }, wrong: [{ text: 'K' }], letterBy: 'sound' }],
  ['same sound', { target: { text: 'W' }, wrong: [{ text: 'WH' }], letterBy: 'sound' }],
  ['same sound', { target: { text: 'k' }, wrong: [{ text: 'ck' }], letterBy: 'sound' }],
  ['answer twice', { target: { text: 'B' }, wrong: [{ text: 'b' }], letterBy: 'name' }],
  ['on screen', { target: { text: 'cat' }, wrong: [{ text: 'dog' }], onScreen: [{ text: 'dog' }] }],
  ['same picture twice', { target: { text: 'dog', picture: '🐶' }, wrong: [{ text: 'pup', picture: '🐶' }] }],
  ['first-letter giveaway', { target: { text: 'Boat' }, wrong: [{ text: 'Car' }, { text: 'Plane' }], targetKnown: true }],
  ['also fits', { target: { text: 'hot' }, wrong: [{ text: 'Warm' }], blank: { alsoFits: ['warm', 'bright'] } }],
  ['no list', { target: { text: 'hot' }, wrong: [{ text: 'cold' }], blank: {} }]
];
const fair = [
  { target: { text: 'C' }, wrong: [{ text: 'K' }], letterBy: 'name' }, // names differ: see / kay
  { target: { text: 'Boat' }, wrong: [{ text: 'Bike' }, { text: 'Car' }], targetKnown: true },
  // same-type but false: "The sun is cold" stays a fair wrong word
  { target: { text: 'hot' }, wrong: [{ text: 'cold' }], blank: { alsoFits: ['warm', 'bright'] } }
];
const selfTest = [
  ...planted.filter(([rule, set]) => !ruleBreaks(set).some(p => p.startsWith(rule))).map(([rule]) => `missed a planted "${rule}"`),
  ...fair.filter(set => ruleBreaks(set).length > 0).map(set => `flagged a fair set: ${ruleBreaks(set).join('; ')}`)
];
if (selfTest.length > 0) {
  console.log(`❌ The rules themselves are wrong:\n  ${selfTest.join('\n  ')}`);
  process.exit(1);
}

// Same rounds every run, so a failure can be found again.
let seed = 20261010;
Math.random = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

// ---- how each game's round shows its choices ----

const text = t => ({ text: t });
const word = w => ({ text: w.word, picture: w.emoji });
/** Things on screen that are letters only: a picture never shows. */
const letterSet = (target, wrong, letterBy) => ({ target: text(target), wrong: wrong.map(text), letterBy });

const GAME_CHOICES = {
  // hear a letter's name, catch it among look-alikes
  'letter-hunt': r => {
    const wrong = r.bugs.filter(b => !b.isTarget).map(b => b.char);
    return [letterSet(r.target, wrong, 'name')];
  },
  // hear a sound, pop its letter
  'bubble-sounds': r => [letterSet(r.letter.letter, r.decoys, 'sound')],
  // a letter by its name (big or little), by its sound, or a word's first letter
  'feed-luna': r => [
    letterSet(r.answer, r.options.filter(o => o !== r.answer), r.mode === 'toLower' || r.mode === 'toUpper' ? 'name' : 'sound')
  ],
  // pairs: no picture or letter twice on the board
  'memory-match': r => {
    const faces = [...new Map(r.cards.map(c => [c.pair, c])).values()].map(c => ({
      text: c.pair,
      picture: r.cards.find(x => x.pair === c.pair && x.emoji)?.emoji
    }));
    return [{ target: faces[0], wrong: faces.slice(1) }];
  },
  // the desk shows everything except the missing thing
  'whats-missing': r => [
    {
      target: word(r.missing),
      wrong: r.options.filter(o => o.word !== r.missing.word).map(word),
      onScreen: r.items.filter(i => i.word !== r.missing.word).map(word)
    }
  ],
  // the extra tile must not be one of the sentence's own words, nor make it
  // true in place of one of them
  'build-sentence': r => {
    const extra = r.tiles.filter(t => t.isExtra).map(t => text(t.word));
    return [
      {
        target: text(r.sentence.text),
        wrong: extra,
        onScreen: r.words.map(w => text(w.replace(/[^a-zA-Z']/g, ''))),
        ...(extra.length > 0 && { blank: { alsoFits: r.sentence.alsoFits } })
      }
    ];
  },
  // a fill-in-the-blank about a passage: the wrong words are not in the
  // statement already, and not on its list of words that also fit. Words of
  // the passage are fair wrong words: finding the right one is the reading.
  'treasure-read': r =>
    r.kind === 'cloze'
      ? [
          {
            target: text(r.answer),
            wrong: r.options.filter(o => o !== r.answer).map(text),
            onScreen: r.statement.split(/\s+/).map(w => text(w.replace(/[^a-zA-Z']/g, ''))),
            blank: { alsoFits: r.blank?.alsoFits }
          }
        ]
      : [],
  // one question with fixed answers
  'story-time': r => [
    {
      target: text(r.story.answers.find(a => a.correct).text),
      wrong: r.story.answers.filter(a => !a.correct).map(a => text(a.text))
    }
  ]
};

// ---- how each kind of lesson question shows its choices ----

const right = options => options.find(o => o.isCorrect);
const wrongOf = options => options.filter(o => !o.isCorrect);
const picture = o => ({ text: o.text, picture: o.imageEmoji });

const LESSON_CHOICES = {
  'sound-to-letter': q => letterSet(q.targetLetter, wrongOf(q.options).map(o => o.letter), 'sound'),
  'find-letter': q => letterSet(q.targetLetter, wrongOf(q.options).map(o => o.letter), 'name'),
  // the letters are on screen, so the child knows the word: no first-letter giveaway
  'blend-and-read': q => ({ target: picture(right(q.options)), wrong: wrongOf(q.options).map(picture), targetKnown: true }),
  // the word is on screen
  'read-and-match': q => ({ target: picture(right(q.options)), wrong: wrongOf(q.options).map(picture), targetKnown: true }),
  // the word is heard
  'sight-word-reader': q => ({
    target: text(right(q.options).word),
    wrong: wrongOf(q.options).map(o => text(o.word)),
    targetKnown: true
  }),
  'rhyme-match': q => ({
    target: { text: q.options.find(o => o.isRhyme).word, picture: q.options.find(o => o.isRhyme).emoji },
    wrong: q.options.filter(o => !o.isRhyme).map(o => ({ text: o.word, picture: o.emoji })),
    onScreen: [{ text: q.targetWord, picture: q.targetEmoji }]
  }),
  'sentence-comprehension': q => ({ target: picture(right(q.options)), wrong: wrongOf(q.options).map(picture) }),
  'story-read': q => ({
    target: text(q.comprehensionQuestion.options[q.comprehensionQuestion.correctIndex]),
    wrong: q.comprehensionQuestion.options.filter((_, i) => i !== q.comprehensionQuestion.correctIndex).map(text)
  })
};

// ---- run ----

const GRADES = ['kindergarten', 'grade1', 'grade2'];
const DIFFICULTIES = [1, 2, 3];
const found = new Map(); // "where · rule" -> { count, example }
let sets = 0;

const note = (where, set) => {
  sets++;
  for (const problem of ruleBreaks(set)) {
    const rule = problem.split(':')[0];
    const key = `${where} · ${rule}`;
    const entry = found.get(key) ?? { count: 0, examples: new Set() };
    entry.count++;
    entry.examples.add(problem.split(': ').slice(1).join(': '));
    found.set(key, entry);
  }
};

for (const game of GAMES) {
  const adapter = GAME_CHOICES[game.id];
  if (!adapter) {
    found.set(`${game.id} · no adapter`, { count: 1, examples: new Set(['add this game to GAME_CHOICES in the check']) });
    continue;
  }
  for (const grade of GRADES) {
    for (const difficulty of DIFFICULTIES) {
      for (let play = 0; play < PLAYS; play++) {
        const rounds = game.makeRounds({ grade, difficulty, count: game.roundsPerPlay });
        for (const round of rounds) for (const set of adapter(round)) note(`${game.id} (${grade}, dial ${difficulty})`, set);
      }
    }
  }
}

for (const grade of GRADES) {
  for (const skill of READING_CURRICULUM[grade] ?? []) {
    for (const lesson of skill.lessons) {
      for (const q of lesson.questions) {
        const adapter = LESSON_CHOICES[q.type];
        if (!adapter) found.set(`${q.id} · no adapter`, { count: 1, examples: new Set([`add "${q.type}" to LESSON_CHOICES`]) });
        else note(`lesson ${lesson.id} ${q.id}`, adapter(q));
      }
    }
  }
}

// ---- every fill-in-the-blank item, played or not: its list, and its own wrong words ----

const FILL_INS = [
  ...(content.SENTENCES ?? []).map(s => [`sentence "${s.text}"`, s]),
  // Treasure Path's passages (GAME-1a)
  ...(content.PASSAGES ?? []).flatMap(p => p.blanks.map(b => [`passage ${p.id} "${b.text}"`, b]))
];
for (const [where, { text: said, key, decoys, alsoFits }] of FILL_INS) {
  note(where, {
    target: text(key),
    wrong: (decoys ?? []).map(text),
    // the statement's other words are on screen around the gap
    onScreen: said
      .split(/\s+/)
      .map(w => w.replace(/[^a-zA-Z']/g, ''))
      .filter(w => w.toLowerCase() !== key.toLowerCase())
      .map(text),
    blank: { alsoFits }
  });
}

console.log(`Checked ${sets} sets of choices from ${root === repo ? 'this tree' : root}.`);
if (found.size === 0) {
  console.log('✅ No rule broken.');
  process.exit(0);
}
// one line per game or lesson and rule, with the grades and dials it broke at
const byRule = new Map();
for (const [key, { count, examples }] of found) {
  const [where, rule] = key.split(' · ');
  const k = `${where.replace(/ \(.*\)$/, '')} · ${rule}`;
  const e = byRule.get(k) ?? { count: 0, examples: new Set(), at: [] };
  e.count += count;
  for (const x of examples) e.examples.add(x);
  const at = where.match(/\((.*)\)/)?.[1];
  if (at) e.at.push(at.replace('kindergarten', 'K').replace('grade', 'g').replace(', dial ', '/'));
  byRule.set(k, e);
}
console.log(`❌ ${[...byRule.values()].reduce((n, e) => n + e.count, 0)} broken rules:`);
for (const [key, { count, examples, at }] of [...byRule].sort()) {
  console.log(`  ${key} ×${count}${at.length ? ` [${at.join(' ')}]` : ''}`);
  // a few different examples, sorted so the same run prints the same lines
  for (const x of [...examples].sort().slice(0, 4)) console.log(`      ${x}`);
}
process.exit(1);
