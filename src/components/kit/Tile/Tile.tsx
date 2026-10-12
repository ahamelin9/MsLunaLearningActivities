/**
 * Tile: a pressable card with a picture area and a name, for the Play Shelf.
 *
 * Props:  name: the words under the picture · picture: what's drawn above
 *         (the library draws each game's: pages/Hub/ShelfPicture, DES-21)
 *         · tint: 1–5, the picture area's
 *         soft colour (default 1) · plus any <button> attribute (onClick,
 *         data-shot); className is layout only
 * States: idle · pressed (:active, sinks onto its ledge) · picked:
 *         aria-pressed="true" takes the action look, for a pick-one set
 *         (Grade Select; DES-9c)
 * Tokens: --tile-bg, --tile-ink, --tile-edge, --tile-tint, --tile-picture-ink,
 *         --tile-picture
 * Reads:  --card, --ink, --edge, --action, --action-ink, --action-edge,
 *         --picture-1 … --picture-5, --radius-card, --border-regular,
 *         --ledge-small, --press-depth, --text-label, --space-2, --space-3,
 *         --space-4, --space-16
 * Board:  Library, the Play Shelf's eight games; no board for Grade Select
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Tile.module.scss';

interface TileProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  name: string;
  picture: ReactNode;
  tint?: 1 | 2 | 3 | 4 | 5;
}

export function Tile({ name, picture, tint = 1, type = 'button', className, ...rest }: TileProps) {
  return (
    <button {...rest} type={type} className={cx(styles.root, className)} data-tint={tint}>
      <span className={styles.picture} aria-hidden="true">{picture}</span>
      <span className={styles.name} data-shot="tile-title">{name}</span>
    </button>
  );
}
