// Shared content bank for Ms. Luna's mini-games.
// Every game draws from this bank, so new words / sentences / letters
// become available to all games at once, at three difficulty tiers.

import type { GradeLevel } from '../../../types/reading';
import type { SpeechPart } from '../../../utils/speechParts';

export type Difficulty = 1 | 2 | 3;

export type CategoryId = 'animal' | 'food' | 'nature' | 'home' | 'clothes' | 'vehicle' | 'toy';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'animal', label: 'Animals', emoji: '🐾', color: '#F97316' },
  { id: 'food', label: 'Food', emoji: '🍴', color: '#EF4444' },
  { id: 'nature', label: 'Outside', emoji: '🌳', color: '#16A34A' },
  { id: 'home', label: 'In the House', emoji: '🏠', color: '#0EA5E9' },
  { id: 'clothes', label: 'Clothes', emoji: '👕', color: '#A855F7' },
  { id: 'vehicle', label: 'Things That Go', emoji: '🛞', color: '#0891B2' },
  { id: 'toy', label: 'Toys', emoji: '🧸', color: '#DB2777' }
];

export interface WordItem {
  word: string;
  emoji: string;
  /** Beginning grapheme: 'c', 'sh', 'fr' ... */
  initial: string;
  cat: CategoryId;
  /** 1 = CVC / simple, 2 = digraphs, blends, magic e, 3 = vowel teams, compounds */
  tier: Difficulty;
  /** Rime chunk used by rhyming games: cat -> 'at' */
  rime?: string;
}

export const WORDS: WordItem[] = [
  // --- tier 1: CVC & simple, kindergarten friendly ---
  { word: 'cat', emoji: '🐱', initial: 'c', cat: 'animal', tier: 1, rime: 'at' },
  { word: 'bat', emoji: '🦇', initial: 'b', cat: 'animal', tier: 1, rime: 'at' },
  { word: 'hat', emoji: '🎩', initial: 'h', cat: 'clothes', tier: 1, rime: 'at' },
  { word: 'rat', emoji: '🐀', initial: 'r', cat: 'animal', tier: 1, rime: 'at' },
  { word: 'dog', emoji: '🐶', initial: 'd', cat: 'animal', tier: 1, rime: 'og' },
  { word: 'frog', emoji: '🐸', initial: 'fr', cat: 'animal', tier: 2, rime: 'og' },
  { word: 'pig', emoji: '🐷', initial: 'p', cat: 'animal', tier: 1, rime: 'ig' },
  { word: 'bug', emoji: '🐛', initial: 'b', cat: 'animal', tier: 1, rime: 'ug' },
  { word: 'mug', emoji: '☕', initial: 'm', cat: 'home', tier: 1, rime: 'ug' },
  { word: 'sun', emoji: '☀️', initial: 's', cat: 'nature', tier: 1, rime: 'un' },
  { word: 'bun', emoji: '🍞', initial: 'b', cat: 'food', tier: 1, rime: 'un' },
  { word: 'fox', emoji: '🦊', initial: 'f', cat: 'animal', tier: 1, rime: 'ox' },
  { word: 'box', emoji: '📦', initial: 'b', cat: 'home', tier: 1, rime: 'ox' },
  { word: 'bed', emoji: '🛏️', initial: 'b', cat: 'home', tier: 1, rime: 'ed' },
  { word: 'cup', emoji: '🥤', initial: 'c', cat: 'home', tier: 1, rime: 'up' },
  { word: 'pup', emoji: '🐕', initial: 'p', cat: 'animal', tier: 1, rime: 'up' },
  { word: 'map', emoji: '🗺️', initial: 'm', cat: 'home', tier: 1, rime: 'ap' },
  { word: 'cap', emoji: '🧢', initial: 'c', cat: 'clothes', tier: 1, rime: 'ap' },
  { word: 'pen', emoji: '🖊️', initial: 'p', cat: 'home', tier: 1, rime: 'en' },
  { word: 'hen', emoji: '🐔', initial: 'h', cat: 'animal', tier: 1, rime: 'en' },
  { word: 'net', emoji: '🥅', initial: 'n', cat: 'toy', tier: 1, rime: 'et' },
  { word: 'jet', emoji: '🛩️', initial: 'j', cat: 'vehicle', tier: 1, rime: 'et' },
  { word: 'van', emoji: '🚐', initial: 'v', cat: 'vehicle', tier: 1, rime: 'an' },
  { word: 'fan', emoji: '🪭', initial: 'f', cat: 'home', tier: 1, rime: 'an' },
  { word: 'log', emoji: '🪵', initial: 'l', cat: 'nature', tier: 1, rime: 'og' },
  { word: 'egg', emoji: '🥚', initial: 'e', cat: 'food', tier: 1 },
  { word: 'ant', emoji: '🐜', initial: 'a', cat: 'animal', tier: 1 },
  { word: 'apple', emoji: '🍎', initial: 'a', cat: 'food', tier: 1 },
  { word: 'igloo', emoji: '🛖', initial: 'i', cat: 'home', tier: 1 },
  { word: 'ox', emoji: '🐂', initial: 'o', cat: 'animal', tier: 1, rime: 'ox' },
  { word: 'umbrella', emoji: '☂️', initial: 'u', cat: 'home', tier: 1 },
  { word: 'key', emoji: '🔑', initial: 'k', cat: 'home', tier: 1 },
  { word: 'kite', emoji: '🪁', initial: 'k', cat: 'toy', tier: 2 },
  { word: 'gift', emoji: '🎁', initial: 'g', cat: 'toy', tier: 1 },
  { word: 'goat', emoji: '🐐', initial: 'g', cat: 'animal', tier: 3 },
  { word: 'leaf', emoji: '🍃', initial: 'l', cat: 'nature', tier: 2 },
  { word: 'lion', emoji: '🦁', initial: 'l', cat: 'animal', tier: 2 },
  { word: 'moon', emoji: '🌙', initial: 'm', cat: 'nature', tier: 2 },
  { word: 'milk', emoji: '🥛', initial: 'm', cat: 'food', tier: 1 },
  { word: 'nest', emoji: '🪹', initial: 'n', cat: 'nature', tier: 2 },
  { word: 'nose', emoji: '👃', initial: 'n', cat: 'home', tier: 2 },
  { word: 'rock', emoji: '🪨', initial: 'r', cat: 'nature', tier: 1 },
  { word: 'ring', emoji: '💍', initial: 'r', cat: 'clothes', tier: 1 },
  { word: 'sock', emoji: '🧦', initial: 's', cat: 'clothes', tier: 1 },
  { word: 'seed', emoji: '🌱', initial: 's', cat: 'nature', tier: 2 },
  { word: 'tree', emoji: '🌳', initial: 't', cat: 'nature', tier: 2 },
  { word: 'tent', emoji: '⛺', initial: 't', cat: 'nature', tier: 1 },
  { word: 'mop', emoji: '🧹', initial: 'm', cat: 'home', tier: 1 },
  { word: 'web', emoji: '🕸️', initial: 'w', cat: 'nature', tier: 1 },
  { word: 'yarn', emoji: '🧶', initial: 'y', cat: 'toy', tier: 2 },
  { word: 'zebra', emoji: '🦓', initial: 'z', cat: 'animal', tier: 2 },
  { word: 'jam', emoji: '🍓', initial: 'j', cat: 'food', tier: 1, rime: 'am' },
  { word: 'ham', emoji: '🍖', initial: 'h', cat: 'food', tier: 1, rime: 'am' },
  { word: 'duck', emoji: '🦆', initial: 'd', cat: 'animal', tier: 1 },
  { word: 'doll', emoji: '🪆', initial: 'd', cat: 'toy', tier: 1 },
  { word: 'vest', emoji: '🦺', initial: 'v', cat: 'clothes', tier: 2 },

  // --- tier 2: digraphs, blends, magic e ---
  { word: 'ship', emoji: '🚢', initial: 'sh', cat: 'vehicle', tier: 2, rime: 'ip' },
  { word: 'shell', emoji: '🐚', initial: 'sh', cat: 'nature', tier: 2 },
  { word: 'sheep', emoji: '🐑', initial: 'sh', cat: 'animal', tier: 2 },
  { word: 'shoe', emoji: '👟', initial: 'sh', cat: 'clothes', tier: 2 },
  { word: 'chick', emoji: '🐥', initial: 'ch', cat: 'animal', tier: 2 },
  { word: 'cheese', emoji: '🧀', initial: 'ch', cat: 'food', tier: 2 },
  { word: 'chair', emoji: '🪑', initial: 'ch', cat: 'home', tier: 2 },
  { word: 'thumb', emoji: '👍', initial: 'th', cat: 'home', tier: 2 },
  { word: 'whale', emoji: '🐋', initial: 'wh', cat: 'animal', tier: 2 },
  { word: 'wheel', emoji: '🛞', initial: 'wh', cat: 'vehicle', tier: 2 },
  { word: 'star', emoji: '⭐', initial: 'st', cat: 'nature', tier: 2 },
  { word: 'stop', emoji: '🛑', initial: 'st', cat: 'vehicle', tier: 2, rime: 'op' },
  { word: 'crab', emoji: '🦀', initial: 'cr', cat: 'animal', tier: 2 },
  { word: 'crown', emoji: '👑', initial: 'cr', cat: 'clothes', tier: 2 },
  { word: 'drum', emoji: '🥁', initial: 'dr', cat: 'toy', tier: 2 },
  { word: 'flag', emoji: '🚩', initial: 'fl', cat: 'home', tier: 2 },
  { word: 'flower', emoji: '🌸', initial: 'fl', cat: 'nature', tier: 2 },
  { word: 'glove', emoji: '🧤', initial: 'gl', cat: 'clothes', tier: 2 },
  { word: 'plane', emoji: '✈️', initial: 'pl', cat: 'vehicle', tier: 2 },
  { word: 'plate', emoji: '🍽️', initial: 'pl', cat: 'home', tier: 2 },
  { word: 'snake', emoji: '🐍', initial: 'sn', cat: 'animal', tier: 2 },
  { word: 'snow', emoji: '❄️', initial: 'sn', cat: 'nature', tier: 2 },
  { word: 'spoon', emoji: '🥄', initial: 'sp', cat: 'home', tier: 2 },
  { word: 'train', emoji: '🚆', initial: 'tr', cat: 'vehicle', tier: 3 },
  { word: 'truck', emoji: '🚛', initial: 'tr', cat: 'vehicle', tier: 2 },
  { word: 'cake', emoji: '🎂', initial: 'c', cat: 'food', tier: 2 },
  { word: 'bone', emoji: '🦴', initial: 'b', cat: 'animal', tier: 2 },
  { word: 'bike', emoji: '🚲', initial: 'b', cat: 'vehicle', tier: 2 },
  { word: 'rose', emoji: '🌹', initial: 'r', cat: 'nature', tier: 2 },

  // --- tier 3: vowel teams & compounds ---
  { word: 'boat', emoji: '⛵', initial: 'b', cat: 'vehicle', tier: 3 },
  { word: 'coat', emoji: '🧥', initial: 'c', cat: 'clothes', tier: 3 },
  { word: 'rain', emoji: '🌧️', initial: 'r', cat: 'nature', tier: 3 },
  { word: 'snail', emoji: '🐌', initial: 'sn', cat: 'animal', tier: 3 },
  { word: 'beach', emoji: '🏖️', initial: 'b', cat: 'nature', tier: 3 },
  { word: 'peach', emoji: '🍑', initial: 'p', cat: 'food', tier: 3 },
  { word: 'bread', emoji: '🥖', initial: 'br', cat: 'food', tier: 3 },
  { word: 'rainbow', emoji: '🌈', initial: 'r', cat: 'nature', tier: 3 },
  { word: 'cupcake', emoji: '🧁', initial: 'c', cat: 'food', tier: 3 },
  { word: 'sunflower', emoji: '🌻', initial: 's', cat: 'nature', tier: 3 },
  { word: 'butterfly', emoji: '🦋', initial: 'b', cat: 'animal', tier: 3 },
  { word: 'popcorn', emoji: '🍿', initial: 'p', cat: 'food', tier: 3 },
  { word: 'football', emoji: '⚽', initial: 'f', cat: 'toy', tier: 3 },
  { word: 'toothbrush', emoji: '🪥', initial: 't', cat: 'home', tier: 3 },
  { word: 'pancake', emoji: '🥞', initial: 'p', cat: 'food', tier: 3 }
];

// How each sound is actually pronounced lives in utils/phonics.ts, so there is
// only ever one answer to "what does this letter say".
export interface LetterItem {
  letter: string;
  /** written form of the sound, e.g. /m/ */
  sound: string;
  /** a memorable anchor word */
  anchor: string;
  anchorEmoji: string;
}

export const LETTERS: LetterItem[] = [
  { letter: 'A', sound: '/a/', anchor: 'apple', anchorEmoji: '🍎' },
  { letter: 'B', sound: '/b/', anchor: 'bug', anchorEmoji: '🐛' },
  { letter: 'C', sound: '/k/', anchor: 'cat', anchorEmoji: '🐱' },
  { letter: 'D', sound: '/d/', anchor: 'duck', anchorEmoji: '🦆' },
  { letter: 'E', sound: '/e/', anchor: 'egg', anchorEmoji: '🥚' },
  { letter: 'F', sound: '/f/', anchor: 'fox', anchorEmoji: '🦊' },
  { letter: 'G', sound: '/g/', anchor: 'gift', anchorEmoji: '🎁' },
  { letter: 'H', sound: '/h/', anchor: 'hat', anchorEmoji: '🎩' },
  { letter: 'I', sound: '/i/', anchor: 'igloo', anchorEmoji: '🛖' },
  { letter: 'J', sound: '/j/', anchor: 'jam', anchorEmoji: '🍓' },
  { letter: 'K', sound: '/k/', anchor: 'key', anchorEmoji: '🔑' },
  { letter: 'L', sound: '/l/', anchor: 'leaf', anchorEmoji: '🍃' },
  { letter: 'M', sound: '/m/', anchor: 'moon', anchorEmoji: '🌙' },
  { letter: 'N', sound: '/n/', anchor: 'nest', anchorEmoji: '🪹' },
  { letter: 'O', sound: '/o/', anchor: 'ox', anchorEmoji: '🐂' },
  { letter: 'P', sound: '/p/', anchor: 'pig', anchorEmoji: '🐷' },
  { letter: 'R', sound: '/r/', anchor: 'ring', anchorEmoji: '💍' },
  { letter: 'S', sound: '/s/', anchor: 'sun', anchorEmoji: '☀️' },
  { letter: 'T', sound: '/t/', anchor: 'top', anchorEmoji: '🔝' },
  { letter: 'U', sound: '/u/', anchor: 'umbrella', anchorEmoji: '☂️' },
  { letter: 'V', sound: '/v/', anchor: 'van', anchorEmoji: '🚐' },
  { letter: 'W', sound: '/w/', anchor: 'web', anchorEmoji: '🕸️' },
  { letter: 'Y', sound: '/y/', anchor: 'yarn', anchorEmoji: '🧶' },
  { letter: 'Z', sound: '/z/', anchor: 'zebra', anchorEmoji: '🦓' }
];

export const DIGRAPHS: LetterItem[] = [
  { letter: 'SH', sound: '/sh/', anchor: 'ship', anchorEmoji: '🚢' },
  { letter: 'CH', sound: '/ch/', anchor: 'chick', anchorEmoji: '🐥' },
  { letter: 'TH', sound: '/th/', anchor: 'thumb', anchorEmoji: '👍' },
  { letter: 'WH', sound: '/wh/', anchor: 'whale', anchorEmoji: '🐋' }
];

export interface SentenceItem {
  text: string;
  emoji: string;
  tier: Difficulty;
  /** the word a child blanks out / rebuilds first */
  key: string;
  /** plausible wrong words for the blank */
  decoys: string[];
  /**
   * Words that would also make the sentence true in the key's gap, so none is
   * ever offered as wrong (CNT-1b). At tier 3, where Words Off the Page adds an
   * extra tile, also any extra tile that would make it true in place of one of
   * its words. Written by hand: code can't tell what fits. Wrong but same-type
   * words stay fair decoys ("The sun is cold").
   */
  alsoFits: string[];
  /** a true / false statement pair for comprehension games */
  truth?: { claim: string; isTrue: boolean }[];
}

export const SENTENCES: SentenceItem[] = [
  // tier 1 — 3 to 4 words
  {
    text: 'The cat is big.',
    emoji: '🐱',
    tier: 1,
    key: 'cat',
    decoys: ['sing', 'eat', 'go'],
    alsoFits: ['dog', 'pig', 'bus', 'hat', 'box', 'bed', 'fox', 'sun', 'ship', 'tree', 'house'],
    truth: [{ claim: 'The cat is big.', isTrue: true }, { claim: 'The cat is small.', isTrue: false }]
  },
  {
    text: 'A dog can run.',
    emoji: '🐶',
    tier: 1,
    key: 'run',
    decoys: ['read', 'fly', 'write'],
    alsoFits: ['walk', 'jump', 'swim', 'sit', 'bark', 'play', 'eat', 'dig', 'sleep', 'hop', 'sniff'],
    truth: [{ claim: 'The dog can run.', isTrue: true }, { claim: 'The dog can fly.', isTrue: false }]
  },
  {
    text: 'The sun is hot.',
    emoji: '☀️',
    tier: 1,
    key: 'hot',
    decoys: ['cold', 'wet', 'sad'],
    alsoFits: ['warm', 'big', 'bright', 'yellow', 'round', 'up', 'out'],
    truth: [{ claim: 'The sun is hot.', isTrue: true }, { claim: 'The sun is cold.', isTrue: false }]
  },
  {
    text: 'I see a frog.',
    emoji: '🐸',
    tier: 1,
    key: 'frog',
    decoys: ['jump', 'swim', 'sing'],
    alsoFits: ['fish', 'dog', 'cat', 'bug', 'duck', 'hen', 'fox', 'pig', 'log', 'tree', 'bird', 'flag', 'fan'],
    truth: [{ claim: 'I see a frog.', isTrue: true }, { claim: 'I see a truck.', isTrue: false }]
  },
  {
    text: 'The bug is red.',
    emoji: '🐞',
    tier: 1,
    key: 'red',
    decoys: ['ten', 'run', 'cup'],
    alsoFits: ['green', 'blue', 'black', 'yellow', 'brown', 'orange', 'small', 'little', 'big', 'loud'],
    truth: [{ claim: 'The bug is red.', isTrue: true }, { claim: 'The bug is green.', isTrue: false }]
  },
  {
    text: 'My hat is new.',
    emoji: '🎩',
    tier: 1,
    key: 'hat',
    decoys: ['jump', 'sing', 'eat'],
    alsoFits: ['cat', 'bed', 'cup', 'pen', 'cap', 'sock', 'bike', 'van', 'dog', 'map', 'book', 'coat'],
    truth: [{ claim: 'The hat is new.', isTrue: true }, { claim: 'The hat is old.', isTrue: false }]
  },

  // tier 2 — 5 to 6 words
  {
    text: 'The little cat is sleeping.',
    emoji: '😴',
    tier: 2,
    key: 'sleeping',
    decoys: ['reading', 'driving', 'cooking'],
    alsoFits: ['jumping', 'eating', 'playing', 'sitting', 'running', 'napping', 'resting', 'purring', 'hiding'],
    truth: [{ claim: 'The cat is sleeping.', isTrue: true }, { claim: 'The cat is running.', isTrue: false }]
  },
  {
    text: 'A green frog jumps high.',
    emoji: '🐸',
    tier: 2,
    key: 'green',
    decoys: ['seven', 'under', 'sing'],
    alsoFits: ['brown', 'little', 'big', 'small', 'happy', 'young', 'wet', 'fat', 'tiny'],
    truth: [{ claim: 'The frog is green.', isTrue: true }, { claim: 'The frog is purple.', isTrue: false }]
  },
  {
    text: 'The ship sails on water.',
    emoji: '🚢',
    tier: 2,
    key: 'water',
    decoys: ['grass', 'paper', 'winter'],
    alsoFits: ['sea', 'lake', 'river', 'ocean', 'waves'],
    truth: [{ claim: 'The ship sails on water.', isTrue: true }, { claim: 'The ship sails on sand.', isTrue: false }]
  },
  {
    text: 'My kitten likes warm milk.',
    emoji: '🐱',
    tier: 2,
    key: 'milk',
    decoys: ['rocks', 'bikes', 'snow'],
    alsoFits: ['water', 'food', 'soup', 'socks', 'beds', 'hugs', 'baths', 'blankets'],
    truth: [{ claim: 'The kitten likes milk.', isTrue: true }, { claim: 'The kitten likes rocks.', isTrue: false }]
  },
  {
    text: 'Six chicks hop in mud.',
    emoji: '🐥',
    tier: 2,
    key: 'hop',
    decoys: ['read', 'drive', 'write'],
    alsoFits: ['play', 'walk', 'sit', 'run', 'jump', 'dig', 'peck', 'rest', 'sleep', 'splash', 'eat'],
    truth: [{ claim: 'The chicks hop.', isTrue: true }, { claim: 'The chicks drive.', isTrue: false }]
  },

  // tier 3 — 7+ words
  {
    text: 'The little cat is sleeping under the table.',
    emoji: '🛋️',
    tier: 3,
    key: 'under',
    decoys: ['over', 'before', 'into'],
    alsoFits: ['behind', 'on', 'by', 'near', 'beside', 'below', 'beneath', 'at', 'window'],
    truth: [
      { claim: 'The cat is under the table.', isTrue: true },
      { claim: 'The cat is on the roof.', isTrue: false }
    ]
  },
  {
    text: 'A bright rainbow appears after the rain.',
    emoji: '🌈',
    tier: 3,
    key: 'rainbow',
    decoys: ['raincoat', 'railway', 'raisin'],
    alsoFits: ['sun', 'light', 'sky', 'day', 'star', 'moon'],
    truth: [
      { claim: 'The rainbow comes after rain.', isTrue: true },
      { claim: 'The rainbow comes after snow.', isTrue: false }
    ]
  },
  {
    text: 'My friend reads a book on the beach.',
    emoji: '🏖️',
    tier: 3,
    key: 'beach',
    decoys: ['bread', 'soup', 'cake'],
    alsoFits: ['bench', 'bed', 'bus', 'train', 'sofa', 'grass', 'porch', 'floor', 'boat', 'ship', 'rug', 'branch', 'sand', 'swing', 'window'],
    truth: [
      { claim: 'My friend reads on the beach.', isTrue: true },
      { claim: 'My friend swims in a book.', isTrue: false }
    ]
  },
  {
    text: 'The train stops at the busy station.',
    emoji: '🚆',
    tier: 3,
    key: 'station',
    decoys: ['kitchen', 'mountain', 'balloon'],
    alsoFits: ['stop', 'town', 'city', 'street', 'corner', 'school', 'market', 'park', 'purple'],
    truth: [
      { claim: 'The train stops at a station.', isTrue: true },
      { claim: 'The train stops in a kitchen.', isTrue: false }
    ]
  },
  {
    text: 'Snails move slowly across the wet leaf.',
    emoji: '🐌',
    tier: 3,
    key: 'slowly',
    decoys: ['quickly', 'loudly', 'sweetly'],
    alsoFits: ['quietly', 'softly', 'gently', 'along', 'window', 'purple', 'banana'],
    truth: [
      { claim: 'Snails move slowly.', isTrue: true },
      { claim: 'Snails move quickly.', isTrue: false }
    ]
  }
];

/** A fill-in-the-blank statement about a passage: `key` is the word in `text` the child fills in. */
export interface BlankItem {
  /** the whole statement, with the key word in it */
  text: string;
  key: string;
  /** wrong words of the same type that the passage makes false */
  decoys: string[];
  /** words that would also make the statement true, never offered as wrong (CNT-1b) */
  alsoFits: string[];
}

/**
 * A short passage for Treasure Path (GAME-1a): about 2 sentences at
 * Kindergarten, 3 at 1st grade and 4–5 at 2nd grade. Every statement
 * paraphrases the passage and never copies 4 words in a row from it, and the
 * words beside a blank never sit beside its answer in the passage, so nothing
 * can be found by matching text. The emoji never pictures an answer.
 */
export interface PassageItem {
  id: string;
  grade: GradeLevel;
  emoji: string;
  lines: string[];
  truth: { claim: string; isTrue: boolean }[];
  blanks: BlankItem[];
}

export const PASSAGES: PassageItem[] = [
  // ---- Kindergarten: about 2 sentences ----
  {
    id: 'k-red-ball',
    grade: 'kindergarten',
    emoji: '🧸',
    lines: ['Luna has a red ball.', 'She rolls it to the cat.'],
    truth: [
      { claim: 'The ball is red.', isTrue: true },
      { claim: 'Luna rolls the ball to a dog.', isTrue: false }
    ],
    blanks: [{ text: "The cat gets Luna's ball.", key: 'ball', decoys: ['hat', 'cake', 'book'], alsoFits: ['toy'] }]
  },
  {
    id: 'k-big-moon',
    grade: 'kindergarten',
    emoji: '🦉',
    lines: ['Luna sees the moon.', 'It is big and round.'],
    truth: [
      { claim: 'Luna looks at the moon.', isTrue: true },
      { claim: 'The moon is small.', isTrue: false }
    ],
    blanks: [
      { text: 'Luna sees a big moon.', key: 'big', decoys: ['small', 'tiny', 'little'], alsoFits: ['round', 'full', 'bright', 'white'] }
    ]
  },
  {
    id: 'k-fox-book',
    grade: 'kindergarten',
    emoji: '📚',
    lines: ['Luna reads a book.', 'The book is about a fox.'],
    truth: [
      { claim: "Luna's book tells about a fox.", isTrue: true },
      { claim: 'Luna reads about a pig.', isTrue: false }
    ],
    blanks: [{ text: "The fox is in Luna's book.", key: 'fox', decoys: ['pig', 'hen', 'dog'], alsoFits: ['animal'] }]
  },
  {
    id: 'k-long-worm',
    grade: 'kindergarten',
    emoji: '🌱',
    lines: ['Luna digs in her garden.', 'She finds a long worm.'],
    truth: [
      { claim: 'Luna is digging.', isTrue: true },
      { claim: 'Luna finds a short worm.', isTrue: false }
    ],
    blanks: [
      { text: "Luna's worm is in the garden.", key: 'garden', decoys: ['bed', 'sky', 'cup'], alsoFits: ['dirt', 'ground', 'soil', 'mud'] }
    ]
  },
  {
    id: 'k-soft-bed',
    grade: 'kindergarten',
    emoji: '🦉',
    lines: ['It is night.', 'Luna gets into her soft bed.'],
    truth: [
      { claim: "Luna's bed is soft.", isTrue: true },
      { claim: 'It is day.', isTrue: false }
    ],
    blanks: [
      { text: 'Luna goes to bed at night.', key: 'night', decoys: ['lunch', 'school', 'noon'], alsoFits: ['nighttime', 'bedtime'] }
    ]
  },
  {
    id: 'k-cake-friend',
    grade: 'kindergarten',
    emoji: '💛',
    lines: ['Luna makes a cake.', 'She gives it to her friend.'],
    truth: [
      { claim: 'Luna shares a cake.', isTrue: true },
      { claim: 'Luna eats the cake by herself.', isTrue: false }
    ],
    blanks: [
      { text: "The cake is for Luna's friend.", key: 'friend', decoys: ['hat', 'bed', 'sock'], alsoFits: ['pal', 'buddy'] }
    ]
  },

  // ---- 1st grade: about 3 sentences ----
  {
    id: 'g1-yellow-flower',
    grade: 'grade1',
    emoji: '🌱',
    lines: ['Luna plants a seed in her garden.', 'Every day she gives it water.', 'Soon a yellow flower grows.'],
    truth: [
      { claim: 'Luna waters the seed each day.', isTrue: true },
      { claim: "Luna's garden gets a new flower.", isTrue: true },
      { claim: 'The flower that grows is blue.', isTrue: false }
    ],
    blanks: [
      {
        text: "Luna's new flower is yellow.",
        key: 'yellow',
        decoys: ['red', 'blue', 'pink'],
        alsoFits: ['pretty', 'little', 'tall', 'small', 'big', 'new']
      }
    ]
  },
  {
    id: 'g1-rainy-reading',
    grade: 'grade1',
    emoji: '📚',
    lines: ['Rain falls on the library roof.', 'Luna stays inside and reads two books.', 'She keeps her feathers dry.'],
    truth: [
      { claim: 'Luna reads while it rains.', isTrue: true },
      { claim: 'Luna gets wet in the rain.', isTrue: false },
      { claim: 'Luna reads one book.', isTrue: false }
    ],
    blanks: [{ text: "Luna's feathers stay dry.", key: 'dry', decoys: ['wet', 'cold', 'muddy'], alsoFits: ['clean', 'warm', 'nice'] }]
  },
  {
    id: 'g1-moon-pond',
    grade: 'grade1',
    emoji: '🦉',
    lines: ['Luna flies to the pond at night.', 'She looks down at the water.', 'She sees the moon in the pond!'],
    truth: [
      { claim: 'The moon shines on the pond.', isTrue: true },
      { claim: 'Luna goes to the pond in the day.', isTrue: false },
      { claim: 'Luna looks up at the sky.', isTrue: false }
    ],
    blanks: [
      {
        text: 'Luna visits the pond when it is night.',
        key: 'night',
        decoys: ['day', 'morning', 'noon'],
        alsoFits: ['dark', 'nighttime', 'late']
      }
    ]
  },
  {
    id: 'g1-lost-snail',
    grade: 'grade1',
    emoji: '🌿',
    lines: ['A little snail is lost in the grass.', 'Luna picks it up very gently.', 'She takes it home to the garden.'],
    truth: [
      { claim: 'Luna helps a snail.', isTrue: true },
      { claim: 'Luna is kind to the snail.', isTrue: true },
      { claim: 'Luna finds the snail in a tree.', isTrue: false }
    ],
    blanks: [
      { text: 'Luna holds the snail gently.', key: 'gently', decoys: ['hard', 'tight', 'fast'], alsoFits: ['softly', 'carefully', 'kindly'] },
      { text: 'Luna carries the snail to her garden.', key: 'garden', decoys: ['bed', 'school', 'room'], alsoFits: ['home', 'yard'] }
    ]
  },
  {
    id: 'g1-pancakes',
    grade: 'grade1',
    emoji: '🦉',
    lines: ['Luna wakes up hungry.', 'She makes three pancakes for breakfast.', 'She eats them with sweet jam.'],
    truth: [
      { claim: 'Luna has pancakes in the morning.', isTrue: true },
      { claim: 'Luna puts milk on her pancakes.', isTrue: false },
      { claim: 'Luna is not hungry.', isTrue: false }
    ],
    blanks: [
      { text: "Luna's pancakes have jam on top.", key: 'jam', decoys: ['cheese', 'soup', 'milk'], alsoFits: ['fruit'] }
    ]
  },
  {
    id: 'g1-class-picture',
    grade: 'grade1',
    emoji: '🖍️',
    lines: ['Luna draws a picture for her class.', 'She uses green, blue and pink.', 'Her friends say it is beautiful.'],
    truth: [
      { claim: "Luna's picture has three colors.", isTrue: true },
      { claim: "Luna's friends do not like the picture.", isTrue: false },
      { claim: 'Luna uses red.', isTrue: false }
    ],
    blanks: [
      {
        text: "Luna's friends think her picture is pretty.",
        key: 'pretty',
        decoys: ['sad', 'wet', 'broken'],
        alsoFits: ['beautiful', 'nice', 'lovely', 'good', 'great']
      }
    ]
  },

  // ---- 2nd grade: 4 to 5 sentences ----
  {
    id: 'g2-windy-library',
    grade: 'grade2',
    emoji: '🦉',
    lines: [
      'It was a windy night, so Luna stayed in the library.',
      'She lit a small lamp and opened a book about the sea.',
      'The book had pictures of whales and crabs.',
      'Luna kept reading until the moon was high in the sky.',
      'Then she fell asleep on her soft pillow.'
    ],
    truth: [
      { claim: 'Luna learned about sea animals.', isTrue: true },
      { claim: 'Luna went to sleep late at night.', isTrue: true },
      { claim: 'Luna flew outside because the night was calm.', isTrue: false }
    ],
    blanks: [
      {
        text: 'Because of the wind, Luna stayed inside.',
        key: 'inside',
        decoys: ['outside', 'asleep', 'away'],
        alsoFits: ['in', 'home', 'indoors']
      },
      {
        text: "The whales and crabs in Luna's book are sea animals.",
        key: 'sea',
        decoys: ['farm', 'pet', 'desert'],
        alsoFits: ['ocean', 'water']
      }
    ]
  },
  {
    id: 'g2-sunflowers',
    grade: 'grade2',
    emoji: '🌱',
    lines: [
      'Luna and her friend Pip planted seeds in spring.',
      'Pip watered his seeds every morning.',
      'Luna forgot to water hers for a whole week.',
      'By summer, Pip had tall sunflowers.',
      'Luna had only one small sprout, but she promised to try again.'
    ],
    truth: [
      { claim: 'Pip took better care of his seeds than Luna.', isTrue: true },
      { claim: "Luna's garden was full of tall flowers.", isTrue: false },
      { claim: 'Luna gave up on her garden.', isTrue: false }
    ],
    blanks: [
      {
        text: 'Luna did not water her seeds for seven days.',
        key: 'days',
        decoys: ['hours', 'minutes', 'years'],
        alsoFits: ['mornings', 'nights']
      },
      {
        text: "In summer, Pip's sunflowers were tall.",
        key: 'tall',
        decoys: ['small', 'short', 'tiny'],
        alsoFits: ['big', 'yellow', 'pretty', 'high']
      }
    ]
  },
  {
    id: 'g2-lost-glasses',
    grade: 'grade2',
    emoji: '🫖',
    lines: [
      'Luna could not find her black glasses.',
      'She looked under her pillow and inside her teacup.',
      'Then her friend Pip laughed and pointed up.',
      "The glasses were on top of Luna's head!"
    ],
    truth: [
      { claim: 'Pip helped Luna find her glasses.', isTrue: true },
      { claim: "Luna's glasses were black.", isTrue: true },
      { claim: 'Luna found her glasses in her teacup.', isTrue: false }
    ],
    blanks: [
      {
        text: "Luna's glasses were on her head the whole time.",
        key: 'head',
        decoys: ['pillow', 'teacup', 'foot'],
        alsoFits: ['feathers']
      }
    ]
  },
  {
    id: 'g2-indoor-picnic',
    grade: 'grade2',
    emoji: '🧺',
    lines: [
      'Luna planned a picnic in the garden with her friends.',
      'In the morning, dark clouds filled the sky and it started to rain.',
      'Luna did not feel sad for long.',
      'She spread a blanket on the library floor, and they had the picnic inside!'
    ],
    truth: [
      { claim: "The weather changed Luna's plan.", isTrue: true },
      { claim: 'Luna and her friends ate in the garden.', isTrue: false },
      { claim: 'Luna stayed sad all day.', isTrue: false }
    ],
    blanks: [
      {
        text: 'It was a rainy day, so the picnic moved.',
        key: 'rainy',
        decoys: ['sunny', 'hot', 'dry'],
        alsoFits: ['wet', 'cloudy', 'gray', 'dark']
      },
      {
        text: 'Rain came, so the picnic moved inside.',
        key: 'inside',
        decoys: ['outside', 'away', 'far'],
        alsoFits: ['indoors', 'in']
      }
    ]
  },
  {
    id: 'g2-baby-bird',
    grade: 'grade2',
    emoji: '🌳',
    lines: [
      'One morning, Luna heard a tiny sound near the old oak tree.',
      'A baby bird had fallen out of its nest.',
      'Luna carried it back up very carefully.',
      'The mother bird sang a happy song to say thank you.'
    ],
    truth: [
      { claim: 'Luna helped a baby bird get home.', isTrue: true },
      { claim: 'The mother bird was angry with Luna.', isTrue: false },
      { claim: 'Luna found the bird at night.', isTrue: false }
    ],
    blanks: [
      {
        text: 'The baby was back in the nest thanks to Luna.',
        key: 'nest',
        decoys: ['pond', 'library', 'cup'],
        alsoFits: ['tree', 'home']
      },
      {
        text: 'The mother bird thanked Luna with a song.',
        key: 'song',
        decoys: ['cake', 'book', 'hat'],
        alsoFits: ['tune']
      }
    ]
  },
  {
    id: 'g2-story-time',
    grade: 'grade2',
    emoji: '📖',
    lines: [
      'Every Friday, Luna reads a story to the little animals in the garden.',
      'This week she chose a funny book about a dancing pig.',
      'The rabbits laughed so hard that they rolled in the grass.',
      'When the story ended, everyone asked her to read it again.'
    ],
    truth: [
      { claim: 'Luna reads to her friends once a week.', isTrue: true },
      { claim: 'The story made the rabbits cry.', isTrue: false },
      { claim: 'Nobody wanted to hear the story again.', isTrue: false }
    ],
    blanks: [
      {
        text: 'The pig in the story likes to dance.',
        key: 'dance',
        decoys: ['sleep', 'cook', 'swim'],
        alsoFits: ['move', 'jump', 'hop']
      },
      {
        text: "Luna's story time is on Fridays.",
        key: 'Fridays',
        decoys: ['Mondays', 'Sundays', 'Tuesdays'],
        alsoFits: []
      }
    ]
  }
];

export interface MiniStory {
  id: string;
  title: string;
  emoji: string;
  tier: Difficulty;
  lines: string[];
  question: string;
  answers: { text: string; correct: boolean }[];
}

export const MINI_STORIES: MiniStory[] = [
  {
    id: 'story-lost-sock',
    title: 'The Lost Sock',
    emoji: '🧦',
    tier: 1,
    lines: ['Luna lost one red sock.', 'It was under the bed!', 'Now her feet are warm.'],
    question: 'Where was the sock?',
    answers: [
      { text: 'Under the bed', correct: true },
      { text: 'In the tree', correct: false },
      { text: 'On the bus', correct: false }
    ]
  },
  {
    id: 'story-moon-snack',
    title: 'A Snack on the Moon',
    emoji: '🌙',
    tier: 2,
    lines: [
      'Luna flew up to the moon.',
      'She packed cheese and a warm bun.',
      'A little star shared her snack.'
    ],
    question: 'What did Luna pack?',
    answers: [
      { text: 'Cheese and a bun', correct: true },
      { text: 'A rock and a sock', correct: false },
      { text: 'Books and a broom', correct: false }
    ]
  },
  {
    id: 'story-rain-day',
    title: 'The Rainy Day Plan',
    emoji: '🌧️',
    tier: 3,
    lines: [
      'Rain tapped on the library window all morning.',
      'Luna could not fly outside, so she read three books instead.',
      'When the sun came back, a bright rainbow stretched over the tree.'
    ],
    question: 'What did Luna do while it rained?',
    answers: [
      { text: 'She read three books', correct: true },
      { text: 'She flew to the beach', correct: false },
      { text: 'She painted the window', correct: false }
    ]
  }
];

// ---------- helpers ----------

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function sample<T>(items: T[], count: number): T[] {
  return shuffle(items).slice(0, count);
}

/** Grade sets the baseline tier; the difficulty dial nudges it up or down. */
export function tierFor(grade: GradeLevel, difficulty: Difficulty): Difficulty {
  const base = grade === 'kindergarten' ? 1 : grade === 'grade1' ? 2 : 3;
  const shifted = Math.round((base + difficulty) / 2);
  return Math.min(3, Math.max(1, shifted)) as Difficulty;
}

/** Words at or below the given tier, so easier content never disappears. */
export function wordsUpTo(tier: Difficulty): WordItem[] {
  return WORDS.filter(w => w.tier <= tier);
}

export function wordsAtTier(tier: Difficulty): WordItem[] {
  const exact = WORDS.filter(w => w.tier === tier);
  return exact.length >= 8 ? exact : wordsUpTo(tier);
}

export function lettersFor(tier: Difficulty): LetterItem[] {
  if (tier === 1) {
    return LETTERS.filter(l => 'ABCDFGHMNOPSTW'.includes(l.letter));
  }
  if (tier === 2) return LETTERS;
  return [...LETTERS, ...DIGRAPHS];
}

export function sentencesFor(tier: Difficulty): SentenceItem[] {
  const exact = SENTENCES.filter(s => s.tier === tier);
  return exact.length >= 4 ? exact : SENTENCES.filter(s => s.tier <= tier);
}

/** What stands in for the key word while it is still a gap. */
export const GAP = '_____';

/** The sentence (or a passage's blank statement) with its key word blanked out: "The cat is _____." */
export function maskKey(sentence: Pick<SentenceItem, 'text' | 'key'>): string {
  return sentence.text.replace(new RegExp(`\\b${sentence.key}\\b`, 'i'), GAP);
}

/** The quiet either side of "what" when a gap is read aloud. */
const GAP_PAUSE_MS = 300;

/**
 * The sentence read aloud without giving the gap away, asking "what?" where
 * the key word goes: "The train stops at the busy… what?" and
 * "A… what… frog jumps high?". The pause sets "what" apart, so a child hears
 * it isn't part of the sentence. Each text piece is its own clip; the voice
 * inventory renders them from this same helper.
 */
export function readWithGap(sentence: Pick<SentenceItem, 'text' | 'key'>): SpeechPart[] {
  const [before, after = ''] = maskKey(sentence).split(GAP).map(piece => piece.trim());
  const pause: SpeechPart = { pause: GAP_PAUSE_MS };
  const parts: SpeechPart[] = [];
  // built text is safe here only because the inventory and voice:audit both
  // walk every sentence through this helper
  if (before) parts.push({ text: before + '...' }, pause);
  if (/[a-z]/i.test(after)) {
    // the rest of the sentence is still part of the question
    parts.push({ text: before ? 'what...' : 'What...' }, pause, { text: after.replace(/[.!]$/, '?') });
  } else {
    parts.push({ text: before ? 'what?' : 'What?' });
  }
  return parts;
}

/** Treasure Path's passages for a grade. */
export function passagesFor(grade: GradeLevel): PassageItem[] {
  return PASSAGES.filter(p => p.grade === grade);
}

export function storiesFor(tier: Difficulty): MiniStory[] {
  const exact = MINI_STORIES.filter(s => s.tier === tier);
  return exact.length > 0 ? exact : MINI_STORIES;
}

/** Words that begin with a given grapheme. */
export function wordsStartingWith(initial: string, tier: Difficulty): WordItem[] {
  return wordsUpTo(tier).filter(w => w.initial === initial);
}

/** Words that definitely do NOT begin with the grapheme (and don't share its first letter). */
export function wordsNotStartingWith(initial: string, tier: Difficulty): WordItem[] {
  return wordsUpTo(tier).filter(w => w.initial[0] !== initial[0]);
}
