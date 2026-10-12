import React, { useEffect } from 'react';
import type { GradeLevel } from '@/types/reading';
import { GRADES } from '@/data/readingCurriculum';
import { soundManager } from '@/utils/audio';
import { pronunciation, type SpeechPart } from '@/utils/pronunciation';
import { Luna, SpeechBubble, Tile } from '@/components/kit';
import styles from './GradeSelect.module.scss';

/** Luna's question, said when the screen opens and when she's tapped. */
const WELCOME: SpeechPart = { text: 'Hi! Which grade are you in?' };

/** Written out whole so each is a rendered clip. */
const GRADE_LINES: Record<GradeLevel, SpeechPart> = {
  kindergarten: { text: 'Let’s start Kindergarten!' },
  grade1: { text: 'Let’s start First Grade!' },
  grade2: { text: 'Let’s start Second Grade!' }
};

/** What a child can read on each card: a letter or a number, not "1st Grade". */
const MARKS: Record<GradeLevel, string> = { kindergarten: 'K', grade1: '1', grade2: '2' };
const TINTS: Record<GradeLevel, 1 | 2 | 3> = { kindergarten: 1, grade1: 2, grade2: 3 };

interface GradeSelectProps {
  onSelectGrade: (grade: GradeLevel) => void;
  currentGrade: GradeLevel | null;
}

/**
 * Pick a grade (DES-9c): Luna asks, and the three grades are kit Tiles, the
 * current one picked. No board shows it; it's built from the kit and roles.
 */
export const GradeSelect: React.FC<GradeSelectProps> = ({ onSelectGrade, currentGrade }) => {
  // it always opens from a tap (the home icon, or the library's grade sign)
  useEffect(() => {
    pronunciation.speakSequence([WELCOME]);
  }, []);

  const handleLunaClick = () => {
    soundManager.playPop();
    pronunciation.speakSequence([WELCOME]);
  };

  const handleGradeClick = (grade: GradeLevel) => {
    soundManager.playPop();
    pronunciation.speakSequence([GRADE_LINES[grade]]);
    onSelectGrade(grade);
  };

  return (
    <div className={styles.page} data-shot="grade-select">
      <div className={styles.welcome}>
        <Luna mood="happy" size={128} float onClick={handleLunaClick} />
        <SpeechBubble>{WELCOME.text}</SpeechBubble>
      </div>

      <div className={styles.grades} role="group" aria-label="Grade">
        {GRADES.map(grade => (
          <Tile
            key={grade.id}
            name={grade.title}
            tint={TINTS[grade.id]}
            picture={<span className={styles.mark}>{MARKS[grade.id]}</span>}
            aria-pressed={currentGrade === grade.id}
            data-shot="grade-card"
            onClick={() => handleGradeClick(grade.id)}
          />
        ))}
      </div>
    </div>
  );
};
