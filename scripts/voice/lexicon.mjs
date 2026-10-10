// How Kokoro is asked to say a line of prose, as opposed to how it is written.
//
// Kokoro reads text through espeak-ng (via the `phonemizer` package), which has
// two habits that matter in an app about letters. Both were found by running
// every rendered line through the same phonemize() call kokoro-js makes:
//
//   - A capital A with a word after it is read as the article: "makes the A
//     say its name" came out as "makes the uh say its name", and "A is for"
//     as "uh is for". Respelled "eigh", espeak says /eɪ/ every time.
//   - Some ALL-CAPS words are spelled out, depending on what surrounds them:
//     "the sight word SEE" was "ess-ee-ee", "rhymes with CAT" was "see-ay-tee".
//     A caps word the app also knows as a vocabulary word is lowercased. A caps
//     letter team is left alone, because "SH is for" means the letters' names.
//   - An "a" trailing off before "..." is stressed into the letter name too:
//     "I see a..." was "I see ay". Respelled "uh".
//
// Only the audio changes; the text on screen is untouched.

/**
 * Where a capital A starts a sentence it is "a" ("A cute cat plays"), unless a
 * letter's own phrase follows it: "A is for", "A and I work together".
 */
const LETTER_A =
  /(?<![.!?:;"“”…]\s*)(?<!^\s*)\bA\b(?=[\s,\-–—]+\p{L})|(?:^|(?<=[.!?:;"“”…]\s*))A\b(?=\s+(?:is for|says|makes|and)\b)/gu;

export function speakable(text, vocabulary) {
  return text
    // "I see a..." trailing off: espeak stresses an "a" before a pause into
    // the letter name ("I see ay"), so it is respelled as the article
    .replace(/\b([Aa])(?=\.\.\.|…)/g, (_, a) => (a === 'A' ? 'Uh' : 'uh'))
    .replace(/\b[A-Z]{2,}\b/g, w => (vocabulary.has(w.toLowerCase()) ? w.toLowerCase() : w))
    .replace(LETTER_A, 'eigh');
}
