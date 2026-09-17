import React from 'react';
import { StarIcon } from './Icons';
import './StarBadge.scss';

interface StarBadgeProps {
  stars: number;
  points?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  onClick?: () => void;
}

export const StarBadge: React.FC<StarBadgeProps> = ({
  stars,
  points,
  size = 'md',
  animated = false,
  onClick
}) => {
  return (
    <div
      className={`star-badge-container size-${size} ${onClick ? 'clickable' : ''} ${animated ? 'animate-bounce-short' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="star-glow-icon">
        <StarIcon size={size === 'sm' ? 18 : size === 'md' ? 22 : 28} color="#FFD166" filled />
      </div>
      <span className="star-count">
        {stars}
      </span>
      {points !== undefined && (
        <span className="points-label">
          {points} pts
        </span>
      )}
    </div>
  );
};

