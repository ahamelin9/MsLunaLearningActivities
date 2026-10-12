import React from 'react';
import type { UserProgress } from '@/types/user';
import type { AnyGameDef } from '../../engine/types';
import { cx } from '@/utils/cx';
import styles from './LessonPath.module.scss';

/**
 * The library's lessons, as they looked before the restyle: DES-21 moved them
 * here unchanged, and DES-13 rebuilds them on the kit's ProgressBar and
 * LessonCard (lessons in order, one bar).
 */

/** Painted spines for the lesson books, cycled so no two neighbours match. */
const SPINE_COLORS = ['#E4572E', '#4AA05A', '#4FA8D8', '#7C3AED', '#C97B12', '#B2566E'];

interface LessonPathProps {
  /** this grade's guided lessons, in teaching order (engine/lessons.ts) */
  lessons: AnyGameDef[];
  progress: UserProgress;
  gradeTitle: string;
  onStart: (lesson: AnyGameDef) => void;
}

export const LessonPath: React.FC<LessonPathProps> = ({ lessons, progress, gradeTitle, onStart }) => (
  <section className={styles.hubLessons}>
    <h2 className={styles.rugHeading}>
      <span>Luna’s Lessons</span>
      <small>
        {lessons.length} lessons for {gradeTitle} — start with the first
      </small>
    </h2>

    <div className={styles.lessonYard}>
      {lessons.map((lesson, i) => {
        const done = lesson.lesson ? progress.completedLessons.includes(lesson.lesson.id) : false;
        return (
          <button
            key={lesson.id}
            className={styles.gameThing}
            data-shape="lesson"
            data-state={done ? 'done' : undefined}
            data-shot="lesson-tile"
            style={{ '--spine': SPINE_COLORS[i % SPINE_COLORS.length] } as React.CSSProperties}
            onClick={() => onStart(lesson)}
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

            {done && (
              <span className={styles.lessonDone} title="Finished">
                ✓ done
              </span>
            )}
          </button>
        );
      })}
    </div>
  </section>
);
