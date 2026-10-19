// How long a lesson or game takes (PRG-6): "about N min" before, "took N min"
// after. The estimate starts as its rounds times a typical round, and once a
// few plays are timed it's their average, so it settles to how this class
// actually reads. Times count only while the app is on screen (GameShell).

import type { PlayTimes } from '@/types/user';
import { minutesOf } from '@/utils/storage';
import type { AnyGameDef } from './types';

/** A first guess at one round, in seconds, until real plays take over. */
export const ROUND_SECONDS = { lesson: 60, game: 40 } as const;

/** Plays timed before the estimate is their average. */
export const AVERAGE_AFTER = 3;

/** "About N min" for a lesson or game, from its own times when there are enough. */
export function estimateMinutes(game: AnyGameDef, times?: PlayTimes): number {
  if (times && times.plays >= AVERAGE_AFTER) return minutesOf(times.total / times.plays);
  const round = game.roundSeconds ?? (game.lesson ? ROUND_SECONDS.lesson : ROUND_SECONDS.game);
  return minutesOf(game.roundsPerPlay * round);
}
