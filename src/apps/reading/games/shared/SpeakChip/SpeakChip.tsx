import React, { type ButtonHTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './SpeakChip.module.scss';

/**
 * The small pill a game puts beside its text: "🔊 Say it again", "Read it to
 * me". Disabled, it waits until the child has tried, because the text is
 * theirs to read first. `className` is for the game's own placement.
 */
export const SpeakChip: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, ...props }) => (
  <button className={cx(styles.speakChip, className)} {...props} />
);
