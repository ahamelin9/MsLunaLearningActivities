// A lesson's choices name their word, and its spelling and picture come from
// the word bank (CNT-2): each word has one entry and one picture, wherever it
// shows. A word missing from the bank fails here, as the app loads and in
// voice:audit, so it can't go unnoticed.

import { WORDS, type WordItem } from '../apps/reading/engine/content';

export function bankWord(word: string): WordItem {
  const item = WORDS.find(w => w.word === word);
  if (!item) throw new Error(`Lesson word "${word}" is not in the word bank (engine/content.ts)`);
  return item;
}

/** A word's one picture. */
export const pictureOf = (word: string): string => bankWord(word).emoji;

/** A picture to pick, named once it's found. */
export const pictureChoice = (word: string, isCorrect: boolean) => ({
  id: `opt-${word}`,
  word,
  imageEmoji: pictureOf(word),
  isCorrect
});

/** A rhyme's picture to pick. */
export const rhymeChoice = (word: string, isRhyme: boolean) => ({ word, emoji: pictureOf(word), isRhyme });

/** A sentence's answer: a phrase in its own words, with the picture of the word it's about. */
export const phraseChoice = (word: string, text: string, isCorrect: boolean) => ({
  id: `opt-${word}`,
  text,
  imageEmoji: pictureOf(word),
  isCorrect
});
