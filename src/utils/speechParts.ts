// Splitting written text into things that can be spoken.
//
// This lives apart from the voice itself so that the build script which
// renders the audio (scripts/voice/) can reuse it without dragging in
// AudioContext, fetch and the rest of the browser. Both sides must split text
// identically, or the app would ask for clips the renderer never made.

import { ipaFor, phonicsFor } from './phonics';

/** One piece of speech, tagged with what kind of sound it is. */
export interface SpeechPart {
  text?: string;
  sound?: string;
  name?: string;
  word?: string;
}

/**
 * IPA a lesson may write between slashes, as the sound key it names. ASCII is
 * read the app's own way first — "/i/" is the short i of "igloo", as in the
 * letter cards — so this only has to cover the symbols that are not letters.
 */
const IPA_SOUNDS: Record<string, string> = {
  'æ': 'A', 'eɪ': 'A+alt', 'ɛ': 'E', 'iː': 'E+alt', 'ɪ': 'I', 'aɪ': 'I+alt',
  'ɑ': 'O', 'ɒ': 'O', 'oʊ': 'O+alt', 'əʊ': 'O+alt', 'ʌ': 'U', 'juː': 'U+alt', 'uː': 'OO',
  'ʃ': 'SH', 'tʃ': 'CH', 'ʧ': 'CH', 'θ': 'TH', 'ð': 'TH+alt', 'ŋ': 'NG', 'dʒ': 'J', 'ʤ': 'J',
  'ɡ': 'G', 'ɹ': 'R', 'ɑːr': 'AR', 'ɑːɹ': 'AR', 'ɔːr': 'OR', 'ɔːɹ': 'OR', 'ɜː': 'ER', 'ɝ': 'ER'
};

/** The sound key a written fragment names, or null if it is just a word. */
function soundIn(fragment: string): string | null {
  const lower = fragment.toLowerCase();
  // a held digraph: shhh, thhh  (checked before the single-letter run)
  const digraph = /^(sh|ch|th|wh|ng)[hz]*$/.exec(lower);
  if (digraph && lower.length > 2 && phonicsFor(digraph[1])) return digraph[1];
  // a held consonant: mmmm, Sssss, ffff
  const run = /^([a-z])\1{2,}$/.exec(lower);
  if (run && phonicsFor(run[1])) return run[1];
  return null;
}

/** The sound key written between slashes: /m/, /sh/, /mmmm/, /fr/, /ar/, /aɪ/. */
function slashed(fragment: string): string | null {
  const inner = /^\/([^/\s]{1,4})\/$/.exec(fragment)?.[1];
  if (!inner) return null;
  if (/^[a-z]{1,3}$/i.test(inner) && ipaFor(inner)) return inner;
  return soundIn(inner) ?? IPA_SOUNDS[inner] ?? null;
}

/**
 * Ordinary sentences often carry a phoneme inside them:
 *   "What letter makes the mmmmm sound?"   "S says /s/."   "I says /aɪ/."
 * Handing that whole string to a speech engine spells the letters out
 * ("m-m-m-m-m") or reads the symbols, so those fragments are pulled out and
 * spoken as real phonemes instead. Everything else stays plain text.
 */
export function splitPhonics(text: string): SpeechPart[] {
  const tokens = text.split(/\s+/).filter(Boolean);
  const parts: SpeechPart[] = [];
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length) {
      parts.push({ text: buffer.join(' ') });
      buffer = [];
    }
  };

  for (const token of tokens) {
    // trim punctuation, but not the slashes or IPA a sound is written in
    const bare = token.replace(/^[^\p{L}/]+|[^\p{L}/ː]+$/gu, '');
    const trailing = bare ? token.slice(token.indexOf(bare) + bare.length) : '';

    const key = slashed(bare) ?? soundIn(bare);

    if (key) {
      flush();
      parts.push({ sound: key });
      // keep any trailing punctuation with the words that follow
      if (trailing.trim()) buffer.push(trailing.trim());
    } else {
      buffer.push(token);
    }
  }

  flush();

  // a fragment of pure punctuation is not worth speaking
  return parts.filter(p => (p.sound ? true : /[A-Za-z0-9]/.test(p.text ?? '')));
}
