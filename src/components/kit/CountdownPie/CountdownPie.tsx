/**
 * CountdownPie (CUR-16): a round's time as a pie that empties, with the
 * seconds left in its middle (Alex, 2026-11-13: "a pie count down in the top
 * corner with a number counting down inside of it"). The shell runs the
 * clock and sets `left`; the pie only draws it. It isn't a button, so it has
 * no ledge and no press, and a screen reader hears it as a timer.
 *
 * Props:  left: the seconds left (a fraction is fine: the pie moves smoothly,
 *         the number counts whole seconds up) · total: the seconds it began at
 *         className is layout only
 * States: full to empty, from `left / total`; nothing animates, so reduced
 *         motion needs nothing of its own (the shell steps it once a second)
 * Tokens: --pie-size, --pie-fill, --pie-track, --pie-edge, --pie-face
 * Reads:  --accent, --well, --edge, --card, --ink, --target-chrome,
 *         --radius-chip, --border-regular, --text-label, --space-*
 * Board:  none: the round 2 boards have no timer. Sized as the header's
 *         buttons, in the colours of its rounds bar's neighbours
 */

import type { CSSProperties } from 'react';
import { cx } from '@/utils/cx';
import styles from './CountdownPie.module.scss';

interface CountdownPieProps {
  left: number;
  total: number;
  className?: string;
}

export function CountdownPie({ left, total, className }: CountdownPieProps) {
  const seconds = Math.max(0, Math.ceil(left));
  const share = total > 0 ? Math.min(1, Math.max(0, left / total)) : 0;
  return (
    <span
      className={cx(styles.root, className)}
      role="timer"
      aria-label={`${seconds} ${seconds === 1 ? 'second' : 'seconds'} left`}
      data-shot="countdown-pie"
      style={{ '--share': share } as CSSProperties}
    >
      <span className={styles.face} aria-hidden="true">
        {seconds}
      </span>
    </span>
  );
}
