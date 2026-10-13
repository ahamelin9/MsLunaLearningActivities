/**
 * SpeechBubble: Luna's line in a card with a tail pointing at her, and an
 * optional "Hear my clue" button. The words are what she says; a clue is
 * spoken, never written, and the line never holds the target.
 *
 * Props:  children: her line · tail: 'left' | 'bottom' | 'none' (default
 *         'left'), towards Luna; 'none' where no owl is beside it (a game
 *         that draws her on its own stage, DES-12)
 *         onLine?: the line becomes a button that says it again (with no
 *         owl beside it, there's no Luna to tap; DES-22a) · lineLabel: what a
 *         screen reader hears for it (default "Hear Ms. Luna again")
 *         onClue?: shows the "Hear my clue" button · clueText (default
 *         'Hear my clue') · className is layout only
 * States: none (it shows what Luna says); the tappable line is at least a
 *         48px target and shows the focus ring
 * Tokens: --bubble-bg, --bubble-edge, --bubble-tail
 * Reads:  --card, --edge, --ink, --elevation-card, --radius-card,
 *         --border-regular, --z-raised, --text-read, --target-chrome,
 *         --space-*; the focus ring; ChunkyButton (accent) for the clue
 * Board:  the Round board's perch ("Hear my clue")
 *
 * The tail is a flex sibling of the card, overlapping its edge by half, so
 * nothing is positioned.
 */

import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import { ChunkyButton } from '../ChunkyButton/ChunkyButton';
import styles from './SpeechBubble.module.scss';

interface SpeechBubbleProps {
  tail?: 'left' | 'bottom' | 'none';
  onLine?: () => void;
  lineLabel?: string;
  onClue?: () => void;
  clueText?: string;
  className?: string;
  children: ReactNode;
}

export function SpeechBubble({
  tail = 'left',
  onLine,
  lineLabel = 'Hear Ms. Luna again',
  onClue,
  clueText = 'Hear my clue',
  className,
  children
}: SpeechBubbleProps) {
  return (
    <div className={cx(styles.root, className)} data-variant={tail}>
      {tail !== 'none' && <span className={styles.tail} aria-hidden="true" />}
      <div className={styles.card}>
        {onLine ? (
          <button type="button" className={cx(styles.line, styles.say)} onClick={onLine} aria-label={lineLabel}>
            {children}
          </button>
        ) : (
          <p className={styles.line}>{children}</p>
        )}
        {onClue && <ChunkyButton variant="accent" icon="ear" onClick={onClue}>{clueText}</ChunkyButton>}
      </div>
    </div>
  );
}
