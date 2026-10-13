/**
 * PaperCard: the card surface, at one of the three heights, or the done
 * screen's dashed panel for a new reward.
 *
 * Props:  variant: 'flat' | 'card' | 'lifted' | 'reward' (default 'card')
 *         children · ref · plus any <div> attribute (role, aria-*, data-shot);
 *         className is layout only
 * States: none; it's a surface (pressable things are ChunkyButton, Tile, Choice)
 * Tokens: --paper-bg, --paper-edge, --paper-border, --paper-elevation,
 *         --paper-radius, --paper-pad
 * Reads:  --card, --edge, --accent, --ink, --elevation-flat, --elevation-card,
 *         --elevation-lifted, --radius-card, --radius-stage, --border-regular,
 *         --border-thick, --space-5, --space-6
 * Board:  flat: wells and tracks · reward: the Done screen's dashed squishy
 *         panel (today's sticker until PRG-5; DES-22d) · card: the Library's
 *         Today and Squishy Shelf panels · lifted: the Done panel, and modals
 */

import type { ComponentPropsWithRef } from 'react';
import { cx } from '@/utils/cx';
import styles from './PaperCard.module.scss';

interface PaperCardProps extends ComponentPropsWithRef<'div'> {
  variant?: 'flat' | 'card' | 'lifted' | 'reward';
}

export function PaperCard({ variant = 'card', className, children, ...rest }: PaperCardProps) {
  return (
    <div {...rest} className={cx(styles.root, className)} data-variant={variant}>
      {children}
    </div>
  );
}
