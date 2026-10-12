/**
 * Squishy: a collectible squishy, and SquishyDots, the colours of one kind
 * found and still to find (PRG-5 builds the shelf from them).
 *
 * Props:  kind: 'ball' | 'cat' | 'bunny' | 'bear' | 'butter' | 'peach' |
 *         'cloud' | 'moon' (drawings.tsx) · colour: 'oat' | 'caramel' |
 *         'toffee' | 'cream' (usual), 'blush' | 'butter' (rare), 'honey'
 *         (super rare) · state: 'found' | 'ghost' | 'mystery' (default 'found')
 *         size: 64 | 96 | 128 (default 96) · label? (default "Bear, toffee",
 *         "Not found yet: Bear", "Not found yet: a mystery squishy")
 *         onClick · className is layout only
 *         SquishyDots: dots: a colour found, 'grey' (a usual colour still to
 *         find) or '?' (a rare one still to find) · label
 * States: found (its colours; a rare or super-rare one wears a twinkling
 *         sparkle) · ghost (a not-found squishy: its shape, greyed) ·
 *         mystery (a harder one: a dashed "?" slot) · squish (a found one,
 *         tapped: the shared squish) · wobble (a ghost or "?", tapped)
 * Tokens: --sq-size, --sq-fill, --sq-edge, --sq-top, --sq-motion
 * Reads:  --illo-squishy-* (its colours, muzzle, cheeks, ears, leaf), --illo-line,
 *         --illo-shadow, --illo-shine, --illo-spark-rare(-deep),
 *         --illo-spark-super(-edge), --edge, --well, --soil, --ink-soft,
 *         --radius-card, --radius-tile, --radius-chip, --border-hair,
 *         --border-regular, --text-display-l, --text-tag, --motion-squish,
 *         --motion-wobble, --motion-twinkle, --space-*
 * Board:  Squishies (the shelf: kinds, ghosts, "?" slots, colour dots), Done
 *         (the new squishy), Library (the Squishy Shelf card)
 *
 * Its colours come only from _illustration.scss (colour.md, Illustrations).
 * The rarity tag is a Chip (variant 'rare' or 'super-rare', with shimmer).
 */

import { useEffect, useRef, useState } from 'react';
import { cx, dataState } from '@/utils/cx';
import { afterMotion } from '@/utils/motion';
import { Icon } from '../Icon/Icon';
import { KINDS, type SquishyKind } from './drawings';
import styles from './Squishy.module.scss';

export type { SquishyKind };
export type SquishyColour = 'oat' | 'caramel' | 'toffee' | 'cream' | 'blush' | 'butter' | 'honey';
type DotColour = SquishyColour | 'cocoa' | 'sage' | 'sky' | 'lilac' | 'grey' | '?';

const RARE = new Set<string>(['blush', 'butter', 'sage', 'sky', 'lilac']);
const SUPER = new Set<string>(['honey']);
const rarityOf = (c: string) => (SUPER.has(c) ? 'super' : RARE.has(c) ? 'rare' : 'usual');

interface SquishyProps {
  kind: SquishyKind;
  colour?: SquishyColour;
  state?: 'found' | 'ghost' | 'mystery';
  size?: 64 | 96 | 128;
  label?: string;
  onClick?: () => void;
  className?: string;
}

export function Squishy({ kind, colour = 'oat', state = 'found', size = 96, label, onClick, className }: SquishyProps) {
  // each tap restarts the squish (or the wobble) on a fresh key
  const [bump, setBump] = useState(0);
  const cancel = useRef<() => void>(undefined);
  useEffect(() => () => cancel.current?.(), []);
  const found = state === 'found';

  const tap = () => {
    cancel.current?.();
    setBump(b => b + 1);
    cancel.current = afterMotion(found ? 'celebrate' : 'emphasis', () => setBump(0));
    onClick?.();
  };

  const { name, art } = KINDS[kind];
  const rarity = rarityOf(colour);
  const said = label ?? (found ? `${name}, ${colour}` : state === 'ghost' ? `Not found yet: ${name}` : 'Not found yet: a mystery squishy');

  return (
    <button
      type="button"
      className={cx(styles.root, className)}
      data-size={size}
      data-colour={found ? colour : undefined}
      data-state={dataState(state, bump > 0 && (found ? 'squish' : 'wobble'))}
      aria-label={said}
      onClick={tap}
    >
      <span key={bump} className={styles.art}>
        {state === 'mystery' ? (
          <span className={styles.slot} aria-hidden="true">?</span>
        ) : (
          <svg className={styles.drawing} viewBox="0 0 100 92" aria-hidden="true">{art}</svg>
        )}
      </span>
      {found && rarity !== 'usual' && (
        <span className={styles.badge} data-variant={rarity} aria-hidden="true">
          <Icon name="sparkle" size={20} filled />
        </span>
      )}
    </button>
  );
}

/** One kind's colours: found (its colour), 'grey' (usual, still to find), '?' (rare, still to find). */
export function SquishyDots({ dots, label, className }: { dots: DotColour[]; label: string; className?: string }) {
  return (
    <span className={cx(styles.dots, className)} role="img" aria-label={label}>
      {dots.map((d, i) => (
        <span key={i} className={styles.dot} data-colour={d === '?' ? 'rare-unknown' : d}>{d === '?' ? '?' : null}</span>
      ))}
    </span>
  );
}
