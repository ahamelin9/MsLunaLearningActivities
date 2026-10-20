// Stars for a play (PRG-1): one rule for every game and lesson, from how many
// of its rounds were answered right the first time ("clean"). Finishing is
// always worth a star; a replay only adds stars above the best so far
// (`utils/storage.ts`). Time then moves them a little (PRG-10).

import { minutesOf } from '@/utils/storage';

/** The share of clean rounds each star needs: proposed to Alex 2026-10-19. */
export const STAR_RULE = {
  /** every round right the first time */
  three: 1,
  /** at least half of them */
  two: 0.5
} as const;

export function starsFor(cleanRounds: number, rounds: number): 1 | 2 | 3 {
  const share = rounds > 0 ? cleanRounds / rounds : 0;
  if (share >= STAR_RULE.three) return 3;
  if (share >= STAR_RULE.two) return 2;
  return 1;
}

/**
 * How time moves the stars (PRG-10; Alex, 2026-10-19: time mostly lifts, but
 * "a crazy amount of time" takes one): a play done inside its "about N min"
 * lifts 2 stars to 3, and one over 3 times that takes a star away, never
 * below 1. Anything between changes nothing.
 */
export const TIME_RULE = { slowTimes: 3 } as const;

/** What time did to a play's stars: lifted them, took one, or nothing. */
export type TimeStar = 'quick' | 'slow' | null;

export function starsWithTime(
  stars: 1 | 2 | 3,
  seconds: number,
  estimateMinutes: number
): { stars: 1 | 2 | 3; time: TimeStar } {
  if (stars === 2 && minutesOf(seconds) <= estimateMinutes) return { stars: 3, time: 'quick' };
  if (stars > 1 && seconds > estimateMinutes * 60 * TIME_RULE.slowTimes) {
    return { stars: (stars - 1) as 1 | 2, time: 'slow' };
  }
  return { stars, time: null };
}
