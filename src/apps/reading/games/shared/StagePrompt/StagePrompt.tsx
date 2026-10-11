import React, { type HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './StagePrompt.module.scss';

/**
 * A game's line of instruction on the stage ("What disappeared?"). Never the
 * target itself: that is heard, not shown. `className` is for the game's own
 * size or placement.
 */
export const StagePrompt: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={cx(styles.stagePrompt, className)} {...props} />
);
