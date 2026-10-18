/**
 * Flower: a flower in its little mound of soil, as on the round 2 Round
 * board, where a solved round grows a few up the sides of the stage (DES-11).
 * Never a measure of progress: the teacher dropped flowers for that (DES-13).
 *
 * Props:  kind: 'daisy' | 'rose-red' | 'rose-blush' (default 'daisy')
 *         size: 'small' | 'medium' | 'large' (56, 64, 84px wide; default 'medium')
 *         grow: grows in, then sways in the breeze (default false: still)
 *         step: its place when several grow one after another (0, 1, 2…);
 *         each step starts a little later · className is layout only
 * States: still · growing (the shared grow-in, then the shared sway).
 *         Reduced motion: it's simply there, and doesn't sway.
 * Tokens: --flower-size, --flower-motion, --flower-wait
 * Reads:  --illo-daisy-petal(-edge), --illo-daisy-heart(-edge),
 *         --illo-rose-{red,blush}(-deep, -front), --illo-leaf, --illo-stem,
 *         --soil (the mound: the ground it grows from), --motion-grow-in,
 *         --motion-sway, --dur-quick, --dur-tap, --dur-enter, --space-*
 * Board:  Round (the garden that grows when the round is won)
 *
 * Its colours come only from _illustration.scss (colour.md, Illustrations),
 * except the soil, which is the interface's ground. It's a picture, so it's
 * hidden from screen readers; it never takes a tap.
 */

import type { CSSProperties } from 'react';
import { cx } from '@/utils/cx';
import styles from './Flower.module.scss';

export type FlowerKind = 'daisy' | 'rose-red' | 'rose-blush';

interface FlowerProps {
  kind?: FlowerKind;
  size?: 'small' | 'medium' | 'large';
  grow?: boolean;
  step?: number;
  className?: string;
}

// The board's drawings, on a 60 × 70 grid: the soil, the stem and a leaf,
// then the head
const DAISY_PETALS = [0, 60, 120, 180, 240, 300];

function Head({ kind }: { kind: FlowerKind }) {
  if (kind === 'daisy') {
    return (
      <>
        {DAISY_PETALS.map(a => (
          <ellipse key={a} className={styles.daisyPetal} cx="30" cy="12" rx="4.5" ry="8" transform={`rotate(${a} 30 22)`} />
        ))}
        <circle className={styles.daisyHeart} cx="30" cy="22" r="6" />
      </>
    );
  }
  return (
    <>
      <path className={styles.leaf} d="M30 31 C25 30 22 27 21 24 C25 27 27 28 30 28 C33 28 35 27 39 24 C38 27 35 30 30 31 Z" />
      <path className={styles.bloom} d="M19 19 C17 10 23 4 30 4 C37 4 43 10 41 19 C40 26 35 30 30 30 C25 30 20 26 19 19 Z" />
      <path className={styles.swirl} d="M23 14 C24 9 34 8 36 13 C37 18 31 20 29 17 C27 14 31 12 33 14" />
      <path className={styles.front} d="M19 19 C22 26 27 29 30 30 C33 29 38 26 41 19 C37 23 33 24 30 24 C27 24 23 23 19 19 Z" />
    </>
  );
}

export function Flower({ kind = 'daisy', size = 'medium', grow = false, step = 0, className }: FlowerProps) {
  return (
    <span
      className={cx(styles.root, className)}
      data-kind={kind}
      data-size={size}
      data-state={grow ? 'growing' : undefined}
      style={{ '--flower-step': step } as CSSProperties}
      aria-hidden="true"
    >
      <svg className={styles.drawing} viewBox="0 0 60 70">
        <path className={styles.soil} d="M6 66 Q30 50 54 66 Z" />
        <path className={styles.stem} d="M30 60 V28" />
        <path className={styles.leaf} d="M30 52 C22 52 18 46 18 42 C26 42 30 46 30 52 Z" />
        <Head kind={kind} />
      </svg>
    </span>
  );
}
