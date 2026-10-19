import React, { useEffect, useRef } from 'react';
import { GAMES } from '@/apps/reading/games';
import { lessonsFor } from '@/apps/reading/engine/lessons';
import { GRADES } from '@/data/readingCurriculum';
import { ChunkyButton } from '@/components/kit';
import styles from './SettingsModal.module.scss';

interface TeachesListProps {
  onBack: () => void;
}

/**
 * What each game and lesson teaches, for grown-ups (SET-5): every game's and
 * every lesson's `objective`, in plain words. Part of Settings, so it sits
 * behind the grown-up gate (SET-1) and shares Settings' groups and rows; no
 * child screen shows an objective (screens.md rule 8; the start screen's
 * "Learning:" line went with DES-22a). The games first, then each grade's
 * lessons in order.
 */
export const TeachesList: React.FC<TeachesListProps> = ({ onBack }) => {
  // it opens at the top, wherever Settings had been scrolled to
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    root.current?.closest('[role="dialog"]')?.scrollTo({ top: 0 });
  }, []);

  return (
    <div className={styles.teaches} data-shot="teaches" ref={root}>
      <ChunkyButton icon="arrow-left" onClick={onBack} className={styles.back}>
        Back to settings
      </ChunkyButton>

      <section className={styles.group}>
        <h3 className={styles.groupName}>The games</h3>
        {GAMES.map(game => (
          <p key={game.id} className={styles.text}>
            <span className={styles.name}>{game.title}</span>
            <span className={styles.desc}>{game.objective}</span>
          </p>
        ))}
      </section>

      {GRADES.map(grade => (
        <section key={grade.id} className={styles.group}>
          <h3 className={styles.groupName}>{grade.title} lessons</h3>
          {lessonsFor(grade.id).map((lesson, i) => (
            <p key={lesson.id} className={styles.text}>
              <span className={styles.name}>
                Lesson {i + 1} · {lesson.title}
              </span>
              <span className={styles.desc}>{lesson.objective}</span>
            </p>
          ))}
        </section>
      ))}
    </div>
  );
};
