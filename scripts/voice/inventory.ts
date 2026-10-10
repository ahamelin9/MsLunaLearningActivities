// Build-time enumeration of everything Ms. Luna can ever say.
//
// The app takes no free text: there is not a single <input> in src/, and no
// speak*() call interpolates a template literal. Every utterance therefore
// comes from a data module in this repo, which means the whole vocabulary can
// be listed here, rendered once, and shipped as audio.
//
// A clip's identity must match the runtime key exactly, so the shape of a key
// lives in one place: keyOf() below is imported by both sides.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  BLEND_IPA,
  LETTER_PHONICS,
  TEAM_PHONICS,
  VOWEL_TEAM_IPA,
  carrierFor,
  ipaFor,
  letterNameOf
} from '../../src/utils/phonics';
import { splitPhonics } from '../../src/utils/speechParts';
import {
  RATE_BUCKETS,
  RATE_BUCKET_NAMES,
  keyOf,
  normalizeValue,
  speedFor,
  type ClipKind,
  type RateBucket
} from '../../src/utils/voiceKeys';
import { READING_CURRICULUM, GRADES } from '../../src/data/readingCurriculum';
import * as content from '../../src/apps/reading/engine/content';
import * as luna from '../../src/apps/reading/engine/luna';
import { STICKERS } from '../../src/apps/reading/engine/stickers';
import { GAMES } from '../../src/apps/reading/games';
import { lessonsFor } from '../../src/apps/reading/engine/lessons';

export { RATE_BUCKETS, RATE_BUCKET_NAMES, keyOf, speedFor };
export type { ClipKind, RateBucket };

export interface Clip {
  kind: ClipKind;
  /** the value half of the cache key */
  value: string;
  /**
   * What a text engine is handed: real words, or for a phonics sound the
   * fallback carrier. A sound itself is made by scripts/voice/phonemes.mjs.
   */
  text: string;
}

// ---------- string harvesting ----------

/** Fields across the data modules whose values are spoken aloud. */
const SPOKEN_KEYS = new Set([
  'speechPrompt',
  'prompt',
  'hint',
  // a story's body: MiniStory.lines is a plain string[]
  'lines',
  // TreasureRead speaks the true/false statement aloud
  'claim',
  // Luna's stock phrases, a bare string[] under its own export
  'LUNA_PHRASES',
  'sentence',
  'text',
  'explanation',
  'comprehensionQuestion',
  // a story question's answers, a bare string[] said when tapped (a lesson's
  // other options are objects, whose own fields are walked instead)
  'options',
  'targetSentence',
  'exampleSentence',
  'spoken',
  'title',
  'question'
]);

/**
 * Fields holding a single word that is spoken on its own: tapped, or named in
 * a hint — a letter's anchor word ("like moon"), a wrong word in a gap.
 */
const WORD_KEYS = new Set(['word', 'targetWord', 'anchor', 'decoys']);

const prose = new Set<string>();
const words = new Set<string>();

/**
 * Sentences the app draws word by word, so a child can tap any single word.
 *
 * Only the readers do this — Luna's own dialogue is spoken whole and never
 * tapped — so harvesting every word of every line would render hundreds of
 * clips nothing ever asks for.
 */
const tappable = new Set<string>();

/** Fields whose sentences are laid out as individual, tappable words. */
const TAPPABLE_KEYS = new Set(['sentence', 'targetSentence', 'exampleSentence', 'lines']);

/**
 * Every word inside a sentence, because a child can tap any one of them.
 *
 * The two readers strip punctuation differently — StoryReader removes
 * apostrophes and SentenceReader keeps them — so a word like "Luna's" is asked
 * for under two spellings and both have to exist.
 */
function addTappableWords(sentence: string): void {
  for (const token of sentence.split(/\s+/)) {
    // SentenceReader: punctuation out, apostrophes kept
    words.add(token.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ''));
    // StoryReader: everything but letters and digits removed
    words.add(token.replace(/[^a-zA-Z0-9]/g, ''));
  }
}

/** `sentences: [{ text }]` — the reader renders each of these word by word. */
function harvestTappableSentences(node: unknown, inSentences = false): void {
  if (node == null) return;
  if (typeof node === 'string') {
    if (inSentences && /[a-zA-Z]/.test(node)) tappable.add(node.trim());
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) harvestTappableSentences(item, inSentences);
    return;
  }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      harvestTappableSentences(v, inSentences || k === 'sentences');
    }
  }
}

function harvest(node: unknown, key?: string): void {
  if (node == null) return;

  if (typeof node === 'string') {
    const trimmed = node.trim();
    if (!trimmed || !/[a-zA-Z]/.test(trimmed)) return;
    if (key && WORD_KEYS.has(key)) words.add(trimmed);
    else if (key && SPOKEN_KEYS.has(key)) {
      prose.add(trimmed);
      if (TAPPABLE_KEYS.has(key)) tappable.add(trimmed);
    }
    return;
  }

  if (Array.isArray(node)) {
    // an array inherits its parent's key: sentences: [{ text }] and
    // lines: ['...'] both carry spoken strings
    for (const item of node) harvest(item, key);
    return;
  }

  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) harvest(v, k);
  }
}

/**
 * Prose is spoken through splitPhonics, which lifts embedded phonemes out of a
 * sentence ("the mmmm sound") so they are sounded rather than spelled. A
 * sentence that splits is never requested whole, so the pieces are what needs
 * rendering — exactly the pieces the runtime will ask for.
 */
function addProse(text: string, out: Map<string, Clip>): void {
  const parts = splitPhonics(text);

  if (parts.length <= 1) {
    // the runtime says a line that is only a phoneme as that sound
    if (parts[0]?.sound) {
      addSound(parts[0].sound, out);
      return;
    }
    const clean = text.replace(/[…]/g, '...').trim();
    if (clean) add(out, { kind: 'text', value: clean, text: clean });
    return;
  }

  for (const part of parts) {
    if (part.sound) {
      addSound(part.sound, out);
    } else if (part.text) {
      const clean = part.text.replace(/[…]/g, '...').trim();
      if (clean && /[a-zA-Z0-9]/.test(clean)) {
        add(out, { kind: 'text', value: clean, text: clean });
      }
    }
  }
}

function addSound(soundKey: string, out: Map<string, Clip>): void {
  // a chunk that is not a sound this app teaches has nothing to render; the
  // runtime leaves it to the browser voice
  if (!ipaFor(soundKey)) return;
  add(out, { kind: 'sound', value: soundKey, text: carrierFor(soundKey) });
}

function add(out: Map<string, Clip>, clip: Clip): void {
  // Dedupe on the *normalized* value, which is what names the file: a phoneme
  // reached through LETTER_PHONICS ("M") and the same one lifted out of a
  // sentence ("mmmm" -> "m") are one clip, and keying on the raw value would
  // render it twice and write the second over the first.
  const id = `${clip.kind}|${normalizeValue(clip.kind, clip.value)}`;
  // a sound keeps its first spelling (the dictionary's "M", not prose's "m");
  // for everything else the last one seen wins, as it always has
  if (clip.kind === 'sound' && out.has(id)) return;
  out.set(id, clip);
}

/**
 * Every literal handed to a speak*() call anywhere in src/.
 *
 * Maintaining this list by hand was a mistake: a hardcoded line in one game
 * ("Sort them by their first sound.") is invisible to a data walk, and the
 * only symptom is that one utterance quietly using the robot voice. Reading
 * the call sites out of the source instead means a new line is picked up by
 * the next render without anyone having to remember this file exists.
 */
const SPEAK_CALL = /\b(soundManager\.speak|speakText|speakSentence|speakWord|speakLetterName|speakLetterSound|speakLetterExample|speakSequence|warm|prefetch)\s*\(/g;

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, out);
    else if (/\.tsx?$/.test(entry) && !/\.d\.ts$/.test(entry)) out.push(full);
  }
  return out;
}

/** The text between a call's opening paren and its matching close. */
function argRegion(src: string, openParen: number): string {
  let depth = 0;
  for (let i = openParen; i < src.length && i < openParen + 4000; i += 1) {
    const c = src[i];
    if (c === '(') depth += 1;
    else if (c === ')') {
      depth -= 1;
      if (depth === 0) return src.slice(openParen + 1, i);
    }
  }
  return '';
}

const STRING_LITERAL = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`([^`$\\]*)`/g;
const TAGGED_PART = /\b(text|sound|name|word)\s*:\s*'((?:[^'\\\n]|\\.)*)'/g;
const TEXT_PART = /\{\s*text\s*:\s*'((?:[^'\\\n]|\\.)*)'\s*\}/g;
/** A game's own line for Luna, handed to api.win/miss/tick and said by the shell. */
const LUNA_LINE = /\blunaLine\s*:\s*'((?:[^'\\\n]|\\.)*)'/g;

function unescape(raw: string): string {
  return raw.replace(/\\(['"`\\])/g, '$1');
}

function harvestSourceLiterals(out: Map<string, Clip>): void {
  // resolved from the working directory, not this module: the inventory is
  // bundled into a scratch folder before it runs, and a URL pathname would
  // also arrive percent-encoded on a path containing spaces
  const root = join(process.cwd(), 'src');

  for (const file of sourceFiles(root)) {
    // the voice module's own internals are not call sites
    if (/utils[/\\](pronunciation|speechParts|voiceClips|voiceKeys)\.ts$/.test(file)) continue;

    const src = readFileSync(file, 'utf8');

    // A `{ text: '…' }` part is speech wherever it is written. Games build
    // their cues and hints in round builders, far from any speak*() call, so
    // reading only call sites missed them and those lines used the browser
    // voice. (Only `text`: `name:` and `word:` are ordinary field names too.)
    for (const m of src.matchAll(TEXT_PART)) {
      const value = unescape(m[1]).trim();
      if (/[a-zA-Z]/.test(value)) prose.add(value);
    }
    // the same goes for a line a game hands the shell for Luna to say
    for (const m of src.matchAll(LUNA_LINE)) {
      const value = unescape(m[1]).trim();
      if (/[a-zA-Z]/.test(value)) prose.add(value);
    }

    SPEAK_CALL.lastIndex = 0;
    let call: RegExpExecArray | null;

    while ((call = SPEAK_CALL.exec(src))) {
      const fn = call[1];
      const region = argRegion(src, call.index + call[0].length - 1);
      if (!region) continue;

      // { text: '…' } / { sound: 'M' } parts inside a sequence or warm list
      let tagged: RegExpExecArray | null;
      TAGGED_PART.lastIndex = 0;
      const claimed = new Set<string>();
      while ((tagged = TAGGED_PART.exec(region))) {
        const kind = tagged[1];
        const value = unescape(tagged[2]).trim();
        if (!value || !/[a-zA-Z0-9]/.test(value)) continue;
        claimed.add(value);
        if (kind === 'text') prose.add(value);
        else if (kind === 'sound') addSound(value, out);
        else if (kind === 'name') add(out, { kind: 'name', value, text: letterNameOf(value) });
        else if (kind === 'word') words.add(value);
      }

      // bare literals, interpreted by which function received them
      let lit: RegExpExecArray | null;
      STRING_LITERAL.lastIndex = 0;
      while ((lit = STRING_LITERAL.exec(region))) {
        const value = unescape(lit[1] ?? lit[2] ?? lit[3] ?? '').trim();
        if (!value || !/[a-zA-Z]/.test(value) || claimed.has(value)) continue;
        // class names and the like are never whole utterances
        if (/^[a-z-]+$/.test(value) && value.length < 4) continue;

        if (fn === 'speakWord') words.add(value);
        else if (fn === 'speakLetterName') add(out, { kind: 'name', value, text: letterNameOf(value) });
        else if (fn === 'speakLetterSound' || fn === 'speakLetterExample') addSound(value, out);
        else prose.add(value);
      }
    }
  }
}

/** Literal strings spoken directly from component source. */
const LITERAL_PROMPTS = [
  'Find the letter',
  'Letter',
  'Read the word',
  'Read the sight word',
  'That one says',
  'That is',
  'Put the words in order to make a sentence.',
  'Read the sentence and choose the missing word.',
  'Look carefully at my desk...',
  'What is missing?',
  'Uppercase',
  'Lowercase'
];

export function buildInventory(): Clip[] {
  const out = new Map<string, Clip>();

  // 1. every phoneme this app can teach, including second sounds
  for (const entry of [...Object.values(LETTER_PHONICS), ...Object.values(TEAM_PHONICS)]) {
    add(out, { kind: 'sound', value: entry.letter, text: entry.carrier });
    add(out, { kind: 'name', value: entry.letter.toUpperCase(), text: entry.letterNameSpeech });
    words.add(entry.exampleWord);
    // speakLetterExample: the sound, then "A is for", then the word
    prose.add(`${entry.letter} is for`);

    if (entry.alternate) {
      // the alternate is addressed by the runtime as "<letter>+alt"
      add(out, { kind: 'sound', value: `${entry.letter}+alt`, text: entry.alternate.carrier });
      words.add(entry.alternate.exampleWord);
    }
  }

  // 2. blends and vowel teams, used when sounding a longer word out
  for (const chunk of [...Object.keys(BLEND_IPA), ...Object.keys(VOWEL_TEAM_IPA)]) {
    add(out, { kind: 'sound', value: chunk, text: carrierFor(chunk) });
  }

  // 3. everything the data modules say
  harvest(READING_CURRICULUM);
  harvestTappableSentences(READING_CURRICULUM);
  harvest(GRADES);
  harvest(content.WORDS, 'word');
  harvest(content.SENTENCES);
  // SentenceReader and TreasureRead lay these out as tappable words. Named
  // explicitly rather than inferred from the field name, because the field is
  // just `text` — the same name a story's answer options use, which are not
  // tapped and would double the word list for nothing.
  for (const item of content.SENTENCES) tappable.add(item.text);
  // TreasureRead's "Read it to me" asks "what?" in the gap until the round is solved
  for (const item of content.SENTENCES)
    for (const part of content.readWithGap(item)) if (part.text) prose.add(part.text);
  harvest(content.MINI_STORIES);
  harvest(content.LETTERS);
  harvest(content.DIGRAPHS);
  for (const value of Object.values(luna)) harvest(value);

  for (const text of LITERAL_PROMPTS) prose.add(text);
  // a sticker's line is said when it is won and when it is tapped in the tin
  for (const sticker of STICKERS) prose.add(sticker.line);
  // every game and lesson opens with Luna saying its mission
  for (const game of GAMES) prose.add(game.mission);
  for (const grade of GRADES) for (const lesson of lessonsFor(grade.id)) prose.add(lesson.mission);

  // every literal at a speak*() call site, read straight from the source
  harvestSourceLiterals(out);

  // 4. the readers lay sentences out as individual words, each of them tappable
  for (const text of tappable) addTappableWords(text);

  // 5. turn the harvest into clips
  for (const text of prose) addProse(text, out);

  for (const raw of words) {
    const clean = raw.replace(/[^a-zA-Z'’-]/g, '').trim();
    if (!clean) continue;
    add(out, { kind: 'word', value: clean.toLowerCase(), text: clean });
  }

  // letter names are also spoken for every single letter A–Z
  for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    add(out, { kind: 'name', value: letter, text: letterNameOf(letter) });
  }

  return [...out.values()];
}
