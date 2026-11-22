// A round's countdown (CUR-16; the teacher, 2026-11-13: a timer for 1st and
// 2nd grade "to put some pressure on them to answer within the time limit",
// less time in 2nd grade). Alex: a pie in the top corner, counting down with
// the number inside (kit CountdownPie). The shell runs it; this is the table.
//
// The time starts with the round, while Luna still asks its question (CUR-18;
// Alex: "start right away and not after the owl is done talking"). It waits
// only while an answer is being said and while the tab is hidden. Running out
// is a miss with its own line: the round isn't right the first time any more,
// and the child still answers it.

import type { GradeLevel } from '@/types/reading';

/**
 * What a round asks of a child, for its time:
 * - `listen`: hear something and tap it (a letter, a word, a cookie)
 * - `find`: find several things (every bug with the letter)
 * - `read`: read a word or a sentence, then answer, or put it back together
 * - `passage`: read a few sentences, then answer
 */
export type TimerKind = 'listen' | 'find' | 'read' | 'passage';

/**
 * Seconds for a game's round, by grade; lessons have no countdown (CUR-24).
 * Kindergarten has none. The teacher (2026-11-21): "too fast, make 30
 * seconds", so every round has 30, and a Treasure Path passage keeps its 45
 * in 1st grade.
 */
export const ANSWER_SECONDS: Partial<Record<GradeLevel, Record<TimerKind, number>>> = {
  grade1: { listen: 30, find: 30, read: 30, passage: 45 },
  grade2: { listen: 30, find: 30, read: 30, passage: 30 }
};

/** The seconds a round has at this grade, or undefined when it isn't timed. */
export function roundSecondsLimit(grade: GradeLevel, kind: TimerKind | undefined): number | undefined {
  return kind ? ANSWER_SECONDS[grade]?.[kind] : undefined;
}
