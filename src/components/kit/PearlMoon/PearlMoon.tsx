/**
 * PearlMoon: the one-of-a-kind squishy a full shelf brings home (PRG-5b), in the
 * glowing niche at the top of the shelf's arch, with a "?" there until then.
 *
 * Props:  found: boolean · label? (default "Pearl Moon", or "Something special"
 *         before she's found) · onClick · className is layout only
 * States: empty (the "?" in her niche) · found (her drawing: pearl body, cream
 *         sheen, gold moon, sleepy eyes) · wobble (the "?", tapped) · squish
 *         (she's tapped). The niche glows, a light sweeps it and three sparkles
 *         twinkle; all hold still under reduced motion.
 * Tokens: --pm-width, --pm-motion
 * Reads:  --illo-squishy-pearl(-edge, -sheen, -cheek, -mark, -glow),
 *         --illo-spark-pearl(-edge), --illo-moon-gold, --illo-moon-edge,
 *         --illo-line, --illo-shadow, --well, --shine, --radius-card,
 *         --border-thick, --text-display-l, --motion-pearl-glow, --motion-shimmer,
 *         --motion-twinkle, --motion-squish, --motion-wobble, --space-*
 * Board:  Squishies (the "?" in the niche). Her drawing: the page Alex OKed,
 *         less its lilac and mist ovals
 *         (.claude/skills/luna-design/pictures/pearl-moon.html)
 */

import { useEffect, useRef, useState } from 'react';
import { cx, dataState } from '@/utils/cx';
import { afterMotion } from '@/utils/motion';
import { Icon } from '../Icon/Icon';
import styles from './PearlMoon.module.scss';

interface PearlMoonProps {
  found: boolean;
  label?: string;
  onClick?: () => void;
  className?: string;
}

export function PearlMoon({ found, label, onClick, className }: PearlMoonProps) {
  const [bump, setBump] = useState(0);
  const cancel = useRef<() => void>(undefined);
  useEffect(() => () => cancel.current?.(), []);

  const tap = () => {
    cancel.current?.();
    setBump(b => b + 1);
    cancel.current = afterMotion(found ? 'celebrate' : 'emphasis', () => setBump(0));
    onClick?.();
  };

  return (
    <button
      type="button"
      className={cx(styles.root, className)}
      data-state={dataState(found ? 'found' : 'empty', bump > 0 && (found ? 'squish' : 'wobble'))}
      aria-label={label ?? (found ? 'Pearl Moon' : 'Something special')}
      onClick={tap}
    >
      <span className={styles.niche}>
        <span key={bump} className={styles.art}>
          {found ? (
            <svg className={styles.drawing} viewBox="0 0 100 92" aria-hidden="true">
              <ellipse className={styles.shadow} cx="50" cy="88" rx="28" ry="4" />
              <circle className={styles.body} cx="50" cy="54" r="34" />
              <ellipse className={styles.sheen} cx="62" cy="38" rx="6" ry="4" />
              <path className={styles.moon} d="M47 26 a7 7 0 1 0 8 8 a5.5 5.5 0 1 1 -8 -8 z" />
              <path className={styles.eyes} d="M38 56 q4 -4 8 0 M54 56 q4 -4 8 0" />
              <path className={styles.mouth} d="M46 63 q4 4 8 0" />
              <ellipse className={styles.cheek} cx="34" cy="63" rx="5" ry="3" />
              <ellipse className={styles.cheek} cx="66" cy="63" rx="5" ry="3" />
            </svg>
          ) : (
            <span className={styles.mark} aria-hidden="true">?</span>
          )}
        </span>
      </span>
      <Icon name="sparkle" size={16} filled className={styles.spark} />
      <Icon name="sparkle" size={20} filled className={styles.spark} />
      <Icon name="sparkle" size={16} filled className={styles.spark} />
    </button>
  );
}
