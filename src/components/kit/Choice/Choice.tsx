/**
 * Choice: the one answer button, for a letter, a word or a picture. Every
 * answer in every game and lesson is a Choice, so right and wrong look the
 * same everywhere (components.md, "One answer language").
 *
 * Props:  kind: 'letter' | 'word' | 'picture' (default 'letter')
 *         state: 'idle' | 'wrong' | 'right' | 'revealed' | 'faded' (default 'idle')
 *         children: the letter, word or picture · caption?: words under a
 *         picture, which the screen passes only once the round is solved
 *         (heard, never shown) · aria-label: needed for a picture
 *         plus any <button> attribute (onClick); className is layout only.
 *         The gap between Choices is the screen's: --target-gap or more.
 * States: idle · pressed (:active) · wrong (try-again tint and edge, the shared
 *         wobble) · right (right fill, the shared pop, the glow ring) ·
 *         revealed (FB-2: a dashed accent ring on a soft accent fill; still
 *         tappable) · faded (the others once solved; can't be tapped) ·
 *         disabled looks like faded.
 *         It's controlled: the screen sets `wrong` and clears it when the
 *         wobble ends, with afterMotion('emphasis', …) from utils/motion.
 * Tokens: --choice-bg, --choice-ink, --choice-border, --choice-border-style,
 *         --choice-edge, --choice-size, --choice-font,
 *         --choice-motion
 * Reads:  --card, --ink, --edge, --try-again-soft, --try-again-edge, --right,
 *         --right-ink, --right-edge, --glow-ring, --accent-soft, --accent-edge,
 *         --ledge-large, --press-depth, --border-thick, --radius-card,
 *         --text-answer-letter, --text-answer-word, --text-label,
 *         --target-answer, --motion-wobble, --motion-pop, --space-*
 * Board:  the Round board's four letters (idle, wrong, right, faded)
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx, dataState } from '@/utils/cx';
import styles from './Choice.module.scss';

export type ChoiceState = 'idle' | 'wrong' | 'right' | 'revealed' | 'faded';

interface ChoiceProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: 'letter' | 'word' | 'picture';
  state?: ChoiceState;
  caption?: ReactNode;
  /** Only the Kit page passes this: "pressed" holds the press. */
  'data-state'?: string;
}

export function Choice({
  kind = 'letter',
  state = 'idle',
  caption,
  type = 'button',
  disabled,
  className,
  children,
  'data-state': held,
  ...rest
}: ChoiceProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cx(styles.root, className)}
      data-kind={kind}
      data-state={dataState(state !== 'idle' && state, held)}
      disabled={disabled || state === 'faded'}
    >
      <span className={styles.face}>{children}</span>
      {caption && <span className={styles.caption}>{caption}</span>}
    </button>
  );
}
