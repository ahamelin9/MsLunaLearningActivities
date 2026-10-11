import React, { type ComponentProps } from 'react';
import { cx } from '@/utils/cx';
import styles from './GameSurface.module.scss';

/**
 * The area every game lays itself out in, centred on the stage. `className`
 * is the game's own root class. Feed Luna also passes a `ref` (it measures the
 * surface while a cookie is dragged) and its pointer handlers.
 *
 * A game imports this before its own module, so its root rules come later in
 * the CSS and win where they set the same thing (Feed Luna's `gap`).
 */
export const GameSurface: React.FC<ComponentProps<'div'>> = ({ className, ...props }) => (
  <div className={cx(styles.gameSurface, className)} {...props} />
);
