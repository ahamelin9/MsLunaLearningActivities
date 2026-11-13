// How long a lesson or game takes (PRG-6): "about N min" before, "took N min"
// after. The estimate starts as its rounds times a typical round, and once a
// few plays are timed it's their average, so it settles to how this class
// actually reads. Times count only while the app is on screen (GameShell).

import type { PlayTimes } from '@/types/user';
import { minutesOf } from '@/utils/storage';
import type { AnyGameDef } from './types';

/**
 * A first guess at one round, in seconds, until real plays take over. A
 * lesson's round was 60 until CUR-12 (Alex, 2026-11-12: "about 20 seconds per
 * question"); a story lesson's round is a whole story, as Story Corner's.
 */
export const ROUND_SECONDS = { lesson: 20, story: 90, game: 40 } as const;

/** Plays timed before the estimate is their average. */
export const AVERAGE_AFTER = 3;

/**
 * "About N min" for a lesson or game, from its own times when there are enough.
 * The times are averaged per round, so a play that grows (CUR-12: 5 rounds to
 * 20) keeps a true estimate; times saved before they counted rounds wait for
 * new ones (storage.ts, recordTime).
 */
export function estimateMinutes(game: AnyGameDef, times?: PlayTimes): number {
  if (times?.rounds && times.plays >= AVERAGE_AFTER) return minutesOf((times.total / times.rounds) * game.roundsPerPlay);
  const round = game.roundSeconds ?? (game.lesson ? ROUND_SECONDS.lesson : ROUND_SECONDS.game);
  return minutesOf(game.roundsPerPlay * round);
}
