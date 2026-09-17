import React from 'react';
import './ProgressBar.scss';

interface ProgressBarProps {
  current: number;
  total: number;
  showCount?: boolean;
  color?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showCount = true,
  className = ''
}) => {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;

  return (
    <div className={`progress-bar-wrapper ${className}`}>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        >
          <div className="progress-shimmer" />
        </div>
      </div>
      {showCount && (
        <span className="progress-text">
          {current} / {total}
        </span>
      )}
    </div>
  );
};

