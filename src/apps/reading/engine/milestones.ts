// The milestones the moon visits for (DES-17). Not after an ordinary lesson,
// so a visit stays special, and at most one per done screen: the biggest one
// a lesson reaches. Each is claimed once per child in the saved achievements
// (utils/storage.ts), so replaying a lesson never brings her back. The full
// squishy shelf is PRG-4's.

import type { GradeLevel } from '@/types/reading';
import type { AnyGameDef } from './types';
import type { Milestone } from './luna';

/** The achievement that records a milestone's visit, once per child. */
export const milestoneId = (milestone: Milestone, grade: GradeLevel): string =>
  milestone === 'first' ? 'moon-first-lesson' : `moon-${milestone}-${grade}`;

/**
 * The biggest milestone finishing a lesson reaches, from the lessons done
 * before it and after it: all of the grade's lessons, then half of them (half
 * rounded up), then the first lesson ever. Null for an ordinary lesson.
 */
export function milestoneReached(
  gradeLessons: AnyGameDef[],
  before: string[],
  after: string[]
): Milestone | null {
  const ids = gradeLessons.flatMap(l => (l.lesson ? [l.lesson.id] : []));
  if (!ids.length) return null;
  const doneIn = (list: string[]) => ids.filter(id => list.includes(id)).length;
  const was = doneIn(before);
  const now = doneIn(after);
  const half = Math.ceil(ids.length / 2);
  if (now === ids.length && was < ids.length) return 'all';
  if (now >= half && was < half) return 'half';
  if (before.length === 0 && after.length > 0) return 'first';
  return null;
}
