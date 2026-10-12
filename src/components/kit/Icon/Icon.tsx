/**
 * Icon: the drawn icon set. Round-capped strokes on a 24 grid, in currentColor:
 * an icon takes the colour of the text around it and has none of its own.
 *
 * Props:  name: IconName (the drawings are in shapes.tsx)
 *         size: 16 | 20 | 24 | 32 (default 24)
 *         filled?: fills the shape too (a star in a count chip)
 *         label?: what it means, for an icon standing alone; without one it's
 *         hidden from screen readers, as its button or chip names it
 *         className: layout only
 * States: none; it follows its parent's colour
 * Tokens: --icon-size, --icon-stroke; --icon-fill is inherited, so a kit parent
 *         can fill a shape in a second colour (currentColor if none is set)
 * Reads:  --space-4, --space-5, --space-6, --space-8
 * Board:  every round 2 board: header buttons, chips, lesson badges
 */

import { cx } from '@/utils/cx';
import { SHAPES, type IconName } from './shapes';
import styles from './Icon.module.scss';

export type { IconName };

interface IconProps {
  name: IconName;
  size?: 16 | 20 | 24 | 32;
  filled?: boolean;
  label?: string;
  className?: string;
}

export function Icon({ name, size = 24, filled = false, label, className }: IconProps) {
  return (
    <svg
      className={cx(styles.root, className)}
      viewBox="0 0 24 24"
      data-size={size}
      data-filled={filled || undefined}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {SHAPES[name]}
    </svg>
  );
}
