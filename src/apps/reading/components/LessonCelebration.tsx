import React, { useEffect, useRef } from 'react';
import type { Lesson } from '../../../types/reading';
import { launchConfetti } from '../../../utils/confetti';
import { soundManager } from '../../../utils/audio';
import { StarIcon, SparklesIcon, ArrowRightIcon, HomeIcon } from '../../../components/ui/Icons';
import { Button } from '../../../components/ui/Button';
import './LessonCelebration.scss';

interface LessonCelebrationProps {
  lesson: Lesson;
  starsEarned: number;
  pointsEarned: number;
  streakDays: number;
  newAchievements: string[];
  onNextLesson?: () => void;
  onReturnToDashboard: () => void;
}

export const LessonCelebration: React.FC<LessonCelebrationProps> = ({
  lesson,
  starsEarned,
  pointsEarned,
  streakDays,
  newAchievements,
  onNextLesson,
  onReturnToDashboard
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    soundManager.playFanfare();
    launchConfetti(canvasRef.current, 3500);

    setTimeout(() => {
      soundManager.speak(`Super job! You completed ${lesson.title} and earned ${starsEarned} golden stars!`);
    }, 600);
  }, [lesson, starsEarned]);

  return (
    <div className="lesson-celebration-container">
      {/* Celebration Confetti Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="confetti-canvas-overlay"
      />

      <div className="celebration-modal-card">
        {/* Animated Celebration Icon & Badge */}
        <div className="celebration-icon-avatar">
          <span>🎉</span>
        </div>

        <div className="celebration-title-group">
          <div className="completed-pill">
            <SparklesIcon size={14} color="#D97706" /> Activity Completed!
          </div>
          <h2 className="celebration-title">
            You’re a Super Star!
          </h2>
          <p className="celebration-subtitle">
            Great job learning <span className="lesson-highlight">{lesson.title}</span>!
          </p>
        </div>

        {/* Golden Stars Award Row */}
        <div className="stars-reward-row">
          {Array.from({ length: starsEarned }).map((_, i) => (
            <div
              key={i}
              className="star-burst-reward"
              style={{ animationDelay: `${i * 180}ms` }}
            >
              <StarIcon size={48} color="#FFD166" filled />
            </div>
          ))}
        </div>

        {/* Rewards Stats Summary */}
        <div className="rewards-summary-grid">
          <div className="reward-metric-box box-points">
            <span className="metric-label">
              Points Earned
            </span>
            <span className="metric-value">
              +{pointsEarned} pts
            </span>
          </div>

          <div className="reward-metric-box box-streak">
            <span className="metric-label">
              Daily Streak
            </span>
            <span className="metric-value">
              🔥 {streakDays} Days
            </span>
          </div>
        </div>

        {/* New Badges Notification */}
        {newAchievements.length > 0 && (
          <div className="new-badge-unlocked-banner">
            <span className="badge-emoji-box">🏆</span>
            <div className="badge-announcement">
              <span className="announcement-title">
                New Badge Unlocked!
              </span>
              <span className="announcement-desc">
                Check your Trophy Room to see your new award!
              </span>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="celebration-actions-row">
          {onNextLesson && (
            <Button
              variant="success"
              size="lg"
              style={{ flex: 1 }}
              onClick={onNextLesson}
            >
              <span>Next Activity</span>
              <ArrowRightIcon size={20} />
            </Button>
          )}

          <Button
            variant="secondary"
            size="lg"
            style={{ flex: 1 }}
            onClick={onReturnToDashboard}
          >
            <HomeIcon size={18} />
            <span>Reading Hub</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

