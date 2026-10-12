/**
 * StarRow: the stars a lesson earned, 0 to 3, which can land one by one.
 *
 * Props:  earned: 0 | 1 | 2 | 3 · size: 24 | 48 (default 48)
 *         animate?: the earned stars land with the shared pop, one after
 *         another · className is layout only
 * States: earned (the star colours) · not earned (an empty star in the well)
 * Tokens: --star-size, --star-fill, --star-edge, --star-stroke, --star-gap,
 *         --star-stagger
 * Reads:  --illo-star, --illo-star-edge (the stars a child earns, the same in
 *         both modes), --well, --soil-deep, --space-*, --motion-pop,
 *         --dur-celebrate, --dur-tap
 * Board:  the Done board's three stars
 */

import type { CSSProperties } from 'react';
import { cx } from '@/utils/cx';
import { SHAPES } from '../Icon/shapes';
import styles from './StarRow.module.scss';

interface StarRowProps {
  earned: 0 | 1 | 2 | 3;
  size?: 24 | 48;
  animate?: boolean;
  className?: string;
}

export function StarRow({ earned, size = 48, animate = false, className }: StarRowProps) {
  return (
    <span
      className={cx(styles.root, className)}
      data-size={size}
      data-state={animate ? 'landing' : undefined}
      role="img"
      aria-label={`${earned} of 3 stars`}
    >
      {[0, 1, 2].map(i => (
        <svg
          key={i}
          className={styles.star}
          viewBox="0 0 24 24"
          data-state={i < earned ? 'earned' : undefined}
          style={{ '--i': i } as CSSProperties}
          aria-hidden="true"
        >
          {SHAPES.star}
        </svg>
      ))}
    </span>
  );
}
