/**
 * ProgressBar: one bar in segments, one per lesson or round. The count comes
 * from the data (`done`, `total`), never from the design.
 *
 * Props:  done · total · size: 'lessons' | 'rounds' (default 'lessons')
 *         noun? (default 'lessons'): the words after the count, shown on the
 *         lessons size ("1 of 6 lessons done"); the rounds size shows none
 *         label?: what a screen reader hears (default "1 of 6 lessons done",
 *         or "Round 1 of 4 done")
 *         className is layout only (its width)
 * States: the fill grows to done/total with a soft spring (none under reduced
 *         motion, where durations are 0)
 * Tokens: --bar-height, --bar-track, --bar-edge, --bar-fill, --bar-tick
 * Reads:  --well, --edge, --right, --card, --ink, --ink-soft, --radius-chip,
 *         --border-regular, --border-thick, --text-label, --text-label-small,
 *         --dur-enter, --ease-soft-spring, --space-*
 * Board:  the Library's lesson bar ("1 of 6 lessons done"), the Round board's
 *         rounds bar, the Progress board's thin bar on the up-next lesson
 */

import type { CSSProperties } from 'react';
import { cx } from '@/utils/cx';
import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
  done: number;
  total: number;
  size?: 'lessons' | 'rounds';
  noun?: string;
  label?: string;
  className?: string;
}

export function ProgressBar({ done, total, size = 'lessons', noun = 'lessons', label, className }: ProgressBarProps) {
  const n = Math.max(0, Math.min(done, total));
  const said = label ?? (size === 'rounds' ? `Round ${n} of ${total} done` : `${n} of ${total} ${noun} done`);
  return (
    <span className={cx(styles.root, className)} data-size={size}>
      <span
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={n}
        aria-valuetext={said}
        aria-label={said}
      >
        <span className={styles.fill} style={{ '--share': total ? n / total : 0 } as CSSProperties} />
        {Array.from({ length: Math.max(0, total - 1) }, (_, i) => (
          <span key={i} className={styles.tick} style={{ '--at': (i + 1) / total } as CSSProperties} />
        ))}
      </span>
      {size === 'lessons' && (
        <span className={styles.count} aria-hidden="true">
          <strong className={styles.number}>{n} of {total}</strong> {noun} done
        </span>
      )}
    </span>
  );
}
