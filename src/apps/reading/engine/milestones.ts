// When the moon visits the done screen (DES-17; the rule Alex picked for
// BUG-25, 2026-10-19, so it's easy to predict and to test). At most one visit
// per done screen, the biggest moment a play reaches:
//   - every lesson in the grade done (once per grade);
//   - the first lesson ever finished (once per child);
//   - a lesson finished with 3 stars (PRG-1), every time;
//   - a game's first 3-star play (once per game).
// "Once" is claimed in the saved achievements (utils/storage.ts). The full
// squishy shelf is PRG-4's.

import type { GradeLevel } from '@/types/reading';
import type { AnyGameDef } from './types';
import type { Milestone } from './luna';

/** The achievement that records a once-only visit; null for one that comes every time. */
export const milestoneId = (milestone: Milestone, grade: GradeLevel, gameId: string): string | null => {
  switch (milestone) {
    case 'first':
      return 'moon-first-lesson';
    case 'all':
      return `moon-all-${grade}`;
    case 'perfectGame':
      return `moon-3-stars-${gameId}`;
    case 'perfectLesson':
      return null;
  }
};

/**
 * The moments a finished lesson reaches, biggest first: all of the grade's
 * lessons done, the first lesson ever, 3 stars. The shell takes the first
 * not already claimed.
 */
export function lessonMilestones(gradeLessons: AnyGameDef[], before: string[], after: string[], stars: number): Milestone[] {
  const ids = gradeLessons.flatMap(l => (l.lesson ? [l.lesson.id] : []));
  const doneIn = (list: string[]) => ids.filter(id => list.includes(id)).length;
  const reached: Milestone[] = [];
  if (ids.length && doneIn(after) === ids.length && doneIn(before) < ids.length) reached.push('all');
  if (before.length === 0 && after.length > 0) reached.push('first');
  if (stars === 3) reached.push('perfectLesson');
  return reached;
}

/** A finished game reaches one moment: 3 stars, the first time. */
export const gameMilestones = (stars: number): Milestone[] => (stars === 3 ? ['perfectGame'] : []);
