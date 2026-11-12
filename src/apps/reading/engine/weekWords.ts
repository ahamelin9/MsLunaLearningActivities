// This week's words (CUR-9; Alex, 2026-11-08): the few words the teacher's class
// is working on this week. She picks them in the grown-up area, and the games
// deal them first wherever a round can use one (deck.ts, dealWeekFirst), so
// play backs up her lessons. Lessons keep their order and rounds.
//
// They're a setting (UserSettings.weekWords), saved on the device, so every
// group playing on it gets the same words. Storage hands them here as it loads
// and whenever they change (applySettings), so the deck can read them without
// a browser too: the voice audit and the content checks play every game in
// Node, where nothing is picked.

import { WORDS, type WordItem } from './content';

/** At most this many words a week. */
export const WEEK_WORDS_MAX = 10;

/** The words she can pick from: the bank's, less the lesson-only ones no game deals (CNT-2). */
export const PICKABLE_WORDS: WordItem[] = WORDS.filter(w => !w.lessonOnly);

const pickable = new Set(PICKABLE_WORDS.map(w => w.word));

let picked: string[] = [];

/** Takes the saved words: only bank words, each once, at most WEEK_WORDS_MAX. */
export function setWeekWords(words: readonly unknown[]) {
  const kept: string[] = [];
  for (const word of words) {
    if (typeof word === 'string' && pickable.has(word) && !kept.includes(word)) kept.push(word);
  }
  picked = kept.slice(0, WEEK_WORDS_MAX);
}

/** The words picked, in the order she picked them. */
export function weekWords(): readonly string[] {
  return picked;
}

/** Whether a bank word is one of this week's. */
export function isWeekWord(word: string): boolean {
  return picked.includes(word);
}

const escape = (word: string) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Whether a sentence, story or passage has one of this week's words in it,
 * as a whole word or with an s or es on the end ("cats", "buses").
 */
export function mentionsWeekWord(lines: string | readonly string[]): boolean {
  if (picked.length === 0) return false;
  const text = typeof lines === 'string' ? lines : lines.join(' ');
  return picked.some(word => new RegExp(`\\b${escape(word)}(?:e?s)?\\b`, 'i').test(text));
}
