import React from 'react';
import type { UserProgress } from '../../types/user';
import { ACHIEVEMENTS } from '../../data/achievements';
import { soundManager } from '../../utils/audio';
import { XIcon, StarIcon, TrophyIcon, CheckIcon } from '../ui/Icons';
import './TrophyModal.scss';

interface TrophyModalProps {
  isOpen: boolean;
  progress: UserProgress;
  onClose: () => void;
}

export const TrophyModal: React.FC<TrophyModalProps> = ({
  isOpen,
  progress,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div
        className="trophy-modal-card"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="Trophy Room"
      >
        {/* Header */}
        <div className="trophy-header">
          <div className="trophy-title-group">
            <div className="trophy-badge-icon">
              <TrophyIcon size={26} />
            </div>
            <div>
              <h3 className="modal-title">
                Trophy & Badge Room
              </h3>
              <p className="modal-subtitle">
                Celebrate your reading accomplishments!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="modal-close-btn"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#F1F5F9',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Stats Highlight Banner */}
        <div className="trophy-stats-grid">
          <div className="trophy-stat-card card-stars">
            <StarIcon size={22} color="#D97706" filled />
            <span className="stat-number">
              {progress.totalStars}
            </span>
            <span className="stat-desc">Stars Earned</span>
          </div>

          <div className="trophy-stat-card card-streak">
            <span style={{ fontSize: '1.4rem' }}>🔥</span>
            <span className="stat-number">
              {progress.streakDays}
            </span>
            <span className="stat-desc">Day Streak</span>
          </div>

          <div className="trophy-stat-card card-lessons">
            <span style={{ fontSize: '1.4rem' }}>📖</span>
            <span className="stat-number">
              {progress.completedLessons.length}
            </span>
            <span className="stat-desc">Lessons Won</span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="badges-list-section">
          <span className="badges-section-title">
            Achievements & Badges
          </span>
          <div className="badges-grid">
            {ACHIEVEMENTS.map(badge => {
              const isUnlocked = progress.unlockedAchievements.includes(badge.id) || badge.requirement(progress);
              return (
                <div
                  key={badge.id}
                  className={`badge-item-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                >
                  <div
                    className="badge-icon-box"
                    style={{
                      background: isUnlocked ? badge.badgeColor : '#E2E8F0',
                      color: isUnlocked ? '#FFF' : '#94A3B8'
                    }}
                  >
                    {isUnlocked ? badge.iconEmoji : '🔒'}
                  </div>
                  <div className="badge-details">
                    <div className="badge-title">
                      <span>{badge.title}</span>
                      {isUnlocked && (
                        <span style={{ color: '#10B981', display: 'flex' }}>
                          <CheckIcon size={14} />
                        </span>
                      )}
                    </div>
                    <span className="badge-desc">
                      {badge.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

