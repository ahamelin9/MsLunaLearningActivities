// The sounds Alex records on the recording page: every phonics sound the app
// plays, in a few groups (VOX-8), and the letters' names (VOX-9). "Record
// again" holds the sounds still not right after round 6 (ER, CR, DR: a crisper
// first sound and a longer R give the raised conversion more R to keep). The pilot's eight (VOX-7) are already in the
// app. How each is said comes from docs/voice/sound-standard.md,
// in words for a grown-up saying it, and the word is said once after the takes,
// so each take can be heard against it (and a sound can be cut from it, as /oo/
// was from "moon").
//
// One card per sound, not per key: keys that share a sound (C, K and CK; the
// three spellings of long A) are recorded once, under `file`, and each pick is
// copied to every key that shares it (scripts/voice/phonemes.mjs, KEY_TO_SOUND).

export type GroupId = 'again' | 'names' | 'short' | 'long' | 'quick' | 'held' | 'lr' | 's' | 'pilot';

export const GROUPS: { id: GroupId; label: string }[] = [
  { id: 'again', label: 'Record again (round 6)' },
  { id: 'names', label: 'Letter names' },
  { id: 'short', label: 'Short vowels' },
  { id: 'long', label: 'Long and R vowels' },
  { id: 'quick', label: 'Quick sounds' },
  { id: 'held', label: 'Held sounds' },
  { id: 'lr', label: 'L and R blends' },
  { id: 's', label: 'S and W blends' },
  { id: 'pilot', label: 'The first 8 (in the app)' }
];

export interface RecordSound {
  /** a phonics sound (`sound__B.wav`) or a letter's name (`name__B.wav`) */
  kind: 'sound' | 'name';
  /** the app's key, as `scripts/voice/recorded/` names it (TH+alt → TH_alt) */
  file: string;
  /** what the card shows */
  label: string;
  word: string;
  how: string;
  /** held about a second, or quick */
  held: boolean;
  group: GroupId;
}

const s = (group: GroupId, held: boolean, file: string, label: string, word: string, how: string): RecordSound => ({
  kind: 'sound',
  file,
  label,
  word,
  how,
  held,
  group
});

const SOUND_CARDS: RecordSound[] = [
  s('short', true, 'A', 'a (apple)', 'cat', 'The "a" of "cat", held a little, mouth open wide. Not "ay".'),
  s('short', true, 'E', 'e (egg)', 'bed', 'The "e" of "egg" and "bed", held a little. Drop your jaw: more open than "i", like a puzzled "eh?". Not "ay".'),
  s('short', true, 'I', 'i (igloo)', 'it', 'The "i" of "it" and "igloo", held a little. Mouth only a little open, nearly a smile, and short and crisp. Not "ee", and further from "eh" than it feels.'),
  s('short', true, 'O', 'o (octopus)', 'hot', 'The "o" of "hot", held a little, mouth open. Not "oh".'),
  s('short', true, 'U', 'u (umbrella)', 'cup', 'The "u" of "cup", held a little: a relaxed "uh".'),

  s('long', true, 'A_alt', 'long a (cake)', 'cake', 'Its name, "ay", said slowly, gliding from "eh" to "ee". Nothing in front of it. Also AI and AY.'),
  s('long', true, 'E_alt', 'long e (tree)', 'tree', 'Its name, "ee", said slowly, lips spread. No "h" in front. Also EA and EE.'),
  s('long', true, 'I_alt', 'long i (kite)', 'kite', 'Its name, "eye", said slowly, gliding from "ah" to "ee". No "h" in front. Also IE and IGH.'),
  s('long', true, 'O_alt', 'long o (bone)', 'bone', 'Its name, "oh", said slowly, the lips rounding as it goes. Also OA and OW.'),
  s('long', true, 'U_alt', 'long u (unicorn)', 'unicorn', '"You", said slowly and gently, not forced.'),
  s('long', true, 'AR', 'ar (star)', 'star', 'One sound, "ar", said slowly, ending in a real R. Not cut off.'),
  s('long', true, 'OR', 'or (fork)', 'fork', 'One sound, "or", as in "door", said slowly. No breath in front.'),
  s('again', true, 'ER', 'er (her)', 'her', 'One sound, "er" as in "her", with a strong R the whole way: tongue pulled back and bunched, lips a little rounded, held a full second or more. Also IR and UR.'),

  s('quick', false, 'P', 'p', 'pig', 'Lips together, then a soft puff of air with no voice. Not "puh", and not forceful.'),
  s('quick', false, 'T', 't', 'top', 'Tongue behind the top teeth, then a short hiss, like air out of a tire. Not "tuh".'),
  s('quick', false, 'K', 'k (and c, ck)', 'kite', 'Back of the tongue up, then a quiet puff, like radio static. Not "kuh".'),
  s('quick', false, 'CH', 'ch', 'chip', 'A quick "ch", the start of "chip". Not "tsh", and no "uh".'),
  s('quick', false, 'J', 'j (and soft g)', 'jump', 'The start of "jump": the J held a moment, then stop before the vowel. Not "juh".'),
  s('quick', false, 'X', 'x', 'fox', 'The end of "fox": a quick k, then s, "ks". Nothing in front.'),
  s('quick', false, 'QU', 'qu', 'queen', '"kw", like the start of "queen", the lips rounding, with at most the tiniest "uh".'),
  s('quick', false, 'Y', 'y', 'yes', 'The start of "yes", held a moment, then the tiniest "uh". Not "yee".'),
  s('quick', false, 'H', 'h', 'hat', 'A breath you can hold a moment, like fogging up glasses. Not "huh".'),

  s('held', true, 'S', 's (and soft c)', 'sun', '"sss", held about half a second.'),
  s('held', true, 'SH', 'sh', 'ship', '"shh", lips pushed out a little, held about half a second.'),
  s('held', true, 'F', 'f', 'fish', '"fff", top teeth resting on the bottom lip, soft, held about half a second.'),
  s('held', true, 'M', 'm', 'map', '"mmm", lips together, held about a second.'),
  s('held', true, 'N', 'n', 'net', '"nnn", tongue up behind the top teeth, held about a second.'),
  s('held', true, 'L', 'l', 'leaf', '"lll", tongue tip up behind the top teeth, held about a second. Not "ul".'),
  s('held', true, 'R', 'r', 'red', 'The fire engine sound: start to say "ruh", hold the r and drop the "uh". Not "er".'),
  s('held', true, 'V', 'v', 'van', '"vvv", top teeth on the bottom lip, held about a second, with your voice on the whole time: a hand on your throat feels it buzz. Not a whispered "fff".'),
  s('held', true, 'Z', 'z', 'zoo', '"zzz", like a bee, held about a second, with your voice on the whole time: a hand on your throat feels it buzz. Not a whispered "sss".'),

  s('lr', true, 'BL', 'bl', 'blue', 'b, then the l held: "bllll". No "uh" between them or after.'),
  s('lr', true, 'CL', 'cl', 'clap', 'A quiet k, then the l held: "kllll". No "uh".'),
  s('lr', true, 'FL', 'fl', 'flag', '"fff", then "lll", joined: "fffllll".'),
  s('lr', true, 'GL', 'gl', 'glad', 'g, then the l held: "gllll". No "uh".'),
  s('lr', true, 'PL', 'pl', 'plum', 'p, then the l held: "pllll". No "uh".'),
  s('lr', true, 'SL', 'sl', 'sled', '"sss", then "lll", joined, the l held longer.'),
  s('lr', true, 'BR', 'br', 'brush', 'b, then the r held: "brrrr". No "uh".'),
  s('again', true, 'CR', 'cr', 'crab', 'A clear, crisp k (a little puff), then straight into a strong r held a full second: "k-rrrr". No "uh" between them.'),
  s('again', true, 'DR', 'dr', 'drum', 'A clear, crisp d (tongue tap behind the top teeth), then straight into a strong r held a full second: "d-rrrr". No "uh" between them.'),
  s('lr', true, 'FR', 'fr', 'frog', '"fff", then "rrr", joined.'),
  s('lr', true, 'GR', 'gr', 'grass', 'g, then the r held: "grrrr". No "uh".'),
  s('lr', true, 'PR', 'pr', 'prize', 'p, then the r held: "prrrr". No "uh".'),
  s('lr', true, 'TR', 'tr', 'truck', 't, then the r held: "trrrr", the two close together. It leans a little toward "chr".'),

  s('s', false, 'SK', 'sk (and sc)', 'skip', 'A short "s", then a soft k: "sk". No "uh".'),
  s('s', true, 'SM', 'sm', 'smile', '"sss", then "mmm", joined with no gap.'),
  s('s', true, 'SN', 'sn', 'snake', '"sss", then "nnn", the n held longer.'),
  s('s', false, 'SP', 'sp', 'spin', 'A short "sss", then a soft p with no puff: "sp". No "uh".'),
  s('s', false, 'ST', 'st', 'stop', 'A short "sss", then a soft t: "st". No "uh".'),
  s('s', true, 'SW', 'sw', 'swim', '"sss", then a quick w: "ssswww". No "uh".'),
  s('s', false, 'TW', 'tw', 'twin', 't, then a w with the lips rounded: "tw", both sounds clear.'),

  s('pilot', false, 'B', 'b', 'bat', 'Lips together, then a quick pop with only the tiniest "uh", or a whispered one. Not "buh".'),
  s('pilot', false, 'D', 'd', 'dog', 'Tongue behind the top teeth, a quick tap with the tiniest whispered "ih". Not "duh", and not "j".'),
  s('pilot', false, 'G', 'g', 'goat', 'A quick catch at the back of the throat, like radio static with a little hum. Not "guh".'),
  s('pilot', true, 'TH', 'th (thumb)', 'thumb', 'Tongue between the teeth and blow, with no voice: "thhh", held about a second.'),
  s('pilot', true, 'TH_alt', 'th (this)', 'this', 'The same, with your voice on, so it buzzes: "thhh", held about a second.'),
  s('pilot', true, 'NG', 'ng', 'king', 'The end of "king", held about a second, with no g after it. Back of the tongue up, air through the nose.'),
  s('pilot', false, 'W', 'w (and wh)', 'wet', 'Lips in a small tight circle, then a quick "w" into the tiniest "uh". Not "ooo-wuh".'),
  s('pilot', true, 'OO', 'oo (moon)', 'moon', 'The "oo" of "moon", said slowly, about a second, lips rounded. Not "ew".')
];

// The letters' names as the app says them (letterNameSpeech in
// src/utils/phonics.ts); `word` holds what is said. A pick goes in as
// scripts/voice/recorded/name__B.wav.
const n = (file: string, said: string, how = 'Once, clearly, like a teacher holding up the card.'): RecordSound => ({
  kind: 'name',
  file,
  label: file,
  word: said,
  how,
  held: false,
  group: 'names'
});
const pair = 'The two letter names, one after the other with a tiny gap, like spelling it out.';

const NAME_CARDS: RecordSound[] = [
  n('A', 'ay'), n('B', 'bee'), n('C', 'see'), n('D', 'dee'), n('E', 'ee'), n('F', 'ef'), n('G', 'jee'),
  n('H', 'aitch', 'Once, clearly: "aitch", with no h in front.'), n('I', 'eye'), n('J', 'jay'), n('K', 'kay'),
  n('L', 'el'), n('M', 'em'), n('N', 'en'), n('O', 'oh'), n('P', 'pee'), n('Q', 'cue'),
  n('R', 'ar', 'Once, clearly: "ar", ending in a real R.'), n('S', 'ess'), n('T', 'tee'), n('U', 'you'),
  n('V', 'vee'), n('W', 'double you'), n('X', 'ex'), n('Y', 'why'), n('Z', 'zee', 'Once, clearly: "zee", the z buzzing.'),
  n('SH', 'ess aitch', pair), n('CH', 'see aitch', pair), n('TH', 'tee aitch', pair), n('WH', 'double you aitch', pair),
  n('NG', 'en jee', pair), n('CK', 'see kay', pair), n('QU', 'cue you', pair)
];

export const RECORD_SOUNDS: RecordSound[] = [...SOUND_CARDS, ...NAME_CARDS];

/** Each sound's slots: three takes of the sound, then the word once. A name has the three takes only. */
export const SLOTS = ['take1', 'take2', 'take3', 'word'] as const;
export type Slot = (typeof SLOTS)[number];
export const slotsOf = (sound: RecordSound): readonly Slot[] => (sound.kind === 'name' ? SLOTS.slice(0, 3) : SLOTS);

export const takeName = (sound: RecordSound, slot: Slot) => `${sound.kind}__${sound.file}__${slot}.wav`;
