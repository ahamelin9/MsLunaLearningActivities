/**
 * Chip: a small pill for a tag, a count or a time. TimeChip is its preset for
 * "about N min" and "took N min".
 *
 * Props:  variant: 'time' | 'took' | 'accent' | 'count' (default 'time')
 *         icon?: IconName · children: the words · className is layout only
 *         TimeChip: minutes · took? (default false) · highlight? (the accent
 *         look, for the lesson that's up next)
 * States: none; the variant is its job
 * Tokens: --chip-bg, --chip-ink, --chip-icon, --chip-font, --chip-pad,
 *         --chip-icon-size; sets --icon-fill for a filled icon
 * Reads:  --well, --ink-soft, --right-soft, --right-text, --accent-soft,
 *         --accent-text, --accent, --accent-edge, --ink, --radius-chip,
 *         --text-label-small, --text-label, --space-*
 * Board:  Look (the three time chips), Library (the stars count, "Up next",
 *         the lesson times), Done ("You took 4 minutes")
 */

import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Chip.module.scss';

interface ChipProps {
  variant?: 'time' | 'took' | 'accent' | 'count';
  icon?: IconName;
  className?: string;
  children: ReactNode;
}

export function Chip({ variant = 'time', icon, className, children }: ChipProps) {
  return (
    <span className={cx(styles.root, className)} data-variant={variant}>
      {icon && <Icon name={icon} size={variant === 'count' ? 24 : 20} filled={variant === 'count'} className={styles.icon} />}
      {children}
    </span>
  );
}

/** A lesson's time: "about 5 min" before it, "took 4 min" after. */
export function TimeChip({ minutes, took = false, highlight = false, className }: {
  minutes: number;
  took?: boolean;
  highlight?: boolean;
  className?: string;
}) {
  const n = Math.max(1, Math.round(minutes));
  if (took) return <Chip variant="took" icon="check" className={className}>took {n} min</Chip>;
  return <Chip variant={highlight ? 'accent' : 'time'} icon="clock" className={className}>about {n} min</Chip>;
}
