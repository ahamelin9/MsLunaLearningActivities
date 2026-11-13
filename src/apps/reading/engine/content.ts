// Shared content bank for Ms. Luna's mini-games.
// Every game draws from this bank, so new words / sentences / letters
// become available to all games at once, at three difficulty tiers.

import type { GradeLevel } from '../../../types/reading';
import type { SpeechPart } from '../../../utils/speechParts';

export type Difficulty = 1 | 2 | 3;

export type CategoryId = 'animal' | 'food' | 'nature' | 'home' | 'clothes' | 'vehicle' | 'toy';

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
  /**
   * In lessons only, never dealt by a game (CNT-2): an action, where the
   * games' desks and cards hold things.
   */
  lessonOnly?: boolean;
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
  // no emoji draws a mop (it was a broom), so the M word is monkey (CNT-3)
  { word: 'monkey', emoji: '🐒', initial: 'm', cat: 'animal', tier: 1 },
  { word: 'web', emoji: '🕸️', initial: 'w', cat: 'nature', tier: 1 },
  { word: 'yarn', emoji: '🧶', initial: 'y', cat: 'toy', tier: 2 },
  { word: 'zebra', emoji: '🦓', initial: 'z', cat: 'animal', tier: 2 },
  { word: 'jam', emoji: '🍓', initial: 'j', cat: 'food', tier: 1, rime: 'am' },
  // no "ham": its picture is a meat bone (Alex, 2026-10-19; CNT-3)
  { word: 'duck', emoji: '🦆', initial: 'd', cat: 'animal', tier: 1 },
  { word: 'doll', emoji: '🪆', initial: 'd', cat: 'toy', tier: 1 },
  { word: 'vest', emoji: '🦺', initial: 'v', cat: 'clothes', tier: 2 },
  // the lessons' own words, with their pictures (CNT-2)
  { word: 'ball', emoji: '⚽', initial: 'b', cat: 'toy', tier: 1 },
  { word: 'run', emoji: '🏃', initial: 'r', cat: 'home', tier: 1, rime: 'un', lessonOnly: true },
  // CNT-5: more words children this age know, each with a picture that shows it
  { word: 'can', emoji: '🥫', initial: 'c', cat: 'food', tier: 1, rime: 'an' },
  { word: 'man', emoji: '👨', initial: 'm', cat: 'home', tier: 1, rime: 'an' },
  { word: 'pan', emoji: '🍳', initial: 'p', cat: 'home', tier: 1, rime: 'an' },
  { word: 'ram', emoji: '🐏', initial: 'r', cat: 'animal', tier: 1, rime: 'am' },
  { word: 'bag', emoji: '👜', initial: 'b', cat: 'clothes', tier: 1, rime: 'ag' },
  { word: 'cab', emoji: '🚕', initial: 'c', cat: 'vehicle', tier: 1, rime: 'ab' },
  { word: 'tag', emoji: '🏷️', initial: 't', cat: 'home', tier: 1, rime: 'ag' },
  { word: 'ax', emoji: '🪓', initial: 'a', cat: 'home', tier: 1 },
  { word: 'tub', emoji: '🛁', initial: 't', cat: 'home', tier: 1, rime: 'ub' },
  { word: 'ten', emoji: '🔟', initial: 't', cat: 'home', tier: 1, rime: 'en' },
  { word: 'leg', emoji: '🦵', initial: 'l', cat: 'home', tier: 1, rime: 'eg' },
  { word: 'bell', emoji: '🔔', initial: 'b', cat: 'home', tier: 1, rime: 'ell' },
  { word: 'pin', emoji: '📌', initial: 'p', cat: 'home', tier: 1, rime: 'in' },
  { word: 'lip', emoji: '👄', initial: 'l', cat: 'home', tier: 1, rime: 'ip' },
  { word: 'six', emoji: '6️⃣', initial: 's', cat: 'home', tier: 1, rime: 'ix' },
  { word: 'kid', emoji: '🧒', initial: 'k', cat: 'home', tier: 1, rime: 'id' },
  { word: 'pot', emoji: '🍲', initial: 'p', cat: 'home', tier: 1, rime: 'ot' },
  { word: 'lock', emoji: '🔒', initial: 'l', cat: 'home', tier: 1, rime: 'ock' },
  { word: 'nut', emoji: '🌰', initial: 'n', cat: 'food', tier: 1, rime: 'ut' },
  { word: 'bus', emoji: '🚌', initial: 'b', cat: 'vehicle', tier: 1, rime: 'us' },
  { word: 'king', emoji: '🤴', initial: 'k', cat: 'home', tier: 1, rime: 'ing' },
  { word: 'hand', emoji: '✋', initial: 'h', cat: 'home', tier: 1, rime: 'and' },
  { word: 'pants', emoji: '👖', initial: 'p', cat: 'clothes', tier: 1 },
  { word: 'wolf', emoji: '🐺', initial: 'w', cat: 'animal', tier: 1 },
  { word: 'banana', emoji: '🍌', initial: 'b', cat: 'food', tier: 1 },
  { word: 'carrot', emoji: '🥕', initial: 'c', cat: 'food', tier: 1 },
  { word: 'lemon', emoji: '🍋', initial: 'l', cat: 'food', tier: 1 },
  { word: 'tomato', emoji: '🍅', initial: 't', cat: 'food', tier: 1 },
  { word: 'rabbit', emoji: '🐰', initial: 'r', cat: 'animal', tier: 1 },
  { word: 'robot', emoji: '🤖', initial: 'r', cat: 'toy', tier: 1 },
  { word: 'tiger', emoji: '🐯', initial: 't', cat: 'animal', tier: 1 },
  { word: 'panda', emoji: '🐼', initial: 'p', cat: 'animal', tier: 1 },
  { word: 'penguin', emoji: '🐧', initial: 'p', cat: 'animal', tier: 1 },
  { word: 'octopus', emoji: '🐙', initial: 'o', cat: 'animal', tier: 1 },
  { word: 'orange', emoji: '🍊', initial: 'o', cat: 'food', tier: 1 },
  { word: 'pizza', emoji: '🍕', initial: 'p', cat: 'food', tier: 1 },
  { word: 'hug', emoji: '🤗', initial: 'h', cat: 'home', tier: 1, rime: 'ug', lessonOnly: true },

  // --- tier 2: digraphs, blends, magic e ---
  { word: 'fish', emoji: '🐟', initial: 'f', cat: 'animal', tier: 2 },
  { word: 'bear', emoji: '🐻', initial: 'b', cat: 'animal', tier: 2 },
  { word: 'bird', emoji: '🐦', initial: 'b', cat: 'animal', tier: 2 },
  { word: 'car', emoji: '🚗', initial: 'c', cat: 'vehicle', tier: 2 },
  { word: 'donut', emoji: '🍩', initial: 'd', cat: 'food', tier: 2 },
  { word: 'balloon', emoji: '🎈', initial: 'b', cat: 'toy', tier: 2 },
  { word: 'shark', emoji: '🦈', initial: 'sh', cat: 'animal', tier: 2 },
  { word: 'shirt', emoji: '👕', initial: 'sh', cat: 'clothes', tier: 2 },
  { word: 'shorts', emoji: '🩳', initial: 'sh', cat: 'clothes', tier: 2 },
  { word: 'cherry', emoji: '🍒', initial: 'ch', cat: 'food', tier: 2 },
  { word: 'three', emoji: '3️⃣', initial: 'th', cat: 'home', tier: 2 },
  { word: 'clock', emoji: '🕐', initial: 'cl', cat: 'home', tier: 2, rime: 'ock' },
  { word: 'brick', emoji: '🧱', initial: 'br', cat: 'home', tier: 2 },
  { word: 'plug', emoji: '🔌', initial: 'pl', cat: 'home', tier: 2 },
  { word: 'grape', emoji: '🍇', initial: 'gr', cat: 'food', tier: 2 },
  { word: 'dress', emoji: '👗', initial: 'dr', cat: 'clothes', tier: 2 },
  { word: 'dragon', emoji: '🐉', initial: 'dr', cat: 'animal', tier: 2 },
  { word: 'crayon', emoji: '🖍️', initial: 'cr', cat: 'toy', tier: 2 },
  { word: 'broom', emoji: '🧹', initial: 'br', cat: 'home', tier: 2 },
  { word: 'bridge', emoji: '🌉', initial: 'br', cat: 'nature', tier: 2 },
  { word: 'trophy', emoji: '🏆', initial: 'tr', cat: 'toy', tier: 2 },
  { word: 'skate', emoji: '⛸️', initial: 'sk', cat: 'toy', tier: 2 },
  { word: 'ski', emoji: '🎿', initial: 'sk', cat: 'toy', tier: 2 },
  { word: 'skunk', emoji: '🦨', initial: 'sk', cat: 'animal', tier: 2 },
  { word: 'spider', emoji: '🕷️', initial: 'sp', cat: 'animal', tier: 2 },
  { word: 'swan', emoji: '🦢', initial: 'sw', cat: 'animal', tier: 2 },
  { word: 'store', emoji: '🏪', initial: 'st', cat: 'home', tier: 2 },
  { word: 'game', emoji: '🎮', initial: 'g', cat: 'toy', tier: 2 },
  { word: 'vase', emoji: '🏺', initial: 'v', cat: 'home', tier: 2 },
  { word: 'wave', emoji: '🌊', initial: 'w', cat: 'nature', tier: 2 },
  { word: 'five', emoji: '5️⃣', initial: 'f', cat: 'home', tier: 2 },
  { word: 'nine', emoji: '9️⃣', initial: 'n', cat: 'home', tier: 2 },
  { word: 'rice', emoji: '🍚', initial: 'r', cat: 'food', tier: 2 },
  { word: 'slide', emoji: '🛝', initial: 'sl', cat: 'toy', tier: 2 },
  { word: 'flute', emoji: '🪈', initial: 'fl', cat: 'toy', tier: 2 },
  { word: 'globe', emoji: '🌍', initial: 'gl', cat: 'home', tier: 2 },
  { word: 'rope', emoji: '🪢', initial: 'r', cat: 'home', tier: 2 },
  { word: 'ape', emoji: '🦍', initial: 'a', cat: 'animal', tier: 2 },
  { word: 'plant', emoji: '🪴', initial: 'pl', cat: 'nature', tier: 2 },
  { word: 'sled', emoji: '🛷', initial: 'sl', cat: 'toy', tier: 2 },
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
  { word: 'truck', emoji: '🚚', initial: 'tr', cat: 'vehicle', tier: 2 },
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
  // American English: a football is 🏈; ⚽ is a soccer ball (CNT-3)
  { word: 'football', emoji: '🏈', initial: 'f', cat: 'toy', tier: 3 },
  { word: 'toothbrush', emoji: '🪥', initial: 't', cat: 'home', tier: 3 },
  { word: 'pancake', emoji: '🥞', initial: 'p', cat: 'food', tier: 3 },
  { word: 'bowl', emoji: '🥣', initial: 'b', cat: 'home', tier: 3 },
  { word: 'cloud', emoji: '☁️', initial: 'cl', cat: 'nature', tier: 3 },
  { word: 'cookie', emoji: '🍪', initial: 'c', cat: 'food', tier: 3 },
  { word: 'forest', emoji: '🌲', initial: 'f', cat: 'nature', tier: 3 },
  { word: 'mail', emoji: '📬', initial: 'm', cat: 'home', tier: 3 },
  { word: 'paint', emoji: '🎨', initial: 'p', cat: 'home', tier: 3 },
  { word: 'chain', emoji: '⛓️', initial: 'ch', cat: 'home', tier: 3 },
  { word: 'hay', emoji: '🌾', initial: 'h', cat: 'nature', tier: 3 },
  { word: 'daisy', emoji: '🌼', initial: 'd', cat: 'nature', tier: 3 },
  { word: 'bee', emoji: '🐝', initial: 'b', cat: 'animal', tier: 3 },
  { word: 'feet', emoji: '🦶', initial: 'f', cat: 'home', tier: 3 },
  { word: 'queen', emoji: '👸', initial: 'qu', cat: 'home', tier: 3 },
  { word: 'tea', emoji: '🍵', initial: 't', cat: 'food', tier: 3 },
  { word: 'meat', emoji: '🍖', initial: 'm', cat: 'food', tier: 3 },
  { word: 'beans', emoji: '🫘', initial: 'b', cat: 'food', tier: 3 },
  { word: 'soap', emoji: '🧼', initial: 's', cat: 'home', tier: 3 },
  { word: 'road', emoji: '🛣️', initial: 'r', cat: 'nature', tier: 3 },
  { word: 'window', emoji: '🪟', initial: 'w', cat: 'home', tier: 3 },
  { word: 'light', emoji: '💡', initial: 'l', cat: 'home', tier: 3 },
  { word: 'night', emoji: '🌃', initial: 'n', cat: 'nature', tier: 3 },
  { word: 'flashlight', emoji: '🔦', initial: 'fl', cat: 'home', tier: 3 },
  { word: 'stoplight', emoji: '🚦', initial: 'st', cat: 'vehicle', tier: 3 },
  { word: 'boot', emoji: '👢', initial: 'b', cat: 'clothes', tier: 3 },
  { word: 'book', emoji: '📖', initial: 'b', cat: 'home', tier: 3 },
  { word: 'hook', emoji: '🪝', initial: 'h', cat: 'home', tier: 3 },
  { word: 'mouse', emoji: '🐭', initial: 'm', cat: 'animal', tier: 3 },
  { word: 'house', emoji: '🏠', initial: 'h', cat: 'home', tier: 3 },
  { word: 'couch', emoji: '🛋️', initial: 'c', cat: 'home', tier: 3 },
  { word: 'cow', emoji: '🐮', initial: 'c', cat: 'animal', tier: 3 },
  { word: 'mountain', emoji: '⛰️', initial: 'm', cat: 'nature', tier: 3 },
  { word: 'clown', emoji: '🤡', initial: 'cl', cat: 'toy', tier: 3 },
  { word: 'shower', emoji: '🚿', initial: 'sh', cat: 'home', tier: 3 },
  { word: 'jar', emoji: '🫙', initial: 'j', cat: 'home', tier: 3 },
  { word: 'arm', emoji: '💪', initial: 'a', cat: 'home', tier: 3 },
  { word: 'cart', emoji: '🛒', initial: 'c', cat: 'vehicle', tier: 3 },
  { word: 'scarf', emoji: '🧣', initial: 'sc', cat: 'clothes', tier: 3 },
  { word: 'guitar', emoji: '🎸', initial: 'g', cat: 'toy', tier: 3 },
  { word: 'farmer', emoji: '🧑‍🌾', initial: 'f', cat: 'home', tier: 3 },
  { word: 'alarm', emoji: '⏰', initial: 'a', cat: 'home', tier: 3 },
  { word: 'corn', emoji: '🌽', initial: 'c', cat: 'food', tier: 3 },
  { word: 'fork', emoji: '🍴', initial: 'f', cat: 'home', tier: 3 },
  { word: 'storm', emoji: '⛈️', initial: 'st', cat: 'nature', tier: 3 },
  { word: 'horse', emoji: '🐴', initial: 'h', cat: 'animal', tier: 3 },
  { word: 'horn', emoji: '📯', initial: 'h', cat: 'toy', tier: 3 },
  { word: 'unicorn', emoji: '🦄', initial: 'u', cat: 'animal', tier: 3 },
  { word: 'girl', emoji: '👧', initial: 'g', cat: 'home', tier: 3 },
  { word: 'turtle', emoji: '🐢', initial: 't', cat: 'animal', tier: 3 },
  { word: 'purse', emoji: '👛', initial: 'p', cat: 'clothes', tier: 3 },
  { word: 'hammer', emoji: '🔨', initial: 'h', cat: 'home', tier: 3 },
  { word: 'ladder', emoji: '🪜', initial: 'l', cat: 'home', tier: 3 },
  { word: 'burger', emoji: '🍔', initial: 'b', cat: 'food', tier: 3 },
  { word: 'ladybug', emoji: '🐞', initial: 'l', cat: 'animal', tier: 3 },
  { word: 'snowman', emoji: '⛄', initial: 'sn', cat: 'nature', tier: 3 },
  { word: 'hotdog', emoji: '🌭', initial: 'h', cat: 'food', tier: 3 },
  { word: 'backpack', emoji: '🎒', initial: 'b', cat: 'clothes', tier: 3 },
  { word: 'firetruck', emoji: '🚒', initial: 'f', cat: 'vehicle', tier: 3 },
  { word: 'goldfish', emoji: '🐠', initial: 'g', cat: 'animal', tier: 3 },
  { word: 'jellyfish', emoji: '🪼', initial: 'j', cat: 'animal', tier: 3 },
  { word: 'sunglasses', emoji: '🕶️', initial: 's', cat: 'clothes', tier: 3 },
  { word: 'teapot', emoji: '🫖', initial: 't', cat: 'home', tier: 3 },
  { word: 'cowboy', emoji: '🤠', initial: 'c', cat: 'clothes', tier: 3 },
  { word: 'basketball', emoji: '🏀', initial: 'b', cat: 'toy', tier: 3 },
  { word: 'baseball', emoji: '⚾', initial: 'b', cat: 'toy', tier: 3 },
  { word: 'watermelon', emoji: '🍉', initial: 'w', cat: 'food', tier: 3 },
  { word: 'pineapple', emoji: '🍍', initial: 'p', cat: 'food', tier: 3 },
  { word: 'notebook', emoji: '📓', initial: 'n', cat: 'home', tier: 3 },
  { word: 'fireworks', emoji: '🎆', initial: 'f', cat: 'nature', tier: 3 },
  { word: 'pie', emoji: '🥧', initial: 'p', cat: 'food', tier: 3 },
  { word: 'tie', emoji: '👔', initial: 't', cat: 'clothes', tier: 3 },
  { word: 'tooth', emoji: '🦷', initial: 't', cat: 'home', tier: 3 },
  { word: 'pear', emoji: '🍐', initial: 'p', cat: 'food', tier: 3 },
  { word: 'ear', emoji: '👂', initial: 'e', cat: 'home', tier: 3 },
  { word: 'boy', emoji: '👦', initial: 'b', cat: 'home', tier: 3 },
  { word: 'coin', emoji: '🪙', initial: 'c', cat: 'home', tier: 3 },
  { word: 'toy', emoji: '🧸', initial: 't', cat: 'toy', tier: 3 },
  { word: 'sky', emoji: '🌌', initial: 's', cat: 'nature', tier: 3 },
  { word: 'fly', emoji: '🪰', initial: 'f', cat: 'animal', tier: 3 },
  { word: 'cry', emoji: '😭', initial: 'cr', cat: 'home', tier: 3, lessonOnly: true }
];

/** What the games deal: everything but a lesson's own actions (CNT-2). */
const GAME_WORDS = WORDS.filter(w => !w.lessonOnly);

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
  /**
   * At tier 3 Words Off the Page adds an extra tile: any extra tile that would
   * make this sentence true in place of one of its words, so none is ever
   * offered as wrong (CNT-1b). Written by hand: code can't tell what fits.
   */
  alsoFits?: string[];
}

export const SENTENCES: SentenceItem[] = [
  // tier 1 — 3 to 4 words
  {
    text: 'The cat is big.',
    emoji: '🐱',
    tier: 1,
  },
  {
    text: 'A dog can run.',
    emoji: '🐶',
    tier: 1,
  },
  {
    text: 'The sun is hot.',
    emoji: '☀️',
    tier: 1,
  },
  {
    text: 'I see a frog.',
    emoji: '🐸',
    tier: 1,
  },
  {
    text: 'The bug is red.',
    emoji: '🐞',
    tier: 1,
  },
  {
    text: 'My hat is new.',
    emoji: '🎩',
    tier: 1,
  },

  {
    text: "The fish can swim.",
    emoji: '🐟',
    tier: 1,
  },
  {
    text: "My ball is round.",
    emoji: '⚽',
    tier: 1,
  },
  {
    text: "The bird can fly.",
    emoji: '🐦',
    tier: 1,
  },
  {
    text: "A pig is pink.",
    emoji: '🐷',
    tier: 1,
  },
  {
    text: "The bed is soft.",
    emoji: '🛏️',
    tier: 1,
  },
  {
    text: "I eat my cake.",
    emoji: '🎂',
    tier: 1,
  },
  {
    text: "The moon is up.",
    emoji: '🌙',
    tier: 1,
  },
  {
    text: "We go to school.",
    emoji: '🏫',
    tier: 1,
  },
  {
    text: "A cow says moo.",
    emoji: '🐄',
    tier: 1,
  },
  {
    text: "The rain is wet.",
    emoji: '🌧️',
    tier: 1,
  },
  // CUR-15: 20 a play, so each tier holds 20 or more
  {
    text: 'The fox is red.',
    emoji: '🦊',
    tier: 1,
  },
  {
    text: 'A duck can swim.',
    emoji: '🦆',
    tier: 1,
  },
  {
    text: 'I have a kite.',
    emoji: '🪁',
    tier: 1,
  },
  {
    text: 'The box is big.',
    emoji: '📦',
    tier: 1,
  },
  {
    text: 'I hug my mom.',
    emoji: '🤗',
    tier: 1,
  },
  // tier 2 — 5 to 6 words
  {
    text: 'The little cat is sleeping.',
    // the cat, not a sleepy face (CNT-3)
    emoji: '🐱',
    tier: 2,
  },
  {
    text: 'A green frog jumps high.',
    emoji: '🐸',
    tier: 2,
  },
  {
    text: 'The ship sails on water.',
    emoji: '🚢',
    tier: 2,
  },
  {
    text: 'My kitten likes warm milk.',
    emoji: '🐱',
    tier: 2,
  },
  {
    text: 'Six chicks hop in mud.',
    emoji: '🐥',
    tier: 2,
  },

  {
    text: "A little duck swims fast.",
    emoji: '🦆',
    tier: 2,
  },
  {
    text: "My dad bakes good bread.",
    emoji: '🥖',
    tier: 2,
  },
  {
    text: "The big bear sleeps all winter.",
    emoji: '🐻',
    tier: 2,
  },
  {
    text: "Bees make sweet honey.",
    emoji: '🐝',
    tier: 2,
  },
  {
    text: "We plant seeds in spring.",
    emoji: '🌱',
    tier: 2,
  },
  {
    text: "The snow is cold and white.",
    emoji: '❄️',
    tier: 2,
  },
  {
    text: "A red fox runs away.",
    emoji: '🦊',
    tier: 2,
  },
  {
    text: "Two birds sit in a nest.",
    emoji: '🐦',
    tier: 2,
  },
  {
    text: "She reads a book at night.",
    emoji: '📖',
    tier: 2,
  },
  {
    text: "My mom drives a big truck.",
    emoji: '🚚',
    tier: 2,
  },
  {
    text: "The baby claps her hands.",
    emoji: '👶',
    tier: 2,
  },
  {
    text: "Fish swim in the deep sea.",
    emoji: '🐠',
    tier: 2,
  },
  // CUR-15
  {
    text: 'The dog digs in the sand.',
    emoji: '🐶',
    tier: 2,
  },
  {
    text: 'We eat lunch at school.',
    emoji: '🥪',
    tier: 2,
  },
  {
    text: 'A big whale swims by.',
    emoji: '🐋',
    tier: 2,
  },
  {
    text: 'My sister rides a bike.',
    emoji: '🚲',
    tier: 2,
  },
  // tier 3 — 7+ words
  {
    text: 'The little cat is sleeping under the table.',
    // the cat: no emoji draws a table, and a couch isn't one (CNT-3)
    emoji: '🐱',
    tier: 3,
    alsoFits: ['window'],
  },
  {
    text: 'A bright rainbow appears after the rain.',
    emoji: '🌈',
    tier: 3,
  },
  {
    text: 'My friend reads a book on the beach.',
    emoji: '🏖️',
    tier: 3,
    alsoFits: ['window'],
  },
  {
    text: 'The train stops at the busy station.',
    emoji: '🚆',
    tier: 3,
    alsoFits: ['purple'],
  },
  {
    text: 'Snails move slowly across the wet leaf.',
    emoji: '🐌',
    tier: 3,
    alsoFits: ['window', 'purple', 'banana'],
  },
  {
    text: "The farmer feeds the hungry chickens every morning.",
    emoji: '🐔',
    tier: 3,
    alsoFits: ['seven'],
  },
  {
    text: "Our teacher reads a funny story after lunch.",
    emoji: '📚',
    tier: 3,
    alsoFits: ['seven'],
  },
  {
    text: "Busy bees carry sweet nectar to their hive.",
    emoji: '🐝',
    tier: 3,
  },
  {
    text: "A tall giraffe eats green leaves from the tree.",
    emoji: '🦒',
    tier: 3,
    alsoFits: ['seven'],
  },
  {
    text: "The brave firefighter climbs up the long ladder.",
    emoji: '🚒',
    tier: 3,
    alsoFits: ['purple'],
  },
  {
    text: "Penguins slide across the ice on their bellies.",
    emoji: '🐧',
    tier: 3,
  },
  {
    text: "Grandma knits warm mittens when the weather is cold.",
    emoji: '🧤',
    tier: 3,
    alsoFits: ['purple', 'seven'],
  },
  {
    text: "The little turtle walks slowly to the pond.",
    emoji: '🐢',
    tier: 3,
    alsoFits: ['window', 'banana'],
  },
  {
    text: "We packed apples and sandwiches for our picnic.",
    emoji: '🧺',
    tier: 3,
    alsoFits: ['banana'],
  },
  {
    text: "My brother builds tall towers with wooden blocks.",
    emoji: '🧱',
    tier: 3,
    alsoFits: ['purple', 'seven'],
  },
  {
    text: "Bright stars twinkle in the dark night sky.",
    emoji: '⭐',
    tier: 3,
    alsoFits: ['purple', 'seven'],
  },
  {
    text: "The kind nurse puts a bandage on my knee.",
    emoji: '🩹',
    tier: 3,
  },
  // CUR-15
  {
    text: 'Dad reads me a story before bed.',
    emoji: '📖',
    tier: 3,
    alsoFits: ['quickly'],
  },
  {
    text: 'The yellow bus takes us to school.',
    emoji: '🚌',
    tier: 3,
    alsoFits: ['purple'],
  },
  {
    text: 'My grandpa grows red tomatoes in his garden.',
    emoji: '🍅',
    tier: 3,
    alsoFits: ['purple', 'seven'],
  },
  {
    text: 'Mom cuts the cake for my birthday.',
    emoji: '🎂',
    tier: 3,
    alsoFits: ['banana'],
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
    emoji: '🌙',
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
    emoji: '🛏️',
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

  {
    id: 'k-pip-hat',
    grade: 'kindergarten',
    emoji: '🎒',
    lines: [
      "Pip has a new hat.",
      "He wears it to school."
    ],
    truth: [
      { claim: "The hat is new.", isTrue: true },
      { claim: "Pip wears the hat to bed.", isTrue: false }
    ],
    blanks: [
      {
        text: "Pip is at school in his hat.",
        key: 'school',
        decoys: ['bed', 'pond', 'sky'],
        alsoFits: ['class', 'lunch', 'work', 'camp']
      }
    ]
  },
  {
    id: 'k-fish-bowl',
    grade: 'kindergarten',
    emoji: '💧',
    lines: [
      "Luna has a pet fish.",
      "It swims in a round bowl."
    ],
    truth: [
      { claim: "Luna has a fish.", isTrue: true },
      { claim: "The fish lives in a box.", isTrue: false }
    ],
    blanks: [
      {
        text: "Luna's fish lives in a bowl.",
        key: 'bowl',
        decoys: ['bed', 'hat', 'tree'],
        alsoFits: ['tank', 'water', 'home', 'house']
      }
    ]
  },
  {
    id: 'k-warm-coat',
    grade: 'kindergarten',
    emoji: '🧣',
    lines: [
      "It is a cold day.",
      "Luna puts on her warm coat."
    ],
    truth: [
      { claim: "The day is cold.", isTrue: true },
      { claim: "Luna takes off her coat.", isTrue: false }
    ],
    blanks: [
      {
        text: "Luna's coat is warm.",
        key: 'warm',
        decoys: ['cold', 'wet', 'thin'],
        alsoFits: ['nice', 'new', 'big', 'soft', 'thick', 'cozy', 'on']
      }
    ]
  },
  {
    id: 'k-hen-eggs',
    grade: 'kindergarten',
    emoji: '🥚',
    lines: [
      "A hen sits on two eggs.",
      "Soon two chicks come out."
    ],
    truth: [
      { claim: "There are two chicks.", isTrue: true },
      { claim: "The hen sits on a log.", isTrue: false }
    ],
    blanks: [
      {
        text: "The eggs are under the hen.",
        key: 'hen',
        decoys: ['dog', 'cat', 'pig'],
        alsoFits: ['chicken', 'mom', 'bird', 'mother', 'nest']
      }
    ]
  },
  {
    id: 'k-big-dog',
    grade: 'kindergarten',
    emoji: '🦴',
    lines: [
      "A big dog runs to Luna.",
      "It licks her face."
    ],
    truth: [
      { claim: "The dog is big.", isTrue: true },
      { claim: "The dog runs away from Luna.", isTrue: false }
    ],
    blanks: [
      {
        text: "The dog gives Luna a lick.",
        key: 'lick',
        decoys: ['hat', 'cake', 'book'],
        alsoFits: ['hug', 'kiss', 'smile', 'nudge', 'look']
      }
    ]
  },
  {
    id: 'k-mud-boots',
    grade: 'kindergarten',
    emoji: '🌧️',
    lines: [
      "Luna has red boots.",
      "She jumps in the mud."
    ],
    truth: [
      { claim: "Luna's boots are red.", isTrue: true },
      { claim: "Luna jumps on the bed.", isTrue: false }
    ],
    blanks: [
      {
        text: "The mud gets on her boots.",
        key: 'boots',
        decoys: ['book', 'cake', 'bed'],
        alsoFits: ['feet', 'legs', 'toes', 'socks', 'wings', 'feathers', 'claws', 'face', 'shoes']
      }
    ]
  },
  {
    id: 'k-apple-tree',
    grade: 'kindergarten',
    emoji: '🧺',
    lines: [
      "Luna sees an apple tree.",
      "She picks one red apple."
    ],
    truth: [
      { claim: "Luna picks an apple.", isTrue: true },
      { claim: "Luna picks ten apples.", isTrue: false }
    ],
    blanks: [
      {
        text: "The apple comes from a tree.",
        key: 'tree',
        decoys: ['box', 'car', 'bed'],
        alsoFits: ['branch', 'farm', 'garden']
      }
    ]
  },
  {
    id: 'k-pip-song',
    grade: 'kindergarten',
    emoji: '🎵',
    lines: [
      "Pip sings a song.",
      "Luna claps her wings."
    ],
    truth: [
      { claim: "Pip is singing.", isTrue: true },
      { claim: "Luna sings and Pip claps.", isTrue: false }
    ],
    blanks: [
      {
        text: "Luna claps for her friend.",
        key: 'friend',
        decoys: ['hat', 'sock', 'bed'],
        alsoFits: ['pal', 'buddy', 'song', 'singer', 'music']
      }
    ]
  },
  {
    id: 'k-bus-zoo',
    grade: 'kindergarten',
    emoji: '🚌',
    lines: [
      "Luna gets on the bus.",
      "It takes her to the zoo."
    ],
    truth: [
      { claim: "Luna rides the bus.", isTrue: true },
      { claim: "The bus goes to the pond.", isTrue: false }
    ],
    blanks: [
      {
        text: "Luna's bus ride ends at a zoo.",
        key: 'zoo',
        decoys: ['bed', 'moon', 'cup'],
        alsoFits: ['stop', 'gate', 'park']
      }
    ]
  },
  {
    id: 'k-sunny-cat',
    grade: 'kindergarten',
    emoji: '🐈',
    lines: [
      "The cat sits in the sun.",
      "Soon it is asleep."
    ],
    truth: [
      { claim: "The cat goes to sleep.", isTrue: true },
      { claim: "It is raining on the cat.", isTrue: false }
    ],
    blanks: [
      {
        text: "The cat is in a sunny spot.",
        key: 'sunny',
        decoys: ['wet', 'cold', 'dark'],
        alsoFits: ['warm', 'nice', 'good', 'bright', 'hot', 'cozy']
      }
    ]
  },
  {
    id: 'k-two-cookies',
    grade: 'kindergarten',
    emoji: '💛',
    lines: [
      "Pip has two cookies.",
      "He gives one to Luna."
    ],
    truth: [
      { claim: "Pip shares with Luna.", isTrue: true },
      { claim: "Pip eats both cookies.", isTrue: false }
    ],
    blanks: [
      {
        text: "Now Luna has a cookie too.",
        key: 'cookie',
        decoys: ['sock', 'hat', 'bed'],
        alsoFits: ['treat', 'snack']
      }
    ]
  },
  {
    id: 'k-one-star',
    grade: 'kindergarten',
    emoji: '🌌',
    lines: [
      "Luna looks up at night.",
      "She sees one bright star."
    ],
    truth: [
      { claim: "Luna sees a star.", isTrue: true },
      { claim: "Luna looks down.", isTrue: false }
    ],
    blanks: [
      {
        text: "The star is bright.",
        key: 'bright',
        decoys: ['dark', 'wet', 'sad'],
        alsoFits: ['big', 'pretty', 'white', 'little', 'shiny', 'far', 'up', 'out', 'yellow', 'high']
      }
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
    emoji: '🌙',
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
    emoji: '🌅',
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

  {
    id: 'g1-lost-mitten',
    grade: 'grade1',
    emoji: '❄️',
    lines: [
      "Pip lost one mitten in the snow.",
      "Luna helped him look for it.",
      "They found it under a bush."
    ],
    truth: [
      { claim: "Pip lost a mitten.", isTrue: true },
      { claim: "Luna helped Pip.", isTrue: true },
      { claim: "The mitten was under a rock.", isTrue: false }
    ],
    blanks: [
      {
        text: "Pip was happy to have his mitten back.",
        key: 'mitten',
        decoys: ['hat', 'sock', 'cake'],
        alsoFits: ['glove', 'hand', 'friend']
      }
    ]
  },
  {
    id: 'g1-green-kite',
    grade: 'grade1',
    emoji: '🍃',
    lines: [
      "Today is a windy day.",
      "Luna and Pip fly a green kite.",
      "It goes higher than the trees."
    ],
    truth: [
      { claim: "There is a lot of wind.", isTrue: true },
      { claim: "The kite is blue.", isTrue: false },
      { claim: "The kite stays on the ground.", isTrue: false }
    ],
    blanks: [
      {
        text: "The kite is up above the trees.",
        key: 'above',
        decoys: ['under', 'below', 'behind'],
        alsoFits: ['over', 'past', 'near', 'by']
      }
    ]
  },
  {
    id: 'g1-hot-soup',
    grade: 'grade1',
    emoji: '🥣',
    lines: [
      "Luna feels sick today.",
      "Pip brings her hot soup.",
      "She feels better after she eats it."
    ],
    truth: [
      { claim: "Pip is kind to Luna.", isTrue: true },
      { claim: "Luna feels sick after the soup.", isTrue: false }
    ],
    blanks: [
      {
        text: "The soup helps Luna get well.",
        key: 'well',
        decoys: ['sick', 'sad', 'cold'],
        alsoFits: ['better', 'strong', 'warm', 'up']
      }
    ]
  },
  {
    id: 'g1-school-bell',
    grade: 'grade1',
    emoji: '🔔',
    lines: [
      "The school bell rings.",
      "Luna runs to her class.",
      "She gets to her seat just in time."
    ],
    truth: [
      { claim: "Luna hurries to class.", isTrue: true },
      { claim: "Luna is late for class.", isTrue: false },
      { claim: "Luna walks home.", isTrue: false }
    ],
    blanks: [
      {
        text: "The class starts when the bell rings.",
        key: 'class',
        decoys: ['moon', 'snow', 'cake'],
        alsoFits: ['school', 'day', 'lesson', 'work', 'teacher', 'reading']
      }
    ]
  },
  {
    id: 'g1-leaf-bug',
    grade: 'grade1',
    emoji: '🌿',
    lines: [
      "Luna finds a bug on a leaf.",
      "It has red wings and black dots.",
      "She lets it fly away."
    ],
    truth: [
      { claim: "The bug has dots.", isTrue: true },
      { claim: "Luna keeps the bug in a jar.", isTrue: false },
      { claim: "The bug is on a rock.", isTrue: false }
    ],
    blanks: [
      {
        text: "The wings of the bug are red.",
        key: 'red',
        decoys: ['blue', 'green', 'pink'],
        alsoFits: ['shiny', 'small', 'little', 'pretty', 'tiny', 'black']
      }
    ]
  },
  {
    id: 'g1-big-umbrella',
    grade: 'grade1',
    emoji: '☁️',
    lines: [
      "Dark clouds fill the sky.",
      "Luna opens her big umbrella.",
      "She walks home and stays dry."
    ],
    truth: [
      { claim: "It looks like rain.", isTrue: true },
      { claim: "Luna gets all wet.", isTrue: false },
      { claim: "The sky is sunny.", isTrue: false }
    ],
    blanks: [
      {
        text: "Her umbrella keeps Luna dry.",
        key: 'dry',
        decoys: ['wet', 'cold', 'muddy'],
        alsoFits: ['safe', 'warm', 'happy', 'clean']
      }
    ]
  },
  {
    id: 'g1-whale-book',
    grade: 'grade1',
    emoji: '📖',
    lines: [
      "Luna goes to the library.",
      "She picks a book about whales.",
      "She reads it under a tree."
    ],
    truth: [
      { claim: "The book is about whales.", isTrue: true },
      { claim: "Luna reads in her bed.", isTrue: false },
      { claim: "The book is about cats.", isTrue: false }
    ],
    blanks: [
      {
        text: "Luna sits by the tree to read.",
        key: 'tree',
        decoys: ['bus', 'sink', 'stove'],
        alsoFits: ['window', 'pond', 'lake', 'sea', 'fire', 'wall', 'house', 'door', 'library']
      }
    ]
  },
  {
    id: 'g1-new-girl',
    grade: 'grade1',
    emoji: '🤝',
    lines: [
      "A new girl comes to school.",
      "She eats lunch all alone.",
      "Luna asks the girl to sit with her."
    ],
    truth: [
      { claim: "Luna is kind to the new girl.", isTrue: true },
      { claim: "The girl is new at school.", isTrue: true },
      { claim: "The girl eats with ten friends.", isTrue: false }
    ],
    blanks: [
      {
        text: "Now the new girl has a friend.",
        key: 'friend',
        decoys: ['hat', 'pet', 'bike'],
        alsoFits: ['pal', 'buddy', 'seat', 'lunch', 'chair', 'place', 'spot', 'smile']
      }
    ]
  },
  {
    id: 'g1-sand-castle',
    grade: 'grade1',
    emoji: '🏖️',
    lines: [
      "Luna and Pip go to the beach.",
      "They make a tall castle out of sand.",
      "A big wave knocks it down."
    ],
    truth: [
      { claim: "The friends build with sand.", isTrue: true },
      { claim: "The castle is still up.", isTrue: false },
      { claim: "They go to the zoo.", isTrue: false }
    ],
    blanks: [
      {
        text: "The water knocks the castle over.",
        key: 'castle',
        decoys: ['bus', 'cake', 'lamp'],
        alsoFits: ['tower', 'sand', 'fort']
      }
    ]
  },
  {
    id: 'g1-night-owl',
    grade: 'grade1',
    emoji: '🌙',
    lines: [
      "Owls sleep in the day.",
      "Luna wakes up when it gets dark.",
      "She likes to read at night."
    ],
    truth: [
      { claim: "Luna is awake at night.", isTrue: true },
      { claim: "Owls sleep at night.", isTrue: false },
      { claim: "Luna reads in the morning.", isTrue: false }
    ],
    blanks: [
      {
        text: "Luna gets up when the sun goes down.",
        key: 'down',
        decoys: ['high', 'fast', 'far'],
        alsoFits: ['away', 'out', 'under']
      }
    ]
  },
  {
    id: 'g1-three-ducks',
    grade: 'grade1',
    emoji: '🦆',
    lines: [
      "Three ducks swim in the pond.",
      "Pip throws them some bread.",
      "They quack and swim to him."
    ],
    truth: [
      { claim: "Pip feeds the ducks.", isTrue: true },
      { claim: "There are five ducks.", isTrue: false },
      { claim: "The ducks swim away.", isTrue: false }
    ],
    blanks: [
      {
        text: "The ducks eat the bread from Pip.",
        key: 'bread',
        decoys: ['socks', 'hats', 'rocks'],
        alsoFits: ['food', 'crumbs', 'snack', 'treats', 'lunch', 'meal']
      }
    ]
  },
  {
    id: 'g1-birthday-card',
    grade: 'grade1',
    emoji: '🎉',
    lines: [
      "It is Pip's birthday today.",
      "Luna makes him a card.",
      "She draws a cake on the front."
    ],
    truth: [
      { claim: "Luna makes a card for Pip.", isTrue: true },
      { claim: "The card has a dog on it.", isTrue: false },
      { claim: "It is Luna's birthday.", isTrue: false }
    ],
    blanks: [
      {
        text: "The card is for his birthday.",
        key: 'birthday',
        decoys: ['lunch', 'bath', 'nap'],
        alsoFits: ['party', 'friend', 'day']
      }
    ]
  },

  // ---- 2nd grade: 4 to 5 sentences ----
  {
    id: 'g2-windy-library',
    grade: 'grade2',
    emoji: '📚',
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
  },
  {
    id: 'g2-garden-bridge',
    grade: 'grade2',
    emoji: '🌳',
    lines: [
      "A storm knocked a branch onto the little garden bridge.",
      "Pip could not cross to get to his carrots.",
      "Luna called all of her friends to help.",
      "Together they lifted the heavy branch and moved it away."
    ],
    truth: [
      { claim: "The friends worked as a team.", isTrue: true },
      { claim: "Pip moved the branch by himself.", isTrue: false },
      { claim: "A storm broke the library door.", isTrue: false }
    ],
    blanks: [
      {
        text: "The branch was too heavy for one friend.",
        key: 'heavy',
        decoys: ['light', 'small', 'tiny'],
        alsoFits: ['big', 'long', 'thick', 'large', 'much']
      }
    ]
  },
  {
    id: 'g2-snow-tracks',
    grade: 'grade2',
    emoji: '🐾',
    lines: [
      "One snowy morning, Luna saw small tracks by the door.",
      "She followed them past the garden and around the big rock.",
      "The tracks stopped at a pile of leaves.",
      "Inside was a sleepy rabbit, curled up to stay warm."
    ],
    truth: [
      { claim: "A rabbit made the tracks.", isTrue: true },
      { claim: "Luna saw the tracks on a sunny day.", isTrue: false },
      { claim: "The rabbit was awake and running.", isTrue: false }
    ],
    blanks: [
      {
        text: "The rabbit hid under the leaves to keep warm.",
        key: 'warm',
        decoys: ['cold', 'wet', 'hungry'],
        alsoFits: ['safe', 'cozy', 'dry', 'hidden', 'asleep', 'quiet', 'toasty']
      }
    ]
  },
  {
    id: 'g2-lemonade',
    grade: 'grade2',
    emoji: '🍋',
    lines: [
      "Luna and Pip wanted to buy a new book for the class.",
      "They made lemonade and sold it by the road.",
      "At first, no one stopped, and Pip felt sad.",
      "Then a bus full of children came by, and they sold every cup!"
    ],
    truth: [
      { claim: "The friends sold drinks to get money.", isTrue: true },
      { claim: "The friends tried to get a new bike.", isTrue: false },
      { claim: "Nobody ever bought a cup.", isTrue: false }
    ],
    blanks: [
      {
        text: "They made money to get a book.",
        key: 'book',
        decoys: ['bike', 'kite', 'hat'],
        alsoFits: ['gift', 'present', 'story']
      }
    ]
  },
  {
    id: 'g2-old-map',
    grade: 'grade2',
    emoji: '🗺️',
    lines: [
      "Pip found an old map in a library book.",
      "It showed a path from the garden to the big hill.",
      "Luna and Pip followed it and climbed to the top.",
      "There they found a bench and the best view of the moon."
    ],
    truth: [
      { claim: "The map led to a place on a hill.", isTrue: true },
      { claim: "Pip found the map in his shoe.", isTrue: false },
      { claim: "They walked down into a cave.", isTrue: false }
    ],
    blanks: [
      {
        text: "From up on the hill, the moon looked great.",
        key: 'hill',
        decoys: ['pond', 'bus', 'bed'],
        alsoFits: ['top', 'bench', 'mountain', 'rise', 'path']
      }
    ]
  },
  {
    id: 'g2-wet-paint',
    grade: 'grade2',
    emoji: '🖌️',
    lines: [
      "Luna painted the library door a bright blue.",
      "Pip did not see the sign about the wet paint.",
      "He leaned on the door and got blue on his back.",
      "Luna laughed, and Pip laughed too."
    ],
    truth: [
      { claim: "Pip got paint on himself.", isTrue: true },
      { claim: "The door was painted red.", isTrue: false },
      { claim: "Luna was angry at Pip.", isTrue: false }
    ],
    blanks: [
      {
        text: "The paint on Pip was blue.",
        key: 'blue',
        decoys: ['red', 'green', 'yellow'],
        alsoFits: ['wet', 'sticky', 'bright', 'fresh', 'new']
      }
    ]
  },
  {
    id: 'g2-loose-tooth',
    grade: 'grade2',
    emoji: '🍎',
    lines: [
      "Pip had a wiggly tooth for many days.",
      "At lunch, he bit into a crunchy apple.",
      "The tooth came out and stayed in the apple!",
      "Pip smiled a big smile with a brand new gap."
    ],
    truth: [
      { claim: "Pip lost a tooth at lunch.", isTrue: true },
      { claim: "Pip bit into a soft banana.", isTrue: false },
      { claim: "Pip cried all day.", isTrue: false }
    ],
    blanks: [
      {
        text: "The apple pulled out the loose tooth.",
        key: 'loose',
        decoys: ['new', 'big', 'blue'],
        alsoFits: ['wiggly', 'baby', 'little', 'small', 'old', 'wobbly']
      }
    ]
  },
  {
    id: 'g2-class-hamster',
    grade: 'grade2',
    emoji: '🐹',
    lines: [
      "Luna's class has a pet hamster.",
      "Each week, one child takes care of it.",
      "This week was Pip's turn, so he gave it food and clean water.",
      "The hamster ran on its wheel to say thank you."
    ],
    truth: [
      { claim: "Pip looked after the hamster this week.", isTrue: true },
      { claim: "The class pet is a fish.", isTrue: false },
      { claim: "The same child feeds it every week.", isTrue: false }
    ],
    blanks: [
      {
        text: "Pip gave the hamster water to drink.",
        key: 'water',
        decoys: ['milk', 'juice', 'soup'],
        alsoFits: ['something', 'clean', 'fresh', 'cool']
      }
    ]
  },
  {
    id: 'g2-windy-mess',
    grade: 'grade2',
    emoji: '🍂',
    lines: [
      "The wind blew hard all night.",
      "In the morning, the garden was a mess.",
      "Pots lay on their sides, and leaves covered the path.",
      "Luna and Pip swept and stacked until it looked nice again."
    ],
    truth: [
      { claim: "They cleaned up after the wind.", isTrue: true },
      { claim: "The garden looked perfect in the morning.", isTrue: false },
      { claim: "Pip cleaned it all alone.", isTrue: false }
    ],
    blanks: [
      {
        text: "The wind made a big mess in the garden.",
        key: 'mess',
        decoys: ['cake', 'song', 'gift'],
        alsoFits: ['problem', 'noise', 'job', 'wreck', 'pile']
      }
    ]
  },
  {
    id: 'g2-night-sounds',
    grade: 'grade2',
    emoji: '🔦',
    lines: [
      "Pip could not sleep at his first sleepover at the library.",
      "He heard a strange tap, tap, tap on the window.",
      "Luna opened the curtain and shined her light.",
      "It was only a branch moving in the wind."
    ],
    truth: [
      { claim: "A branch made the sound.", isTrue: true },
      { claim: "A monster was at the window.", isTrue: false },
      { claim: "Pip slept at the zoo.", isTrue: false }
    ],
    blanks: [
      {
        text: "The wind moved the branch.",
        key: 'branch',
        decoys: ['bus', 'cake', 'bed'],
        alsoFits: ['tree', 'leaves', 'curtain', 'window', 'twig', 'limb']
      }
    ]
  },
  {
    id: 'g2-salty-muffins',
    grade: 'grade2',
    emoji: '🧁',
    lines: [
      "Luna wanted to bake muffins for her friends.",
      "She reached for the sugar but grabbed the salt.",
      "The first bite made everyone make a funny face.",
      "So Luna tried again, and the next muffins were sweet."
    ],
    truth: [
      { claim: "Luna made a mistake the first time.", isTrue: true },
      { claim: "The first muffins tasted sweet.", isTrue: false },
      { claim: "Luna gave up after one try.", isTrue: false }
    ],
    blanks: [
      {
        text: "The first muffins were salty.",
        key: 'salty',
        decoys: ['sweet', 'cold', 'soft'],
        alsoFits: ['bad', 'yucky', 'funny', 'icky', 'awful', 'gross']
      }
    ]
  },
  {
    id: 'g2-bird-feeder',
    grade: 'grade2',
    emoji: '❄️',
    lines: [
      "In winter, the birds in the garden had little to eat.",
      "Luna and Pip filled a small box with seeds.",
      "They hung it from the oak tree.",
      "Soon the branches were full of happy, hungry birds."
    ],
    truth: [
      { claim: "The friends helped birds find food.", isTrue: true },
      { claim: "This happened in summer.", isTrue: false },
      { claim: "They hung the box from the library door.", isTrue: false }
    ],
    blanks: [
      {
        text: "Seeds in the box fed the birds.",
        key: 'box',
        decoys: ['sink', 'shoe', 'bus'],
        alsoFits: ['feeder', 'tree', 'garden']
      }
    ]
  },
  {
    id: 'g2-class-play',
    grade: 'grade2',
    emoji: '🎭',
    lines: [
      "Luna's class put on a play about the moon.",
      "Pip had one line, but he was very nervous.",
      "When it was his turn, he took a deep breath.",
      "He said it loud and clear, and everyone cheered."
    ],
    truth: [
      { claim: "Pip did well even though he felt scared.", isTrue: true },
      { claim: "Pip forgot his line.", isTrue: false },
      { claim: "The play was about a fish.", isTrue: false }
    ],
    blanks: [
      {
        text: "Pip felt nervous before his turn.",
        key: 'nervous',
        decoys: ['sleepy', 'hungry', 'bored'],
        alsoFits: ['scared', 'afraid', 'worried', 'shaky']
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

/**
 * Story Corner's stories (GAME-2, GAME-9): nine per tier at least, the child reads
 * them first. A right answer says what the story means in other words, or
 * takes one small step of thinking: it never repeats three words in a row
 * from a line, so it can't be found by matching (`story-check.mjs`, run by
 * voice:audit). Each picture matches its story. A baseline: more stories are
 * added here, and the checks cover them.
 */
export const MINI_STORIES: MiniStory[] = [
  // ---- tier 1 ----
  {
    id: 'story-lost-sock',
    title: 'The Lost Sock',
    emoji: '🧦',
    tier: 1,
    // "one sock", not "one red sock": the picture is a pair, not red (GAME-2)
    lines: ['Luna lost one sock.', 'It was under the bed!', 'Now her feet are warm.'],
    question: 'Why are Luna’s feet warm now?',
    answers: [
      { text: 'She found her sock', correct: true },
      { text: 'She lost her hat', correct: false },
      { text: 'She got wet in the rain', correct: false }
    ]
  },
  {
    id: 'story-blue-cap',
    title: 'Pip’s Blue Cap',
    emoji: '🧢',
    tier: 1,
    lines: ['Pip has a blue cap.', 'The wind took it up, up, up!', 'Luna flew and got it back.'],
    question: 'How did Pip get his cap back?',
    answers: [
      { text: 'Luna brought it to him', correct: true },
      { text: 'The wind gave it back', correct: false },
      { text: 'He got a new cap', correct: false }
    ]
  },
  {
    id: 'story-frog-log',
    title: 'The Frog on the Log',
    emoji: '🐸',
    tier: 1,
    lines: ['Luna saw a frog on a log.', 'The frog saw a bug.', 'Hop! The frog got the bug.'],
    question: 'What did the frog do?',
    answers: [
      { text: 'It caught a bug', correct: true },
      { text: 'It fell in the pond', correct: false },
      { text: 'It went to sleep', correct: false }
    ]
  },
  {
    id: 'story-new-bike',
    title: 'Pip’s New Bike',
    emoji: '🚲',
    tier: 1,
    lines: [
      'Pip got a new bike.',
      'He fell off two times.',
      'He tried again, and now he can ride.'
    ],
    question: 'What did Pip do after he fell?',
    answers: [
      { text: 'He got back on', correct: true },
      { text: 'He sold his bike', correct: false },
      { text: 'He went to bed', correct: false }
    ]
  },
  {
    id: 'story-little-seed',
    title: 'The Little Seed',
    emoji: '🌱',
    tier: 1,
    lines: [
      'Luna put a seed in a pot.',
      'She gave it water.',
      'Soon it grew a green leaf.'
    ],
    question: 'What helped the seed grow?',
    answers: [
      { text: 'Luna took care of it', correct: true },
      { text: 'Pip sat on the pot', correct: false },
      { text: 'The cat ate it', correct: false }
    ]
  },
  {
    id: 'story-wet-dog',
    title: 'The Wet Dog',
    emoji: '🐶',
    tier: 1,
    lines: [
      'A dog ran in the rain.',
      'It came in all wet.',
      'Shake, shake! Now Luna is wet too.'
    ],
    question: 'Why is Luna wet?',
    answers: [
      { text: 'The dog shook water on her', correct: true },
      { text: 'She took a bath', correct: false },
      { text: 'She fell in a pond', correct: false }
    ]
  },
  {
    id: 'story-many-hats',
    title: 'Too Many Hats',
    emoji: '🎩',
    tier: 1,
    lines: [
      'Pip put on a hat.',
      'Then he put on one more.',
      'Now he can not see!'
    ],
    question: 'Why can Pip not see?',
    answers: [
      { text: 'The hats are over his eyes', correct: true },
      { text: 'It is very dark', correct: false },
      { text: 'He lost his glasses', correct: false }
    ]
  },
  {
    id: 'story-hungry-cat',
    title: 'The Hungry Cat',
    emoji: '🐱',
    tier: 1,
    lines: [
      'The cat sat by her bowl.',
      'The bowl had no food.',
      'Luna filled it up, and the cat ate.'
    ],
    question: 'Why did the cat sit by the bowl?',
    answers: [
      { text: 'She wanted to eat', correct: true },
      { text: 'She wanted a nap', correct: false },
      { text: 'She saw a bird', correct: false }
    ]
  },
  {
    id: 'story-hide-seek',
    title: 'Hide and Seek',
    emoji: '🙈',
    tier: 1,
    lines: [
      'Pip hid behind a tree.',
      'Luna looked and looked.',
      'His blue cap stuck out, and she found him!'
    ],
    question: 'How did Luna find Pip?',
    answers: [
      { text: 'She saw his cap', correct: true },
      { text: 'He called her name', correct: false },
      { text: 'She heard him sing', correct: false }
    ]
  },
  // ---- tier 2 ----
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
    question: 'What did Luna do with her snack?',
    answers: [
      { text: 'She gave some to a star', correct: true },
      { text: 'She dropped it on the moon', correct: false },
      { text: 'She ate it at home', correct: false }
    ]
  },
  {
    id: 'story-pip-garden',
    title: 'Pip’s Garden',
    emoji: '🥕',
    tier: 2,
    lines: [
      'Pip planted three seeds in the garden.',
      'Every day, Luna helped him water them.',
      'Soon, three little carrots popped up!'
    ],
    question: 'What did Luna do each day?',
    answers: [
      { text: 'She gave the seeds water', correct: true },
      { text: 'She picked the carrots', correct: false },
      { text: 'She sang to the moon', correct: false }
    ]
  },
  {
    id: 'story-paper-kite',
    title: 'The Paper Kite',
    emoji: '🪁',
    tier: 2,
    lines: [
      'Pip made a kite out of paper.',
      'The wind lifted it high above the tree.',
      'Luna flew up and waved to the kite.'
    ],
    question: 'Where did the kite go?',
    answers: [
      { text: 'Up in the sky', correct: true },
      { text: 'Into the pond', correct: false },
      { text: 'Under the bed', correct: false }
    ]
  },
  {
    id: 'story-pip-note',
    title: 'A Note for Pip',
    emoji: '✉️',
    tier: 2,
    lines: [
      'Luna wrote a note and hid it in Pip’s book.',
      'When Pip opened the book, the note fell out.',
      'It said, you are my best friend.'
    ],
    question: 'How did the note make Pip feel?',
    answers: [
      { text: 'It made him happy', correct: true },
      { text: 'It made him angry', correct: false },
      { text: 'It made him sleepy', correct: false }
    ]
  },
  {
    id: 'story-stuck-balloon',
    title: 'The Stuck Balloon',
    emoji: '🎈',
    tier: 2,
    lines: [
      'Pip’s balloon flew up into a tall tree.',
      'Pip could not reach it and began to cry.',
      'Luna flew up and brought it down.'
    ],
    question: 'Why could Luna get the balloon?',
    answers: [
      { text: 'She has wings', correct: true },
      { text: 'She is very tall', correct: false },
      { text: 'The tree fell down', correct: false }
    ]
  },
  {
    id: 'story-hot-soup',
    title: 'Soup for Two',
    emoji: '🍲',
    tier: 2,
    lines: [
      'Luna made soup, but it was too hot.',
      'She blew on it and waited.',
      'Then she and Pip ate it all up.'
    ],
    question: 'Why did Luna wait?',
    answers: [
      { text: 'The soup needed to cool', correct: true },
      { text: 'She was not hungry', correct: false },
      { text: 'Pip was late', correct: false }
    ]
  },
  {
    id: 'story-muddy-path',
    title: 'The Muddy Path',
    emoji: '🥾',
    tier: 2,
    lines: [
      'It rained all night, so the path was muddy.',
      'Pip slipped and got mud on his pants.',
      'Luna gave him a towel and a big hug.'
    ],
    question: 'Why did Pip slip?',
    answers: [
      { text: 'The ground was wet', correct: true },
      { text: 'He was running to school', correct: false },
      { text: 'He had new shoes', correct: false }
    ]
  },
  {
    id: 'story-quiet-drum',
    title: 'The Quiet Drum',
    emoji: '🥁',
    tier: 2,
    lines: [
      'Pip played his drum all morning.',
      'Luna was trying to sleep after a long night.',
      'Pip saw her yawn, so he went outside to play.'
    ],
    question: 'Why did Pip go outside?',
    answers: [
      { text: 'So Luna could rest', correct: true },
      { text: 'His drum was broken', correct: false },
      { text: 'It started to snow', correct: false }
    ]
  },
  {
    id: 'story-six-shells',
    title: 'Shells at the Beach',
    emoji: '🐚',
    tier: 2,
    lines: [
      'Luna found six shells at the beach.',
      'A big wave came and took two away.',
      'She put the rest in her bag.'
    ],
    question: 'What took some of the shells?',
    answers: [
      { text: 'The water', correct: true },
      { text: 'A crab', correct: false },
      { text: 'Pip', correct: false }
    ]
  },
  // ---- tier 3 ----
  {
    id: 'story-rain-day',
    title: 'The Rainy Day Plan',
    emoji: '🌧️',
    tier: 3,
    lines: [
      'Rain tapped on the library window all morning.',
      // "reading", never past-tense "read": the voice can't tell the tense and
      // says "reed" (BUG-22)
      'Luna could not fly outside, so she spent the morning reading three books.',
      'When the sun came back, a bright rainbow stretched over the tree.'
    ],
    question: 'Why did Luna stay inside?',
    answers: [
      { text: 'Because it was raining', correct: true },
      { text: 'Because she was sick', correct: false },
      { text: 'Because Pip came to visit', correct: false }
    ]
  },
  {
    id: 'story-plain-cake',
    title: 'The Plain Cake',
    emoji: '🎂',
    tier: 3,
    lines: [
      'Pip wanted to bake a cake for Luna’s birthday.',
      'He forgot the sugar, so the cake tasted plain.',
      'Luna smiled and said it was the best cake ever, because Pip made it.'
    ],
    question: 'Why did Luna love the cake?',
    answers: [
      { text: 'Her friend baked it for her', correct: true },
      { text: 'It was very sweet', correct: false },
      { text: 'It had lots of fruit', correct: false }
    ]
  },
  {
    id: 'story-snowy-morning',
    title: 'The Snowy Morning',
    emoji: '⛄',
    tier: 3,
    lines: [
      'When Luna woke up, the whole garden was white.',
      'She and Pip rolled three big balls of snow and stacked them up.',
      'They gave their snowman a carrot nose and a warm scarf.'
    ],
    question: 'Why was the garden white?',
    answers: [
      { text: 'Snow fell during the night', correct: true },
      { text: 'Pip painted it', correct: false },
      { text: 'White flowers grew there', correct: false }
    ]
  },
  {
    id: 'story-broken-wing',
    title: 'The Hurt Wing',
    emoji: '🐦',
    tier: 3,
    lines: [
      'A small bird hurt its wing and could not fly south with the others.',
      'Luna and Pip made it a warm nest in the library and fed it every day.',
      'In spring, the bird flapped its wings and flew out the window.'
    ],
    question: 'Why did the bird stay at the library?',
    answers: [
      { text: 'It was too hurt to fly', correct: true },
      { text: 'It liked to look at books', correct: false },
      { text: 'It was lost in the snow', correct: false }
    ]
  },
  {
    id: 'story-surprise-party',
    title: 'The Surprise Party',
    emoji: '🎉',
    tier: 3,
    lines: [
      'Pip thought everyone forgot his birthday, and he felt lonely all morning.',
      'Luna asked him to come and help her at the library after lunch.',
      'When he opened the door, all of his friends shouted and threw confetti.'
    ],
    question: 'Why did Luna ask Pip to come to the library?',
    answers: [
      { text: 'She planned a party for him', correct: true },
      { text: 'She needed a new book', correct: false },
      { text: 'She wanted to clean it', correct: false }
    ]
  },
  {
    id: 'story-long-way',
    title: 'The Long Way Home',
    emoji: '🧭',
    tier: 3,
    lines: [
      'Luna and Pip took a new path home and soon did not know where they were.',
      'Luna flew up high and saw the library roof past the trees.',
      'She came back down and led Pip the right way.'
    ],
    question: 'How did Luna know the way?',
    answers: [
      { text: 'She looked from up in the sky', correct: true },
      { text: 'She asked a rabbit', correct: false },
      { text: 'She used a map', correct: false }
    ]
  },
  {
    id: 'story-shared-umbrella',
    title: 'The Shared Umbrella',
    emoji: '☂️',
    tier: 3,
    lines: [
      'The rain started just as school ended, and Pip had no umbrella.',
      'A new girl named Ana saw him and held hers over both of them.',
      'They talked the whole way home and became good friends.'
    ],
    question: 'How did Pip and Ana become friends?',
    answers: [
      { text: 'She shared with him in the rain', correct: true },
      { text: 'They sat together at lunch', correct: false },
      { text: 'They played on one team', correct: false }
    ]
  },
  {
    id: 'story-tall-tower',
    title: 'The Tall Tower',
    emoji: '🧱',
    tier: 3,
    lines: [
      'Pip built a tower of blocks that was taller than he was.',
      'He added one more block, and the whole tower fell with a crash.',
      'He laughed, picked up the blocks, and started again with a wider bottom.'
    ],
    question: 'What did Pip do differently the second time?',
    answers: [
      { text: 'He made the bottom bigger', correct: true },
      { text: 'He used fewer blocks', correct: false },
      { text: 'He asked for help', correct: false }
    ]
  },
  {
    id: 'story-lost-voice',
    title: 'Luna’s Lost Voice',
    emoji: '📝',
    tier: 3,
    lines: [
      'Luna woke up with a sore throat and could not say a word.',
      'She wrote notes to tell the children which stories to choose.',
      'By the end of the week, she could hoot and sing again.'
    ],
    question: 'Why did Luna write notes?',
    answers: [
      { text: 'She was not able to talk', correct: true },
      { text: 'She liked her new pen', correct: false },
      { text: 'The children could not hear well', correct: false }
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

/**
 * The content tier each grade and start-screen dial ("Warm up", "Just right",
 * "Tricky") gives, in one place (LVL-1, Alex's table, 2026-10-18). It replaced
 * rounding (grade + dial) / 2, which gave kindergarten's "Just right" 1st-grade
 * content. Every game reads it through tierFor, Luna's Pick included (it
 * rolls a dial, then reads the table like any game), and so does the voice
 * warm-up (warmup.ts, on "Just right").
 */
export const DIFFICULTY_TABLE: Record<GradeLevel, Record<Difficulty, Difficulty>> = {
  //            Warm up, Just right, Tricky
  kindergarten: { 1: 1, 2: 1, 3: 2 },
  grade1: { 1: 1, 2: 2, 3: 3 },
  grade2: { 1: 2, 2: 3, 3: 3 }
};

/** The tier a grade and the dial give: DIFFICULTY_TABLE. */
export function tierFor(grade: GradeLevel, difficulty: Difficulty): Difficulty {
  return DIFFICULTY_TABLE[grade]?.[difficulty] ?? 1;
}

/** Words at or below the given tier, so easier content never disappears. */
export function wordsUpTo(tier: Difficulty): WordItem[] {
  return GAME_WORDS.filter(w => w.tier <= tier);
}

export function wordsAtTier(tier: Difficulty): WordItem[] {
  const exact = GAME_WORDS.filter(w => w.tier === tier);
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

/** A passage's blank statement with its key word blanked out: "The cat is _____." */
export function maskKey(blank: Pick<BlankItem, 'text' | 'key'>): string {
  return blank.text.replace(new RegExp(`\\b${blank.key}\\b`, 'i'), GAP);
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
export function readWithGap(blank: Pick<BlankItem, 'text' | 'key'>): SpeechPart[] {
  const [before, after = ''] = maskKey(blank).split(GAP).map(piece => piece.trim());
  const pause: SpeechPart = { pause: GAP_PAUSE_MS };
  const parts: SpeechPart[] = [];
  // built text is safe here only because the inventory and voice:audit both
  // walk every blank through this helper
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
