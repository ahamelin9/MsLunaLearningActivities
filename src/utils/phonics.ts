// Phonics pronunciation dictionary.
//
// The core rule of this file: a letter is NOT its sound.
// "V" is spoken "vee" (the letter NAME) but makes the sound /v/ ("vvvv").
// Every entry therefore keeps the name and the sound completely separate,
// and nothing in the app may assume that speaking the character produces
// the phoneme.
//
// `ipa` is the sound in IPA, for reference. How Luna actually says each sound
// is decided in scripts/voice/phonemes.mjs, which cuts it out of a real word —
// a voice model cannot say a phoneme on its own.
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
  /** the sound in IPA, for reference */
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
 * Continuants are held ("mmmmm"), which is what phonics teaching wants; stops
 * are a crisp release with no vowel after it. A stop said as "buh" teaches
 * children to read "bat" as "buh-a-tuh", so nothing here — not even a fallback
 * spelling the app can avoid — should add one.
 */
export const LETTER_PHONICS: Record<string, PhonicsEntry> = {
  A: {
    letter: 'A',
    letterName: 'ay',
    // "ay" is read as "eye"; "eigh" is /eɪ/, as in scripts/voice/lexicon.mjs
    letterNameSpeech: 'eigh',
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
    ipa: 'b',
    carrier: 'buh',
    exampleWord: 'bug',
    kind: 'stop'
  },
  C: {
    letter: 'C',
    letterName: 'see',
    letterNameSpeech: 'see',
    phoneme: '/k/',
    ipa: 'k',
    carrier: 'kuh',
    exampleWord: 'cat',
    kind: 'stop',
    alternate: { phoneme: '/s/', ipa: 's', carrier: 'ssss', exampleWord: 'city' }
  },
  D: {
    letter: 'D',
    letterName: 'dee',
    letterNameSpeech: 'dee',
    phoneme: '/d/',
    ipa: 'd',
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
    // "eff" is spelled out as "ee-eff-eff"; "ef" is /ɛf/
    letterNameSpeech: 'ef',
    phoneme: '/f/',
    ipa: 'f',
    carrier: 'ffff',
    exampleWord: 'fox',
    kind: 'continuant'
  },
  G: {
    letter: 'G',
    letterName: 'gee',
    letterNameSpeech: 'jee',
    phoneme: '/g/',
    ipa: 'ɡ',
    carrier: 'guh',
    exampleWord: 'gift',
    kind: 'stop',
    alternate: { phoneme: '/j/', ipa: 'dʒ', carrier: 'juh', exampleWord: 'giraffe' }
  },
  H: {
    letter: 'H',
    letterName: 'aitch',
    letterNameSpeech: 'aitch',
    phoneme: '/h/',
    ipa: 'h',
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
    ipa: 'dʒ',
    carrier: 'juh',
    exampleWord: 'jam',
    kind: 'stop'
  },
  K: {
    letter: 'K',
    letterName: 'kay',
    letterNameSpeech: 'kay',
    phoneme: '/k/',
    ipa: 'k',
    carrier: 'kuh',
    exampleWord: 'key',
    kind: 'stop'
  },
  L: {
    letter: 'L',
    letterName: 'el',
    letterNameSpeech: 'ell',
    phoneme: '/l/',
    ipa: 'l',
    carrier: 'llll',
    exampleWord: 'leaf',
    kind: 'continuant'
  },
  M: {
    letter: 'M',
    letterName: 'em',
    letterNameSpeech: 'em',
    phoneme: '/m/',
    ipa: 'm',
    carrier: 'mmmm',
    exampleWord: 'moon',
    kind: 'continuant'
  },
  N: {
    letter: 'N',
    letterName: 'en',
    letterNameSpeech: 'en',
    phoneme: '/n/',
    ipa: 'n',
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
    ipa: 'p',
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
    ipa: 'ɹ',
    carrier: 'rrrr',
    exampleWord: 'ring',
    kind: 'continuant'
  },
  S: {
    letter: 'S',
    letterName: 'ess',
    letterNameSpeech: 'ess',
    phoneme: '/s/',
    ipa: 's',
    carrier: 'ssss',
    exampleWord: 'sun',
    kind: 'continuant'
  },
  T: {
    letter: 'T',
    letterName: 'tee',
    letterNameSpeech: 'tee',
    phoneme: '/t/',
    ipa: 't',
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
    ipa: 'v',
    carrier: 'vvvv',
    exampleWord: 'van',
    kind: 'continuant'
  },
  W: {
    letter: 'W',
    letterName: 'double-u',
    letterNameSpeech: 'double you',
    phoneme: '/w/',
    ipa: 'w',
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
    ipa: 'j',
    carrier: 'yuh',
    exampleWord: 'yarn',
    kind: 'glide'
  },
  Z: {
    letter: 'Z',
    letterName: 'zee',
    letterNameSpeech: 'zee',
    phoneme: '/z/',
    ipa: 'z',
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
    ipa: 'ʃ',
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
    ipa: 'θ',
    carrier: 'thhh',
    exampleWord: 'thumb',
    kind: 'digraph',
    alternate: { phoneme: '/th/ voiced', ipa: 'ð', carrier: 'thhh', exampleWord: 'this' }
  },
  WH: {
    letter: 'WH',
    letterName: 'double-u aitch',
    letterNameSpeech: 'double you aitch',
    phoneme: '/wh/',
    ipa: 'w',
    carrier: 'wuh',
    exampleWord: 'whale',
    kind: 'digraph'
  },
  NG: {
    letter: 'NG',
    letterName: 'en gee',
    letterNameSpeech: 'en jee',
    phoneme: '/ng/',
    ipa: 'ŋ',
    carrier: 'nnng',
    exampleWord: 'ring',
    kind: 'digraph'
  },
  CK: {
    letter: 'CK',
    letterName: 'see kay',
    letterNameSpeech: 'see kay',
    phoneme: '/k/',
    ipa: 'k',
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
  BL: 'bl', BR: 'bɹ', CL: 'kl', CR: 'kɹ', DR: 'dɹ', FL: 'fl', FR: 'fɹ',
  GL: 'ɡl', GR: 'ɡɹ', PL: 'pl', PR: 'pɹ', SC: 'sk', SK: 'sk', SL: 'sl',
  SM: 'sm', SN: 'sn', SP: 'sp', ST: 'st', SW: 'sw', TR: 'tɹ', TW: 'tw'
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

/** A letter's second sound is addressed as "A+alt": the base entry and the alternate. */
function alternateOf(chunk: string) {
  const [base, marker] = chunk.trim().toUpperCase().split('+');
  return marker === 'ALT' ? phonicsFor(base)?.alternate : undefined;
}

/** IPA for any letter, team, blend or vowel team — and whether it is a sound this app teaches at all. */
export function ipaFor(chunk: string): string | undefined {
  const alt = alternateOf(chunk);
  if (alt) return alt.ipa;
  const upper = chunk.trim().toUpperCase();
  const entry = phonicsFor(upper);
  if (entry) return entry.ipa;
  return BLEND_IPA[upper] ?? VOWEL_TEAM_IPA[upper];
}

/** Fallback text for the same chunk when the neural voice is unavailable. */
export function carrierFor(chunk: string): string {
  const alt = alternateOf(chunk);
  if (alt) return alt.carrier;
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
