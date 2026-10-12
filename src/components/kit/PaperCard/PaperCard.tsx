/**
 * PaperCard: the card surface, at one of the three heights.
 *
 * Props:  variant: 'flat' | 'card' | 'lifted' (default 'card')
 *         children · ref · plus any <div> attribute (role, aria-*, data-shot);
 *         className is layout only
 * States: none; it's a surface (pressable things are ChunkyButton, Tile, Choice)
 * Tokens: --paper-bg, --paper-edge, --paper-elevation, --paper-radius, --paper-pad
 * Reads:  --card, --edge, --ink, --elevation-flat, --elevation-card,
 *         --elevation-lifted, --radius-card, --radius-stage, --border-regular,
 *         --space-5, --space-6
 * Board:  flat: the Done screen's dashed squishy panel · card: the Library's
 *         Today and Squishy Shelf panels · lifted: the Done panel, and modals
 */

import type { ComponentPropsWithRef } from 'react';
import { cx } from '@/utils/cx';
import styles from './PaperCard.module.scss';

interface PaperCardProps extends ComponentPropsWithRef<'div'> {
  variant?: 'flat' | 'card' | 'lifted';
}

export function PaperCard({ variant = 'card', className, children, ...rest }: PaperCardProps) {
  return (
    <div {...rest} className={cx(styles.root, className)} data-variant={variant}>
      {children}
    </div>
  );
}
