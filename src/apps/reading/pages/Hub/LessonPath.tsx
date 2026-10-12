import React, { useEffect, useRef, useState } from 'react';
import type { AnyGameDef } from '../../engine/types';
import type { LessonState } from '../../engine/lessons';
import { cx, dataState } from '@/utils/cx';
import { afterMotion } from '@/utils/motion';
import styles from './LessonPath.module.scss';

/**
 * The library's lessons, as they looked before the restyle: DES-21 moved them
 * here unchanged, and DES-13 rebuilds them on the kit's ProgressBar and
 * LessonCard (lessons in order, one bar). PRG-7 gave them a locked state in
 * the same old look: faded, a lock, and a wobble when tapped.
 */

/** Painted spines for the lesson books, cycled so no two neighbours match. */
const SPINE_COLORS = ['#E4572E', '#4AA05A', '#4FA8D8', '#7C3AED', '#C97B12', '#B2566E'];

interface LessonPathProps {
  /** this grade's guided lessons, in teaching order (engine/lessons.ts) */
  lessons: AnyGameDef[];
  /** each lesson's place on the path (lessonStates, PRG-7) */
  states: LessonState[];
  gradeTitle: string;
  onStart: (lesson: AnyGameDef) => void;
  /** a locked lesson was tapped: it doesn't open, and Luna says which is up next */
  onLocked: () => void;
}

export const LessonPath: React.FC<LessonPathProps> = ({ lessons, states, gradeTitle, onStart, onLocked }) => {
  const [wobbling, setWobbling] = useState<number | null>(null);
  const cancel = useRef<() => void>(undefined);
  useEffect(() => () => cancel.current?.(), []);

  const tapLocked = (i: number) => {
    if (wobbling === null) {
      setWobbling(i);
      cancel.current = afterMotion('emphasis', () => setWobbling(null));
    }
    onLocked();
  };

  return (
    <section className={styles.hubLessons}>
      <h2 className={styles.rugHeading}>
        <span>Luna’s Lessons</span>
        <small>
          {lessons.length} lessons for {gradeTitle} — start with the first
        </small>
      </h2>

      <div className={styles.lessonYard}>
        {lessons.map((lesson, i) => {
          const state = states[i];
          return (
            <button
              key={lesson.id}
              className={styles.gameThing}
              data-shape="lesson"
              data-state={dataState(state === 'done' && 'done', state === 'locked' && 'locked', wobbling === i && 'wobbling')}
              data-shot="lesson-tile"
              aria-label={state === 'locked' ? `Lesson ${i + 1}, ${lesson.title}, locked` : undefined}
              style={{ '--spine': SPINE_COLORS[i % SPINE_COLORS.length] } as React.CSSProperties}
              onClick={() => (state === 'locked' ? tapLocked(i) : onStart(lesson))}
            >
              {/* an exercise book: a painted spine and ruled lines, the lesson's picture faint on the page */}
              <span className={cx(styles.scenery, styles.lessonScenery)} aria-hidden="true">
                <span className={styles.lessonSpine} />
                <span className={styles.lessonLines} />
                <span className={styles.lessonMark}>{lesson.emoji}</span>
              </span>

              <span className={styles.thingBody}>
                <span className={styles.thingKicker}>Lesson {i + 1}</span>
                <span className={styles.thingEmoji}>{lesson.emoji}</span>
                <span className={styles.thingTitle}>{lesson.title}</span>
                <span className={styles.thingTagline}>{lesson.tagline}</span>
              </span>

              {state === 'done' && (
                <span className={styles.lessonDone} title="Finished">
                  ✓ done
                </span>
              )}
              {state === 'locked' && (
                <span className={styles.lessonLock} aria-hidden="true">
                  🔒
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
