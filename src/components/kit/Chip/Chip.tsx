/**
 * Chip: a small pill for a tag, a count or a time. TimeChip is its preset for
 * "about N min" and "took N min".
 *
 * Props:  variant: 'time' | 'took' | 'accent' | 'count' | 'rare' | 'super-rare'
 *         (default 'time') · icon?: IconName · children: the words
 *         shimmer?: a light sweep across it (a rarity tag on the done screen)
 *         ground: 'card' | 'well' (default 'card'), what it sits on: a time
 *         chip on a well (a locked lesson) turns card so it still shows
 *         className is layout only
 *         TimeChip: minutes · took? (default false) · highlight? (the accent
 *         look, for the lesson that's up next) · ground
 * States: none; the variant is its job. Shimmer sits on a ::after.
 * Tokens: --chip-bg, --chip-ink, --chip-ring, --chip-icon, --chip-font,
 *         --chip-pad; sets --icon-fill for a filled icon
 * Reads:  --well, --card, --ink-soft, --right-soft, --right-text, --accent-soft,
 *         --accent-text, --accent, --accent-edge, --ink, --rare-soft,
 *         --rare-text, --rare-edge, --super-rare-soft, --super-rare-text,
 *         --super-rare-edge, --illo-spark-rare, --illo-spark-rare-deep,
 *         --illo-spark-super, --illo-spark-super-edge, --shine, --radius-chip,
 *         --border-regular, --text-label-small, --text-label, --motion-shimmer,
 *         --space-*
 * Board:  Look (the three time chips), Library (the stars count, "Up next",
 *         the lesson times), Done ("You took 4 minutes", "Rare colour: blush!")
 *
 * With shimmer it sets position: relative, only to hold the sweep; it never
 * places itself.
 */

import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Chip.module.scss';

type Ground = 'card' | 'well';

interface ChipProps {
  variant?: 'time' | 'took' | 'accent' | 'count' | 'rare' | 'super-rare';
  icon?: IconName;
  shimmer?: boolean;
  ground?: Ground;
  className?: string;
  children: ReactNode;
}

const FILLED = new Set(['count', 'rare', 'super-rare']);

export function Chip({ variant = 'time', icon, shimmer = false, ground = 'card', className, children }: ChipProps) {
  return (
    <span
      className={cx(styles.root, className)}
      data-variant={variant}
      data-ground={ground === 'well' ? 'well' : undefined}
      data-shimmer={shimmer || undefined}
    >
      {icon && <Icon name={icon} size={variant === 'count' ? 24 : 20} filled={FILLED.has(variant)} className={styles.icon} />}
      {children}
    </span>
  );
}

/** A lesson's time: "about 5 min" before it, "took 4 min" after. */
export function TimeChip({ minutes, took = false, highlight = false, ground, className }: {
  minutes: number;
  took?: boolean;
  highlight?: boolean;
  ground?: Ground;
  className?: string;
}) {
  const n = Math.max(1, Math.round(minutes));
  if (took) return <Chip variant="took" icon="check" ground={ground} className={className}>took {n} min</Chip>;
  return <Chip variant={highlight ? 'accent' : 'time'} icon="clock" ground={ground} className={className}>about {n} min</Chip>;
}
