// The rules every wrong answer follows, in one place. Games pick their wrong
// choices through pickWrong(), and the distractor check
// (.claude/skills/know-how/distractor-check.mjs) holds every game's rounds and
// every lesson to the same ruleBreaks(), so a choice that is picked here can't
// break a rule the check looks for.
//
// The rules:
// - no letter choice makes the target's sound (C/K/CK, W/WH) or is the
//   target itself in the other case;
// - no wrong choice is something already on screen, so the answer can't be
//   found by elimination;
// - no two choices show the same picture;
// - when the child knows the target word (they read it or heard it), at least
//   one wrong choice starts with the same letter, so the first letter alone
//   doesn't give it away;
// - a fill-in-the-blank records the words that would also make it true, and
//   none of them is offered as wrong. Code can't judge that, so the list is
//   written by hand on each item; a blank with no list breaks the rule too.

import { ipaFor } from '../../../utils/phonics';
import { shuffle, type WordItem } from './content';

/** One choice as the child meets it: what it says or shows, and its picture. */
export interface Choice {
  text: string;
  picture?: string;
}

/** A target, its wrong choices and what else is on screen, for ruleBreaks(). */
export interface ChoiceSet {
  target: Choice;
  wrong: Choice[];
  /** a letter target is asked for by its sound ("sss") or its name ("ess") */
  letterBy?: 'sound' | 'name';
  /** things the child can see besides the choices */
  onScreen?: Choice[];
  /** the child read or heard the target word, so its first letter is known */
  targetKnown?: boolean;
  /** a fill-in-the-blank, with its item's words that would also make it true */
  blank?: { alsoFits?: string[] };
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** C, K and CK all say /k/; W and WH both say /w/. Letters only: a word is never a sound. */
export function sameSound(a: string, b: string): boolean {
  const ipaA = ipaFor(a);
  return ipaA !== undefined && ipaA === ipaFor(b);
}

const firstLetter = (text: string) => text.trim().charAt(0).toLowerCase();

/** Every rule a set of choices breaks, in words. Empty means fair. */
export function ruleBreaks(set: ChoiceSet): string[] {
  const breaks: string[] = [];
  const { target, wrong } = set;
  const alsoFits = set.blank?.alsoFits;
  if (set.blank && !Array.isArray(alsoFits)) {
    breaks.push(`no list: the blank for "${target.text}" doesn't say which words also fit`);
  }

  for (const w of wrong) {
    if (alsoFits?.some(f => same(f, w.text))) breaks.push(`also fits: "${w.text}" would make it true too`);
    if (same(w.text, target.text)) breaks.push(`answer twice: "${w.text}" is offered as wrong`);
    else if (set.letterBy === 'sound' && sameSound(w.text, target.text)) {
      breaks.push(`same sound: ${w.text} says the same as ${target.text}`);
    }
    const shown = set.onScreen?.find(
      s => same(s.text, w.text) || (!!s.picture && s.picture === w.picture)
    );
    if (shown) breaks.push(`on screen: "${w.text}" is already showing`);
  }

  const pictures = [target, ...wrong].map(c => c.picture).filter((p): p is string => !!p);
  const repeated = pictures.filter((p, i) => pictures.indexOf(p) !== i);
  if (repeated.length > 0) breaks.push(`same picture twice: ${[...new Set(repeated)].join(' ')}`);

  if (set.targetKnown && wrong.length > 0 && !wrong.some(w => firstLetter(w.text) === firstLetter(target.text))) {
    breaks.push(`first-letter giveaway: only "${target.text}" starts with ${firstLetter(target.text)}`);
  }

  return breaks;
}

export interface PickOptions<T> {
  /** how an item shows as a choice */
  as: (item: T) => Choice;
  letterBy?: ChoiceSet['letterBy'];
  onScreen?: T[];
  targetKnown?: boolean;
  blank?: ChoiceSet['blank'];
}

/**
 * Up to `count` wrong choices from `pool` that keep every rule. When the
 * target is known, a choice that shares its first letter goes in first. Fewer
 * come back only if the pool runs out of fair ones.
 */
export function pickWrong<T>(target: T, pool: T[], count: number, opts: PickOptions<T>): T[] {
  const base = {
    target: opts.as(target),
    letterBy: opts.letterBy,
    onScreen: opts.onScreen?.map(opts.as),
    blank: opts.blank
  };
  const fair = (picked: T[]) => ruleBreaks({ ...base, wrong: picked.map(opts.as) }).length === 0;

  let candidates = shuffle(pool);
  if (opts.targetKnown) {
    const letter = firstLetter(base.target.text);
    const starts = (item: T) => firstLetter(opts.as(item).text) === letter;
    candidates = [...candidates.filter(starts), ...candidates.filter(c => !starts(c))];
  }

  const picked: T[] = [];
  for (const candidate of candidates) {
    if (picked.length >= count) break;
    if (fair([...picked, candidate])) picked.push(candidate);
  }
  return picked;
}

/** A word bank item as a choice: its word and its picture. */
export const wordChoice = (w: WordItem): Choice => ({ text: w.word, picture: w.emoji });

/** A letter or a plain word as a choice. */
export const textChoice = (text: string): Choice => ({ text });

/** `count` items with no picture twice, and none of the pictures in `avoid`. */
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
