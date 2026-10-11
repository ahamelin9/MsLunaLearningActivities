import React from 'react';
import type { GradeLevel } from '@/types/reading';
import { GRADES } from '@/data/readingCurriculum';
import { soundManager } from '@/utils/audio';
import { pronunciation, type SpeechPart } from '@/utils/pronunciation';
import { Mascot } from '@/components/ui/Mascot/Mascot';
import { SparklesIcon, ArrowRightIcon } from '@/components/ui/Icons/Icons';
import styles from './GradeSelect.module.scss';

/** Written out whole so each is a rendered clip. */
const GRADE_LINES: Record<GradeLevel, SpeechPart> = {
  kindergarten: { text: 'Let’s start Kindergarten!' },
  grade1: { text: 'Let’s start First Grade!' },
  grade2: { text: 'Let’s start Second Grade!' }
};

interface GradeSelectProps {
  onSelectGrade: (grade: GradeLevel) => void;
  currentGrade: GradeLevel | null;
}

export const GradeSelect: React.FC<GradeSelectProps> = ({
  onSelectGrade,
  currentGrade
}) => {
  const handleGradeClick = (grade: GradeLevel) => {
    soundManager.playPop();
    pronunciation.speakSequence([GRADE_LINES[grade]]);
    onSelectGrade(grade);
  };

  return (
    <div className={styles.gradeSelectPage} data-shot="grade-select">
      {/* Header & Mascot */}
      <div className={styles.gradeSelectHeader}>
        <Mascot
          speechText="Welcome! Pick your grade level to start learning with Ms. Luna!"
          expression="happy"
          size="md"
        />

        <div>
          <div className={styles.headerBadge}>
            <SparklesIcon size={14} color="#7E22CE" /> Choose Your Adventure
          </div>
          <h2 className={styles.headerTitle}>
            What Grade Are You Learning In?
          </h2>
          <p className={styles.headerDesc}>
            You can change this anytime in your settings or dashboard!
          </p>
        </div>
      </div>

      {/* Grade Cards Grid */}
      <div className={styles.gradeCardsGrid}>
        {GRADES.map(grade => {
          const isCurrent = currentGrade === grade.id;
          return (
            <div
              key={grade.id}
              onClick={() => handleGradeClick(grade.id)}
              className={styles.gradeCardItem}
              data-state={isCurrent ? 'active' : undefined}
              data-shot="grade-card"
              role="button"
              tabIndex={0}
              aria-label={`Select ${grade.title}`}
            >
              <div className={styles.cardTop}>
                <div
                  className={styles.gradeBadgeCircle}
                  style={{ background: grade.gradient }}
                >
                  <span>{grade.badgeEmoji}</span>
                </div>

                <div className={styles.gradeMetaRow}>
                  <span className={styles.agePill}>
                    {grade.ageRange}
                  </span>
                  {isCurrent && (
                    <span className={styles.activePill}>
                      Active
                    </span>
                  )}
                </div>

                <h3 className={styles.gradeTitle}>
                  {grade.title}
                </h3>

                <h4 className={styles.gradeSubtitle}>
                  {grade.subtitle}
                </h4>

                <p className={styles.gradeDesc}>
                  {grade.description}
                </p>
              </div>

              <div className={styles.cardActionFooter}>
                <span className={styles.selectLabel}>
                  Select Grade
                </span>
                <div className={styles.arrowCircle}>
                  <ArrowRightIcon size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

