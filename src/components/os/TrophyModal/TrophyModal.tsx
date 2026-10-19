import React from 'react';
import type { UserProgress } from '@/types/user';
import { ACHIEVEMENTS } from '@/data/achievements';
import { soundManager } from '@/utils/audio';
import { Icon, type IconName, Modal, PaperCard } from '@/components/kit';
import styles from './TrophyModal.module.scss';

interface TrophyModalProps {
  isOpen: boolean;
  progress: UserProgress;
  onClose: () => void;
}

/**
 * The Trophy room (DES-9b): a kit Modal with the child's stars, days in a row
 * and lessons done, and the badges, each won or still locked. It opens from
 * the library's sticker tin; PRG-5's squishy shelf takes that over.
 */
export const TrophyModal: React.FC<TrophyModalProps> = ({ isOpen, progress, onClose }) => {
  const stats: { icon: IconName; value: number; label: string }[] = [
    { icon: 'star', value: progress.totalStars, label: 'Stars' },
    { icon: 'sparkle', value: progress.streakDays, label: 'Days in a row' },
    { icon: 'book', value: progress.completedLessons.length, label: 'Lessons done' }
  ];

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        soundManager.playPop();
        onClose();
      }}
      title="Trophy room"
      closeLabel="Close the Trophy room"
      data-shot="trophies"
    >
      <div className={styles.stats}>
        {stats.map(stat => (
          <PaperCard key={stat.label} variant="flat" className={styles.stat}>
            <Icon name={stat.icon} size={24} filled={stat.icon === 'star'} className={styles.statIcon} />
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </PaperCard>
        ))}
      </div>

      <h3 className={styles.heading}>Badges</h3>
      <ul className={styles.badges}>
        {ACHIEVEMENTS.map(badge => {
          // worked out when progress is saved (PRG-3): the room only reads it
          const won = progress.unlockedAchievements.includes(badge.id);
          return (
            <li key={badge.id} className={styles.badge} data-state={won ? 'won' : 'locked'}>
              <span className={styles.badgePicture} aria-hidden="true">
                {won ? badge.iconEmoji : <Icon name="lock" size={24} />}
              </span>
              <span className={styles.badgeText}>
                <span className={styles.badgeTitle}>
                  {badge.title}
                  {won && <Icon name="check" size={20} label="Won" className={styles.badgeCheck} />}
                </span>
                <span className={styles.badgeDesc}>{badge.description}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
};
