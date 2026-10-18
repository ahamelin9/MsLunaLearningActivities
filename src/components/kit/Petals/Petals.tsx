/**
 * Petals: petals drifting down over a won round and over the done screen,
 * instead of confetti (DES-11), as on the round 2 Round and Done boards.
 *
 * Props:  delayed: they start once a screen has arrived (1.2s), as on the Done
 *         board (default false: at once) · count (default 30)
 *         className is layout only
 * States: falling (each petal falls once, a little apart, and ends below the
 *         bottom edge) · delayed. Reduced motion: no petals at all.
 * Tokens: --petal-colour, --petal-edge, --petal-size
 * Reads:  --illo-petal-* (seven colours and the edge), --motion-petal-fall,
 *         --dur-petals, --dur-celebrate, --dur-enter, --z-celebrate,
 *         --border-hair, --space-*
 * Board:  Round (a won round), Done (the done screen)
 *
 * It fills its nearest positioned parent and sits over it on --z-celebrate:
 * petals cover a whole screen, so like the Modal it places itself. It never
 * takes a tap, and screen readers skip it. Mount it again (a new `key`) to
 * drop them again.
 */

import type { CSSProperties } from 'react';
import { cx, dataState } from '@/utils/cx';
import styles from './Petals.module.scss';

// the board's seven, in its order: every seventh petal is the same colour
const COLOURS = ['cream', 'blush', 'red', 'latte', 'ivory', 'pink', 'caramel'] as const;

interface PetalsProps {
  delayed?: boolean;
  count?: number;
  className?: string;
}

export function Petals({ delayed = false, count = 30, className }: PetalsProps) {
  return (
    <span className={cx(styles.root, className)} data-state={dataState(delayed && 'delayed')} data-shot="petals" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={styles.petal}
          data-colour={COLOURS[i % COLOURS.length]}
          // every other one drifts the mirror way
          data-turn={i % 2 ? 'b' : 'a'}
          // the board's even spread: where each starts across, how long it
          // waits (a share of --dur-celebrate), how fast it falls (a share
          // of --dur-petals) and its size step
          style={
            {
              '--petal-x': `${(i * 37 + 11) % 100}%`,
              '--petal-wait': ((i * 61) % 700) / 700,
              '--petal-pace': (1800 + ((i * 83) % 800)) / 2200,
              '--petal-step': i % 4
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
