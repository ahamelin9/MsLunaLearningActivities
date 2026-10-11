import React from 'react';
import type { UserProgress } from '@/types/user';
import { ACHIEVEMENTS } from '@/data/achievements';
import { soundManager } from '@/utils/audio';
import { XIcon, StarIcon, TrophyIcon, CheckIcon } from '@/components/ui/Icons/Icons';
import { cx } from '@/utils/cx';
import styles from './TrophyModal.module.scss';

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
    <div className={styles.modalBackdropBlur} onClick={onClose}>
      <div
        className={styles.trophyModalCard}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="Trophy Room"
        data-shot="trophies"
      >
        {/* Header */}
        <div className={styles.trophyHeader}>
          <div className={styles.trophyTitleGroup}>
            <div className={styles.trophyBadgeIcon}>
              <TrophyIcon size={26} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>
                Trophy & Badge Room
              </h3>
              <p className={styles.modalSubtitle}>
                Celebrate your reading accomplishments!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            data-shot="modal-close"
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
        <div className={styles.trophyStatsGrid}>
          <div className={cx(styles.trophyStatCard, styles.cardStars)}>
            <StarIcon size={22} color="#D97706" filled />
            <span className={styles.statNumber}>
              {progress.totalStars}
            </span>
            <span className={styles.statDesc}>Stars Earned</span>
          </div>

          <div className={cx(styles.trophyStatCard, styles.cardStreak)}>
            <span style={{ fontSize: '1.4rem' }}>🔥</span>
            <span className={styles.statNumber}>
              {progress.streakDays}
            </span>
            <span className={styles.statDesc}>Day Streak</span>
          </div>

          <div className={cx(styles.trophyStatCard, styles.cardLessons)}>
            <span style={{ fontSize: '1.4rem' }}>📖</span>
            <span className={styles.statNumber}>
              {progress.completedLessons.length}
            </span>
            <span className={styles.statDesc}>Lessons Won</span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className={styles.badgesListSection}>
          <span className={styles.badgesSectionTitle}>
            Achievements & Badges
          </span>
          <div className={styles.badgesGrid}>
            {ACHIEVEMENTS.map(badge => {
              const isUnlocked = progress.unlockedAchievements.includes(badge.id) || badge.requirement(progress);
              return (
                <div
                  key={badge.id}
                  className={styles.badgeItemCard}
                  data-state={isUnlocked ? 'unlocked' : 'locked'}
                >
                  <div
                    className={styles.badgeIconBox}
                    style={{
                      background: isUnlocked ? badge.badgeColor : '#E2E8F0',
                      color: isUnlocked ? '#FFF' : '#94A3B8'
                    }}
                  >
                    {isUnlocked ? badge.iconEmoji : '🔒'}
                  </div>
                  <div className={styles.badgeDetails}>
                    <div className={styles.badgeTitle}>
                      <span>{badge.title}</span>
                      {isUnlocked && (
                        <span style={{ color: '#10B981', display: 'flex' }}>
                          <CheckIcon size={14} />
                        </span>
                      )}
                    </div>
                    <span className={styles.badgeDesc}>
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

