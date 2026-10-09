// Would anything Ms. Luna says fall back to the robot voice?
//
// This exists because the first version of this check was written from the same
// notes as the inventory, so it shared its blind spots and passed while every
// one of Luna's own lines was quietly using the browser voice. This one does
// not enumerate anything itself: it loads the real pronunciation module against
// the real manifest, calls the real speak*() methods with every string the app
// can reach, and reports any utterance that reaches speechSynthesis.
//
//   npm run voice:audit

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const tmp = join(root, '.voice-tmp');
const esbuild = join(root, 'node_modules/.bin/esbuild');

const bundle = (entry, out) =>
  execFileSync(esbuild, [
    entry, '--bundle', '--platform=neutral', '--format=esm',
    `--outfile=${join(tmp, out)}`,
    `--define:import.meta.env={"BASE_URL":"/","DEV":false}`,
    // the games come in for their rounds and missions, with their components
    // and stylesheets attached; none of that is ever rendered here
    '--jsx=automatic', '--loader:.scss=empty', '--loader:.css=empty',
    '--log-level=warning'
  ], { cwd: root });

// entry points: the voice itself, and everything that holds speakable strings
const ENTRY = join(tmp, '_audit-entry.ts');
execFileSync('/bin/sh', ['-c', `cat > ${JSON.stringify(ENTRY)} <<'TS'
export { pronunciation } from '../src/utils/pronunciation';
export * as curriculum from '../src/data/readingCurriculum';
export * as content from '../src/apps/reading/engine/content';
export * as luna from '../src/apps/reading/engine/luna';
export { LETTER_PHONICS, TEAM_PHONICS } from '../src/utils/phonics';
export { GAMES } from '../src/apps/reading/games';
export { lessonsFor } from '../src/apps/reading/engine/lessons';
export { STICKERS } from '../src/apps/reading/engine/stickers';
TS`]);
bundle(ENTRY, '_audit-entry.mjs');

// --- the smallest browser the module will accept ---
const fellBack = [];
globalThis.AudioBuffer = class { constructor(d) { this.duration = d ?? 0.5; } };
globalThis.AudioContext = class {
  constructor() { this.state = 'running'; this.destination = {}; }
  resume() { return Promise.resolve(); }
  createBufferSource() { return { buffer: null, connect() {}, start() { this.onended && setTimeout(this.onended, 0); }, onended: null, stop() {} }; }
  createGain() { return { gain: { value: 1 }, connect() {} }; }
  decodeAudioData(b, ok) { const x = new globalThis.AudioBuffer(0.6); if (ok) { ok(x); return undefined; } return Promise.resolve(x); }
};
globalThis.window = globalThis;
globalThis.speechSynthesis = {
  cancel() {}, getVoices() { return [{ name: 'Samantha', lang: 'en-US' }]; },
  speak(u) { fellBack.push(u.text); u.onend && setTimeout(u.onend, 0); }
};
globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
globalThis.addEventListener = () => {}; globalThis.removeEventListener = () => {};
globalThis.fetch = async url => {
  const path = join(root, 'public', url.replace(/^\/+/, ''));
  if (!existsSync(path)) return { ok: false, status: 404, json: async () => null, arrayBuffer: async () => new ArrayBuffer(0) };
  const buf = readFileSync(path);
  return { ok: true, status: 200, json: async () => JSON.parse(buf.toString('utf8')),
           arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) };
};

const mod = await import(`${join(tmp, '_audit-entry.mjs')}?v=${Date.now()}`);
const { pronunciation, content, curriculum, luna, LETTER_PHONICS, TEAM_PHONICS, GAMES, STICKERS, lessonsFor } = mod;

// --- the one mistake this audit cannot catch by running things ---
//
// A template literal handed to speech ("Tap the ${word}.") is a new sentence
// for every value, and none of them was ever rendered. The games and lessons
// built several of those, so every call site is read for the pattern. Say it
// as parts instead — [{ text: 'Tap the' }, { word }] — and each part is a clip.
const SPEECH_TEMPLATE = [
  /\b(?:speak\w*|say)\s*\(\s*`[^`]*\$\{/g,
  /\b(?:text|spoken|hint|lunaLine)\s*:\s*`[^`]*\$\{/g
];
const sourceFiles = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) sourceFiles(p, out);
    else if (/\.tsx?$/.test(e) && !/utils[/\\](pronunciation|speechParts|voiceClips|voiceKeys)\.ts$/.test(p)) out.push(p);
  }
  return out;
};
const sources = sourceFiles(join(root, 'src')).map(path => ({ path, src: readFileSync(path, 'utf8') }));
const templates = [];
for (const { path, src } of sources) {
  for (const re of SPEECH_TEMPLATE) {
    for (const m of src.matchAll(re)) {
      templates.push(`${path.slice(root.length + 1)}:${src.slice(0, m.index).split('\n').length}`);
    }
  }
}
if (templates.length) {
  console.error('✗ speech built from a template literal can never have a rendered clip:\n');
  for (const t of templates) console.error(`    ${t}`);
  console.error('\n  Say it as parts instead: [{ text: \'Tap the\' }, { word }].\n');
  process.exit(1);
}
console.log('• no speech is built from template literals');

if (!(await pronunciation.init())) {
  console.error('✗ no rendered voice found — run `npm run voice:render` first');
  process.exit(1);
}

// --- every string the app can reach, however it is reached ---
const calls = [];
const push = (what, how) => calls.push({ what, how });

for (const e of [...Object.values(LETTER_PHONICS), ...Object.values(TEAM_PHONICS)]) {
  push(e.letter, o => pronunciation.speakLetterSound(e.letter, o));
  push(e.letter, o => pronunciation.speakLetterName(e.letter, o));
  push(e.exampleWord, o => pronunciation.speakWord(e.exampleWord, o));
  if (e.alternate) push(`${e.letter}+alt`, o => pronunciation.speakLetterSound(e.letter, { ...o, alternate: true }));
}
for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
  push(c, o => pronunciation.speakLetterSound(c, o));
  push(c, o => pronunciation.speakLetterName(c, o));
}
for (const w of content.WORDS) push(w.word, o => pronunciation.speakWord(w.word, o));
for (const s of content.SENTENCES) {
  push(s.text, o => pronunciation.speakSentence(s.text, o));
  for (const word of s.text.split(/\s+/)) {
    for (const v of [word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ''), word.replace(/[^a-zA-Z0-9]/g, '')]) {
      if (v) push(v, o => pronunciation.speakWord(v, o));
    }
  }
}
for (const st of content.MINI_STORIES) {
  if (st.title) push(st.title, o => pronunciation.speakText(st.title, o));
  if (st.question) push(st.question, o => pronunciation.speakSentence(st.question, o));
  for (const line of st.lines ?? []) {
    push(line, o => pronunciation.speakSentence(line, o));
    for (const word of line.split(/\s+/)) {
      const v = word.replace(/[^a-zA-Z0-9']/g, '');
      if (v) push(v, o => pronunciation.speakWord(v, o));
    }
  }
}
// Luna's own dialogue, walked generically so a new bank is covered for free
const lunaLines = [];
const walk = v => {
  if (typeof v === 'string') { if (/[a-zA-Z]/.test(v) && /\s/.test(v)) lunaLines.push(v); return; }
  if (Array.isArray(v)) { v.forEach(walk); return; }
  if (v && typeof v === 'object') Object.values(v).forEach(walk);
};
walk(luna.GENERAL); walk(luna.PER_GAME); walk(luna.LUNA_PHRASES);
for (const line of new Set(lunaLines)) push(line, o => pronunciation.speakText(line, o));

// Strings the games build at runtime. Listed explicitly because the audit
// cannot see a template literal by walking data — and these were the last
// source of the half-second of robot voice before the next clip cut it off.
for (const s of ['Let\u2019s start Kindergarten!', 'Let\u2019s start First Grade!', 'Let\u2019s start Second Grade!'])
  push(s, o => pronunciation.speakText(s, o));
for (const item of content.SENTENCES)
  for (const t of item.truth ?? [])
    if (t.claim) push(t.claim, o => pronunciation.speakText(t.claim, o));

// Stickers: the line on its own (tapped in the tin) and after every finish line
// (the end of a game), which the shell says as two parts
const finishes = new Set(
  [...(luna.GENERAL.finish ?? []), ...Object.values(luna.PER_GAME).flatMap(g => g.finish ?? [])].map(l => l.text)
);
for (const sticker of STICKERS) {
  push(sticker.line, o => pronunciation.speakText(sticker.line, o));
  for (const finish of finishes) {
    push(sticker.line, o => pronunciation.speakSequence([{ text: finish }, { text: sticker.line }], o));
  }
}

// every game and lesson opens with its mission
const LESSONS = curriculum.GRADES.flatMap(g => lessonsFor(g.id));
for (const game of [...GAMES, ...LESSONS]) {
  push(game.mission, o => pronunciation.speakText(game.mission.replace(/[…]/g, '...'), o));
}

// Every spoken part a game keeps in its rounds — cues, prompts, hints — found
// by playing each game many times at every grade and difficulty. Rounds are
// random, so this samples rather than enumerates; the values in them come
// from the content lists, which are checked whole above and below.
const PART_KEYS = new Set(['text', 'sound', 'name', 'word']);
const isPart = v =>
  v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0 &&
  Object.entries(v).every(([k, x]) => PART_KEYS.has(k) && typeof x === 'string');
const partLists = (node, out) => {
  if (Array.isArray(node)) {
    if (node.length && node.every(isPart)) out.push(node);
    else node.forEach(n => partLists(n, out));
  } else if (node && typeof node === 'object') Object.values(node).forEach(n => partLists(n, out));
  return out;
};
const roundParts = new Map();
for (const game of GAMES) {
  for (const grade of ['kindergarten', 'grade1', 'grade2']) {
    for (const difficulty of [1, 2, 3]) {
      for (let play = 0; play < 25; play += 1) {
        for (const parts of partLists(game.makeRounds({ grade, difficulty, count: game.roundsPerPlay }), [])) {
          roundParts.set(JSON.stringify(parts), { game: game.id, parts });
        }
      }
    }
  }
}
for (const { game, parts } of roundParts.values()) {
  push(`${game}: ${parts.map(p => Object.values(p)[0]).join(' + ')}`, o => pronunciation.speakSequence(parts, o));
}

// Words a hint names on its own: a letter's anchor ("like moon"), a wrong
// word tried in a gap
for (const l of [...content.LETTERS, ...content.DIGRAPHS]) push(l.anchor, o => pronunciation.speakWord(l.anchor, o));
for (const s of content.SENTENCES) for (const d of s.decoys ?? []) push(d, o => pronunciation.speakWord(d, o));

// Every literal { text: '…' } part anywhere in the app: the fixed wording of
// hints and cues that games and lessons put together around a word or sound
for (const { src } of sources) {
  for (const m of src.matchAll(/\{\s*text\s*:\s*'((?:[^'\\\n]|\\.)*)'\s*\}/g)) {
    const text = m[1].replace(/\\(['"`\\])/g, '$1').trim();
    if (/[a-zA-Z]/.test(text)) push(text, o => pronunciation.speakText(text, o));
  }
  // a game's own line for Luna, handed to api.win/miss/tick and said by the shell
  for (const m of src.matchAll(/\blunaLine\s*:\s*'((?:[^'\\\n]|\\.)*)'/g)) {
    const text = m[1].replace(/\\(['"`\\])/g, '$1').trim();
    if (/[a-zA-Z]/.test(text)) push(text, o => pronunciation.speakText(text, o));
  }
}

// the guided curriculum
const seen = new Set();
const walkQ = node => {
  if (node == null) return;
  if (Array.isArray(node)) return node.forEach(walkQ);
  if (typeof node !== 'object') return;
  const q = node;
  // a story's question and its explanation are read aloud too (StoryReader)
  for (const s of [q.speechPrompt ?? q.prompt, q.sentence, q.targetSentence, q.exampleSentence, q.hint, q.question, q.explanation]) {
    if (typeof s === 'string' && s.trim() && !seen.has(s)) { seen.add(s); push(s, o => pronunciation.speakSentence(s, o)); }
  }
  if (typeof q.word === 'string' && q.word) push(q.word, o => pronunciation.speakWord(q.word, o));
  // a finished lesson is congratulated by its title
  if (typeof q.title === 'string' && 'starsToEarn' in q) push(q.title, o => pronunciation.speakText(q.title, o));
  // tapping an answer says it
  if (Array.isArray(q.options)) {
    for (const opt of q.options) {
      if (typeof opt.text === 'string') push(opt.text, o => pronunciation.speakText(opt.text, o));
      // a story question's answers are bare strings, said as sentences
      else if (typeof opt === 'string' && opt.trim()) push(opt, o => pronunciation.speakSentence(opt, o));
    }
  }
  Object.values(node).forEach(walkQ);
};
walkQ(curriculum.READING_CURRICULUM);

// --- run them, at every speed the settings screen offers ---
//
// All three matter: each speed is a separate set of files, so a gap in one of
// them is a gap a child will actually hear. Auditing only the default speed is
// how the first version of this script passed while a clip was missing.
const RATES = { slow: 0.75, normal: 0.95, quick: 1.15 };

console.log(`• auditing ${calls.length} utterances × ${Object.keys(RATES).length} speeds`);
const broken = new Map();

for (const [bucket, rate] of Object.entries(RATES)) {
  pronunciation.setRate(rate);
  let bucketBroken = 0;
  for (const { what, how } of calls) {
    fellBack.length = 0;
    await new Promise(done => {
      let settled = false;
      const finish = () => { if (!settled) { settled = true; done(); } };
      how({ interrupt: false, onEnd: finish, onStart: undefined });
      setTimeout(finish, 60);
    });
    // let a late fallback land before the next utterance clears the buffer
    await new Promise(r => setTimeout(r, 0));
    for (const text of fellBack) {
      const id = `${bucket}  ${text}`;
      if (!broken.has(id)) { broken.set(id, what); bucketBroken += 1; }
    }
  }
  console.log(`  ${bucket.padEnd(7)} ${bucketBroken ? `✗ ${bucketBroken} fell back` : '✓ all rendered'}`);
}

if (!broken.size) {
  console.log(`✓ all ${calls.length * Object.keys(RATES).length} utterances play a rendered clip`);
  process.exit(0);
}
console.error(`\n✗ ${broken.size} utterance(s) fall back to the browser voice:\n`);
for (const [text, what] of [...broken].slice(0, 40)) {
  console.error(`    ${JSON.stringify(text)}${what !== text ? `   (via ${JSON.stringify(what)})` : ''}`);
}
if (broken.size > 40) console.error(`    … and ${broken.size - 40} more`);
console.error('\n  Add them to the inventory, then `npm run voice:render`.\n');
process.exit(1);
