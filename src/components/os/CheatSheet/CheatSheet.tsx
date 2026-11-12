import React, { useState } from 'react';
import type { UserProgress } from '@/types/user';
import type { GradeLevel } from '@/types/reading';
import { GAMES } from '@/apps/reading/games';
import { bucketsFor, lessonCovers } from '@/apps/reading/engine/buckets';
import { GRADES } from '@/data/readingCurriculum';
import { soundManager } from '@/utils/audio';
import { ChunkyButton, Modal, ProgressBar } from '@/components/kit';
import styles from './CheatSheet.module.scss';

interface CheatSheetProps {
  open: boolean;
  progress: UserProgress;
  onBack: () => void;
  onClose: () => void;
}

/**
 * The teacher's cheat sheet (CUR-8): what every lesson and game teaches, in
 * its own wide window behind the grown-up gate (it opens from Settings' "What
 * they learn"). One grade at a time, opening on the one being played: a table
 * of its skills (the buckets), each with its lessons in path order, what each
 * covers, and a bar of the ones learned on this device; then the games. All
 * of it comes from the lessons' and games' own data, so a new lesson shows up
 * by itself (cheatsheet-check.mjs, know-how). It names the letters and words a
 * lesson covers, which no child's screen does (heard, never shown).
 */
export const CheatSheet: React.FC<CheatSheetProps> = ({ open, progress, onBack, onClose }) => {
  const [grade, setGrade] = useState<GradeLevel>(progress.selectedGrade ?? GRADES[0].id);
  const buckets = bucketsFor(grade);
  const lessons = buckets.reduce((n, bucket) => n + bucket.lessons.length, 0);
  const learned = (bucket: (typeof buckets)[number]) =>
    bucket.lessons.filter(({ lesson }) => progress.completedLessons.includes(lesson.id)).length;

  return (
    <Modal open={open} onClose={onClose} title="What they learn" data-shot="teaches" className={styles.sheet}>
      <div className={styles.top}>
        <ChunkyButton icon="arrow-left" onClick={onBack} data-shot="sheet-back">
          Back to settings
        </ChunkyButton>
        <span className={styles.grades} role="group" aria-label="Grade">
          {GRADES.map(g => (
            <ChunkyButton
              key={g.id}
              aria-pressed={grade === g.id}
              data-shot={`sheet-grade-${g.id}`}
              onClick={() => {
                soundManager.playPop();
                setGrade(g.id);
              }}
            >
              {g.title}
            </ChunkyButton>
          ))}
        </span>
      </div>

      <section className={styles.part}>
        <h3 className={styles.partName}>{GRADES.find(g => g.id === grade)?.title} lessons</h3>
        <p className={styles.note}>
          {lessons} lessons in {buckets.length} skills. They open one at a time, in order; a lesson is learned once
          it has been practiced enough. The bars count what was learned on this device.
        </p>
        <table className={styles.table} data-shot="sheet-lessons">
          <thead>
            <tr>
              <th scope="col">Skill</th>
              <th scope="col">Its lessons, in order</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map(bucket => (
              <tr key={bucket.id} data-skill={bucket.id}>
                <th scope="row" className={styles.skill}>
                  <span className={styles.stack}>
                    <span className={styles.name}>
                      <span aria-hidden="true">{bucket.icon}</span> {bucket.name}
                    </span>
                    <span className={styles.desc}>{bucket.description}</span>
                    <ProgressBar done={learned(bucket)} total={bucket.lessons.length} className={styles.bar} />
                  </span>
                </th>
                <td>
                  <ol className={styles.lessons}>
                    {bucket.lessons.map(({ number, lesson }) => (
                      <li key={lesson.id} className={styles.lesson} data-lesson={lesson.id}>
                        <span className={styles.number}>Lesson {number}</span>
                        <span className={styles.name}>{lesson.title}</span>
                        <span className={styles.desc}>{lessonCovers(lesson)}</span>
                      </li>
                    ))}
                  </ol>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.part}>
        <h3 className={styles.partName}>The games</h3>
        <table className={styles.table} data-shot="sheet-games">
          <thead>
            <tr>
              <th scope="col">Game</th>
              <th scope="col">What it practices</th>
            </tr>
          </thead>
          <tbody>
            {GAMES.map(game => (
              <tr key={game.id} data-game={game.id}>
                <th scope="row" className={styles.skill}>
                  <span className={styles.name}>
                    <span aria-hidden="true">{game.emoji}</span> {game.title}
                  </span>
                </th>
                <td className={styles.desc}>{game.objective}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Modal>
  );
};
