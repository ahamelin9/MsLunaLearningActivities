// Phonics pronunciation dictionary.
//
// The core rule of this file: a letter is NOT its sound.
// "V" is spoken "vee" (the letter NAME) but makes the sound /v/ ("vvvv").
// Every entry therefore keeps the name and the sound completely separate,
// and nothing in the app may assume that speaking the character produces
// the phoneme.
//
// `ipa` is fed straight to the neural voice's tokenizer, which accepts IPA,
// so /v/ is rendered as a real, isolated /v/ rather than "vee".
// `carrier` is the fallback spelling used by the built-in browser voice,
// which can only be handed ordinary text.

export type PhonemeKind = 'continuant' | 'stop' | 'vowel' | 'digraph' | 'glide';

export interface PhonicsEntry {
  /** the written letter or letter team */
  letter: string;
  /** what the letter is called: "vee", "double-u" */
  letterName: string;
  /** how the name is spoken by a text engine */
  letterNameSpeech: string;
  /** display form of the sound: /v/ */
  phoneme: string;
  /** IPA handed to the neural voice — the real phoneme */
  ipa: string;
  /** text approximation for the fallback browser voice */
  carrier: string;
  /** a word that starts with the sound */
  exampleWord: string;
  kind: PhonemeKind;
  /** second sound, where a letter has a common one (c/g/vowels) */
  alternate?: {
    phoneme: string;
    ipa: string;
    carrier: string;
    exampleWord: string;
  };
}

/**
 * Continuants can be stretched ("mmmmm"), which is what phonics teaching wants,
 * so they carry the IPA length mark. Stops cannot be held; they take the
 * smallest possible schwa so they are audible without becoming "buh-UH".
 */
export const LETTER_PHONICS: Record<string, PhonicsEntry> = {
  A: {
    letter: 'A',
    letterName: 'ay',
    letterNameSpeech: 'ay',
    phoneme: '/a/',
    ipa: 'æ',
    carrier: 'ah',
    exampleWord: 'apple',
    kind: 'vowel',
    alternate: { phoneme: '/ay/', ipa: 'eɪ', carrier: 'ay', exampleWord: 'cake' }
  },
  B: {
    letter: 'B',
    letterName: 'bee',
    letterNameSpeech: 'bee',
    phoneme: '/b/',
    ipa: 'bə',
    carrier: 'buh',
    exampleWord: 'bug',
    kind: 'stop'
  },
  C: {
    letter: 'C',
    letterName: 'see',
    letterNameSpeech: 'see',
    phoneme: '/k/',
    ipa: 'kə',
    carrier: 'kuh',
    exampleWord: 'cat',
    kind: 'stop',
    alternate: { phoneme: '/s/', ipa: 'sː', carrier: 'ssss', exampleWord: 'city' }
  },
  D: {
    letter: 'D',
    letterName: 'dee',
    letterNameSpeech: 'dee',
    phoneme: '/d/',
    ipa: 'də',
    carrier: 'duh',
    exampleWord: 'duck',
    kind: 'stop'
  },
  E: {
    letter: 'E',
    letterName: 'ee',
    letterNameSpeech: 'ee',
    phoneme: '/e/',
    ipa: 'ɛ',
    carrier: 'eh',
    exampleWord: 'egg',
    kind: 'vowel',
    alternate: { phoneme: '/ee/', ipa: 'iː', carrier: 'ee', exampleWord: 'tree' }
  },
  F: {
    letter: 'F',
    letterName: 'eff',
    letterNameSpeech: 'eff',
    phoneme: '/f/',
    ipa: 'fː',
    carrier: 'ffff',
    exampleWord: 'fox',
    kind: 'continuant'
  },
  G: {
    letter: 'G',
    letterName: 'gee',
    letterNameSpeech: 'jee',
    phoneme: '/g/',
    ipa: 'ɡə',
    carrier: 'guh',
    exampleWord: 'gift',
    kind: 'stop',
    alternate: { phoneme: '/j/', ipa: 'dʒə', carrier: 'juh', exampleWord: 'giraffe' }
  },
  H: {
    letter: 'H',
    letterName: 'aitch',
    letterNameSpeech: 'aitch',
    phoneme: '/h/',
    ipa: 'hə',
    carrier: 'huh',
    exampleWord: 'hat',
    kind: 'stop'
  },
  I: {
    letter: 'I',
    letterName: 'eye',
    letterNameSpeech: 'eye',
    phoneme: '/i/',
    ipa: 'ɪ',
    carrier: 'ih',
    exampleWord: 'igloo',
    kind: 'vowel',
    alternate: { phoneme: '/eye/', ipa: 'aɪ', carrier: 'eye', exampleWord: 'kite' }
  },
  J: {
    letter: 'J',
    letterName: 'jay',
    letterNameSpeech: 'jay',
    phoneme: '/j/',
    ipa: 'dʒə',
    carrier: 'juh',
    exampleWord: 'jam',
    kind: 'stop'
  },
  K: {
    letter: 'K',
    letterName: 'kay',
    letterNameSpeech: 'kay',
    phoneme: '/k/',
    ipa: 'kə',
    carrier: 'kuh',
    exampleWord: 'key',
    kind: 'stop'
  },
  L: {
    letter: 'L',
    letterName: 'el',
    letterNameSpeech: 'ell',
    phoneme: '/l/',
    ipa: 'lː',
    carrier: 'llll',
    exampleWord: 'leaf',
    kind: 'continuant'
  },
  M: {
    letter: 'M',
    letterName: 'em',
    letterNameSpeech: 'em',
    phoneme: '/m/',
    ipa: 'mː',
    carrier: 'mmmm',
    exampleWord: 'moon',
    kind: 'continuant'
  },
  N: {
    letter: 'N',
    letterName: 'en',
    letterNameSpeech: 'en',
    phoneme: '/n/',
    ipa: 'nː',
    carrier: 'nnnn',
    exampleWord: 'nest',
    kind: 'continuant'
  },
  O: {
    letter: 'O',
    letterName: 'oh',
    letterNameSpeech: 'oh',
    phoneme: '/o/',
    ipa: 'ɑ',
    carrier: 'aw',
    exampleWord: 'ox',
    kind: 'vowel',
    alternate: { phoneme: '/oh/', ipa: 'oʊ', carrier: 'oh', exampleWord: 'bone' }
  },
  P: {
    letter: 'P',
    letterName: 'pee',
    letterNameSpeech: 'pee',
    phoneme: '/p/',
    ipa: 'pə',
    carrier: 'puh',
    exampleWord: 'pig',
    kind: 'stop'
  },
  Q: {
    letter: 'Q',
    letterName: 'cue',
    letterNameSpeech: 'cue',
    phoneme: '/kw/',
    ipa: 'kw',
    carrier: 'kwuh',
    exampleWord: 'queen',
    kind: 'stop'
  },
  R: {
    letter: 'R',
    letterName: 'ar',
    letterNameSpeech: 'are',
    phoneme: '/r/',
    ipa: 'ɹː',
    carrier: 'rrrr',
    exampleWord: 'ring',
    kind: 'continuant'
  },
  S: {
    letter: 'S',
    letterName: 'ess',
    letterNameSpeech: 'ess',
    phoneme: '/s/',
    ipa: 'sː',
    carrier: 'ssss',
    exampleWord: 'sun',
    kind: 'continuant'
  },
  T: {
    letter: 'T',
    letterName: 'tee',
    letterNameSpeech: 'tee',
    phoneme: '/t/',
    ipa: 'tə',
    carrier: 'tuh',
    exampleWord: 'tent',
    kind: 'stop'
  },
  U: {
    letter: 'U',
    letterName: 'you',
    letterNameSpeech: 'you',
    phoneme: '/u/',
    ipa: 'ʌ',
    carrier: 'uh',
    exampleWord: 'umbrella',
    kind: 'vowel',
    alternate: { phoneme: '/yoo/', ipa: 'juː', carrier: 'you', exampleWord: 'unicorn' }
  },
  V: {
    letter: 'V',
    letterName: 'vee',
    letterNameSpeech: 'vee',
    phoneme: '/v/',
    ipa: 'vː',
    carrier: 'vvvv',
    exampleWord: 'van',
    kind: 'continuant'
  },
  W: {
    letter: 'W',
    letterName: 'double-u',
    letterNameSpeech: 'double you',
    phoneme: '/w/',
    ipa: 'wə',
    carrier: 'wuh',
    exampleWord: 'web',
    kind: 'glide'
  },
  X: {
    letter: 'X',
    letterName: 'ex',
    letterNameSpeech: 'ex',
    phoneme: '/ks/',
    ipa: 'ks',
    carrier: 'kss',
    exampleWord: 'fox',
    kind: 'stop'
  },
  Y: {
    letter: 'Y',
    letterName: 'why',
    letterNameSpeech: 'why',
    phoneme: '/y/',
    ipa: 'jə',
    carrier: 'yuh',
    exampleWord: 'yarn',
    kind: 'glide'
  },
  Z: {
    letter: 'Z',
    letterName: 'zee',
    letterNameSpeech: 'zee',
    phoneme: '/z/',
    ipa: 'zː',
    carrier: 'zzzz',
    exampleWord: 'zebra',
    kind: 'continuant'
  }
};

/** Letter teams that make one sound. */
export const TEAM_PHONICS: Record<string, PhonicsEntry> = {
  SH: {
    letter: 'SH',
    letterName: 'ess aitch',
    letterNameSpeech: 'ess aitch',
    phoneme: '/sh/',
    ipa: 'ʃː',
    carrier: 'shhh',
    exampleWord: 'ship',
    kind: 'digraph'
  },
  CH: {
    letter: 'CH',
    letterName: 'see aitch',
    letterNameSpeech: 'see aitch',
    phoneme: '/ch/',
    ipa: 'tʃ',
    carrier: 'chuh',
    exampleWord: 'chick',
    kind: 'digraph'
  },
  TH: {
    letter: 'TH',
    letterName: 'tee aitch',
    letterNameSpeech: 'tee aitch',
    phoneme: '/th/',
    ipa: 'θː',
    carrier: 'thhh',
    exampleWord: 'thumb',
    kind: 'digraph',
    alternate: { phoneme: '/th/ voiced', ipa: 'ðː', carrier: 'thhh', exampleWord: 'this' }
  },
  WH: {
    letter: 'WH',
    letterName: 'double-u aitch',
    letterNameSpeech: 'double you aitch',
    phoneme: '/wh/',
    ipa: 'wə',
    carrier: 'wuh',
    exampleWord: 'whale',
    kind: 'digraph'
  },
  NG: {
    letter: 'NG',
    letterName: 'en gee',
    letterNameSpeech: 'en jee',
    phoneme: '/ng/',
    ipa: 'ŋː',
    carrier: 'nnng',
    exampleWord: 'ring',
    kind: 'digraph'
  },
  CK: {
    letter: 'CK',
    letterName: 'see kay',
    letterNameSpeech: 'see kay',
    phoneme: '/k/',
    ipa: 'kə',
    carrier: 'kuh',
    exampleWord: 'duck',
    kind: 'digraph'
  },
  QU: {
    letter: 'QU',
    letterName: 'cue you',
    letterNameSpeech: 'cue you',
    phoneme: '/kw/',
    ipa: 'kw',
    carrier: 'kwuh',
    exampleWord: 'queen',
    kind: 'digraph'
  }
};

/** Blends are two sounds said quickly, not a new sound. */
export const BLEND_IPA: Record<string, string> = {
  BL: 'blə', BR: 'bɹə', CL: 'klə', CR: 'kɹə', DR: 'dɹə', FL: 'flə', FR: 'fɹə',
  GL: 'ɡlə', GR: 'ɡɹə', PL: 'plə', PR: 'pɹə', SC: 'skə', SK: 'skə', SL: 'slə',
  SM: 'smə', SN: 'snə', SP: 'spə', ST: 'stə', SW: 'swə', TR: 'tɹə', TW: 'twə'
};

/** Vowel teams, so longer words can still be sounded out. */
export const VOWEL_TEAM_IPA: Record<string, string> = {
  AI: 'eɪ', AY: 'eɪ', EA: 'iː', EE: 'iː', IE: 'aɪ', IGH: 'aɪ',
  OA: 'oʊ', OW: 'oʊ', OO: 'uː', UE: 'uː', AR: 'ɑːɹ', OR: 'ɔːɹ', ER: 'ɜː', IR: 'ɜː', UR: 'ɜː'
};

export function phonicsFor(key: string): PhonicsEntry | undefined {
  const upper = key.trim().toUpperCase();
  return TEAM_PHONICS[upper] ?? LETTER_PHONICS[upper];
}

/** IPA for any letter, team, blend or vowel team — used when sounding out. */
export function ipaFor(chunk: string): string | undefined {
  const upper = chunk.trim().toUpperCase();
  const entry = phonicsFor(upper);
  if (entry) return entry.ipa;
  return BLEND_IPA[upper] ?? VOWEL_TEAM_IPA[upper];
}

/** Fallback text for the same chunk when the neural voice is unavailable. */
export function carrierFor(chunk: string): string {
  const upper = chunk.trim().toUpperCase();
  const entry = phonicsFor(upper);
  if (entry) return entry.carrier;
  if (BLEND_IPA[upper]) return `${upper.toLowerCase()}uh`;
  if (VOWEL_TEAM_IPA[upper]) return upper.toLowerCase();
  return chunk;
}

export function letterNameOf(letter: string): string {
  return phonicsFor(letter)?.letterNameSpeech ?? letter;
}

/** The sounds worth pre-generating, since they come up in nearly every game. */
export const COMMON_PHONICS_KEYS = [
  'M', 'S', 'A', 'T', 'B', 'C', 'P', 'F', 'N', 'D', 'L', 'R', 'V', 'SH', 'CH', 'TH'
];
