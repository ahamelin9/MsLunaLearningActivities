// A lesson is practiced until it's learned (CUR-6; Alex, 2026-11-06: "they
// should do it a number of times to ensure they have actually learned it").
// Learned is what `completedLessons` means, so the path, the moon and the
// trophies keep working, and a lesson an older save finished stays done.

import type { LessonPractice } from '@/types/user';

/**
 * The rule, in one place: a lesson is learned after `goodPlays` good plays,
 * and a good play has at least `goodShare` of its rounds right the first time
 * (16 of 20, the usual classroom mastery line). So no child is ever stuck,
 * `anyPlays` plays of any kind also move the path on.
 */
export const LEARN_RULE = { goodPlays: 3, goodShare: 0.8, anyPlays: 6 } as const;

/**
 * How many rounds one play of a lesson deals, unless the lesson says otherwise
 * (a story lesson deals 2). It was 5 until CUR-12 (the teacher, 2026-11-12:
 * "maybe more than 5 practice questions would be useful"). A lesson holding
 * fewer asks its questions again (`dealMissedFirst`, deck.ts).
 */
export const ROUNDS_PER_PLAY = 20;

export const NO_PRACTICE: LessonPractice = { good: 0, plays: 0 };

export const isGoodPlay = (cleanRounds: number, rounds: number): boolean =>
  rounds > 0 && cleanRounds / rounds >= LEARN_RULE.goodShare;

/** The rounds right the first time that make a good play. */
export const goodPlayNeeds = (rounds: number): number => Math.ceil(rounds * LEARN_RULE.goodShare);

export const isLearned = (practice: LessonPractice): boolean =>
  practice.good >= LEARN_RULE.goodPlays || practice.plays >= LEARN_RULE.anyPlays;

export const afterPlay = (practice: LessonPractice, good: boolean): LessonPractice => ({
  good: practice.good + (good ? 1 : 0),
  plays: practice.plays + 1
});

/**
 * Where a finished play leaves a lesson: `learned` by good plays, `movedOn` by
 * plays of any kind, still in `practice`, or `done` before this play began.
 */
export type PracticeStage = 'learned' | 'movedOn' | 'practice' | 'done';

export interface PlayOutcome {
  good: boolean;
  stage: PracticeStage;
  /** the good plays so far, this one included, up to the goal */
  goodPlays: number;
}

export function outcomeOf(before: LessonPractice | undefined, wasDone: boolean, good: boolean): PlayOutcome {
  const after = afterPlay(before ?? NO_PRACTICE, good);
  const stage: PracticeStage = wasDone
    ? 'done'
    : after.good >= LEARN_RULE.goodPlays
      ? 'learned'
      : isLearned(after)
        ? 'movedOn'
        : 'practice';
  return { good, stage, goodPlays: Math.min(after.good, LEARN_RULE.goodPlays) };
}

/**
 * What Luna says on the done screen when a play changes where a lesson stands,
 * each a whole rendered clip. None counts the plays, so changing the rule
 * leaves them true.
 */
const LINES = {
  learned: [{ text: 'You learned this lesson! Way to go!' }, { text: 'You’ve got it! You learned this lesson!' }],
  movedOn: [{ text: 'Good work! You worked so hard on this lesson.' }],
  good: [{ text: 'Great play! Let’s practice it again.' }, { text: 'You’re learning it! Let’s practice again.' }],
  again: [{ text: 'Good try! Let’s practice it again.' }, { text: 'Keep going! Practice helps us learn.' }]
};

/** Luna's closing line for a play, or null when a lesson already done leaves it to her usual ones. */
export function practiceLine({ stage, good }: PlayOutcome, roll = Math.random()): string | null {
  if (stage === 'done') return null;
  const lines = stage === 'practice' ? (good ? LINES.good : LINES.again) : LINES[stage];
  return lines[Math.floor(roll * lines.length)].text;
}
