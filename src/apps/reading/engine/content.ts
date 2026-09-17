// Shared content bank for Ms. Luna's mini-games.
// Every game draws from this bank, so new words / sentences / letters
// become available to all games at once, at three difficulty tiers.

import type { GradeLevel } from '../../../types/reading';

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
    decoys: ['dog', 'bus', 'hat'],
    truth: [{ claim: 'The cat is big.', isTrue: true }, { claim: 'The cat is small.', isTrue: false }]
  },
  {
    text: 'A dog can run.',
    emoji: '🐶',
    tier: 1,
    key: 'run',
    decoys: ['sing', 'swim', 'read'],
    truth: [{ claim: 'The dog can run.', isTrue: true }, { claim: 'The dog can fly.', isTrue: false }]
  },
  {
    text: 'The sun is hot.',
    emoji: '☀️',
    tier: 1,
    key: 'hot',
    decoys: ['cold', 'wet', 'sad'],
    truth: [{ claim: 'The sun is hot.', isTrue: true }, { claim: 'The sun is cold.', isTrue: false }]
  },
  {
    text: 'I see a frog.',
    emoji: '🐸',
    tier: 1,
    key: 'frog',
    decoys: ['fish', 'flag', 'fan'],
    truth: [{ claim: 'I see a frog.', isTrue: true }, { claim: 'I see a truck.', isTrue: false }]
  },
  {
    text: 'The bug is red.',
    emoji: '🐞',
    tier: 1,
    key: 'red',
    decoys: ['blue', 'loud', 'ten'],
    truth: [{ claim: 'The bug is red.', isTrue: true }, { claim: 'The bug is green.', isTrue: false }]
  },
  {
    text: 'My hat is new.',
    emoji: '🎩',
    tier: 1,
    key: 'hat',
    decoys: ['cat', 'bed', 'cup'],
    truth: [{ claim: 'The hat is new.', isTrue: true }, { claim: 'The hat is old.', isTrue: false }]
  },

  // tier 2 — 5 to 6 words
  {
    text: 'The little cat is sleeping.',
    emoji: '😴',
    tier: 2,
    key: 'sleeping',
    decoys: ['jumping', 'eating', 'singing'],
    truth: [{ claim: 'The cat is sleeping.', isTrue: true }, { claim: 'The cat is running.', isTrue: false }]
  },
  {
    text: 'A green frog jumps high.',
    emoji: '🐸',
    tier: 2,
    key: 'green',
    decoys: ['brown', 'happy', 'seven'],
    truth: [{ claim: 'The frog is green.', isTrue: true }, { claim: 'The frog is purple.', isTrue: false }]
  },
  {
    text: 'The ship sails on water.',
    emoji: '🚢',
    tier: 2,
    key: 'water',
    decoys: ['grass', 'paper', 'winter'],
    truth: [{ claim: 'The ship sails on water.', isTrue: true }, { claim: 'The ship sails on sand.', isTrue: false }]
  },
  {
    text: 'My puppy likes warm milk.',
    emoji: '🐕',
    tier: 2,
    key: 'milk',
    decoys: ['rocks', 'socks', 'bikes'],
    truth: [{ claim: 'The puppy likes milk.', isTrue: true }, { claim: 'The puppy likes rocks.', isTrue: false }]
  },
  {
    text: 'Six chicks hop in mud.',
    emoji: '🐥',
    tier: 2,
    key: 'hop',
    decoys: ['read', 'drive', 'sleep'],
    truth: [{ claim: 'The chicks hop.', isTrue: true }, { claim: 'The chicks drive.', isTrue: false }]
  },

  // tier 3 — 7+ words
  {
    text: 'The little cat is sleeping under the table.',
    emoji: '🛋️',
    tier: 3,
    key: 'under',
    decoys: ['over', 'behind', 'before'],
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
    decoys: ['bench', 'branch', 'bread'],
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
    truth: [
      { claim: 'Snails move slowly.', isTrue: true },
      { claim: 'Snails move quickly.', isTrue: false }
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

/** Two options must never show the same picture, or the answer is ambiguous. */
export function distinctByEmoji(items: WordItem[], count: number, avoid: string[] = []): WordItem[] {
  const seen = new Set(avoid);
  const out: WordItem[] = [];
  for (const item of shuffle(items)) {
    if (seen.has(item.emoji)) continue;
    seen.add(item.emoji);
    out.push(item);
    if (out.length === count) break;
  }
  return out;
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
