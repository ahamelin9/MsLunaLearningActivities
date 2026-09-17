import React from 'react';
import type { GradeLevel } from '../../../types/reading';
import { GRADES } from '../../../data/readingCurriculum';
import { soundManager } from '../../../utils/audio';
import { Mascot } from '../../../components/ui/Mascot';
import { SparklesIcon, ArrowRightIcon } from '../../../components/ui/Icons';
import './GradeSelect.scss';

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
    soundManager.speak(`Let’s start ${grade === 'kindergarten' ? 'Kindergarten' : grade === 'grade1' ? 'First Grade' : 'Second Grade'}!`);
    onSelectGrade(grade);
  };

  return (
    <div className="grade-select-page">
      {/* Header & Mascot */}
      <div className="grade-select-header">
        <Mascot
          speechText="Welcome! Pick your grade level to start learning with Ms. Luna!"
          expression="happy"
          size="md"
        />

        <div>
          <div className="header-badge">
            <SparklesIcon size={14} color="#7E22CE" /> Choose Your Adventure
          </div>
          <h2 className="header-title">
            What Grade Are You Learning In?
          </h2>
          <p className="header-desc">
            You can change this anytime in your settings or dashboard!
          </p>
        </div>
      </div>

      {/* Grade Cards Grid */}
      <div className="grade-cards-grid">
        {GRADES.map(grade => {
          const isCurrent = currentGrade === grade.id;
          return (
            <div
              key={grade.id}
              onClick={() => handleGradeClick(grade.id)}
              className={`grade-card-item ${isCurrent ? 'active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`Select ${grade.title}`}
            >
              <div className="card-top">
                <div
                  className="grade-badge-circle"
                  style={{ background: grade.gradient }}
                >
                  <span>{grade.badgeEmoji}</span>
                </div>

                <div className="grade-meta-row">
                  <span className="age-pill">
                    {grade.ageRange}
                  </span>
                  {isCurrent && (
                    <span className="active-pill">
                      Active
                    </span>
                  )}
                </div>

                <h3 className="grade-title">
                  {grade.title}
                </h3>

                <h4 className="grade-subtitle">
                  {grade.subtitle}
                </h4>

                <p className="grade-desc">
                  {grade.description}
                </p>
              </div>

              <div className="card-action-footer">
                <span className="select-label">
                  Select Grade
                </span>
                <div className="arrow-circle">
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

