import React from 'react';
import { StarIcon } from '../Icons/Icons';
import { cx } from '@/utils/cx';
import styles from './StarBadge.module.scss';

interface StarBadgeProps {
  stars: number;
  points?: number;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const StarBadge: React.FC<StarBadgeProps> = ({
  stars,
  points,
  size = 'md',
  onClick
}) => {
  return (
    <div
      className={cx(styles.starBadgeContainer, onClick && styles.clickable)}
      data-size={size}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.starGlowIcon}>
        <StarIcon size={size === 'sm' ? 18 : size === 'md' ? 22 : 28} color="#FFD166" filled />
      </div>
      <span className={styles.starCount}>
        {stars}
      </span>
      {points !== undefined && (
        <span className={styles.pointsLabel}>
          {points} pts
        </span>
      )}
    </div>
  );
};

