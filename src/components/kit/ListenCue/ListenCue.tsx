/**
 * ListenCue: the "?" arch that holds the target's place. The target is heard,
 * never shown: the arch shows the answer only once it's found.
 *
 * Props:  state: 'waiting' | 'found' (default 'waiting')
 *         answer?: shown only when found (pass it any time; it stays hidden)
 *         kind: 'letter' | 'word' (default 'letter'), the answer's size
 *         picture?: shown in place of the "?" while waiting, for a cue
 *         that's a word's picture ("the first letter of 🐱"; DES-22b): what
 *         to listen for, never its letters
 *         onClick: play the sound again · label (default 'Hear it again'),
 *         listenText (default 'tap to listen'), foundText (default 'found it!')
 *         className is layout only
 * States: waiting (dashed action border, ear, "?", a slow pulse) · tapped (a
 *         ripple, for one celebrate beat after each tap) · found (right-soft,
 *         the answer, "found it!", the shared pop, and five sparks bursting
 *         out, as on the Round board: DES-22b; none under reduced motion)
 * Tokens: --cue-bg, --cue-border, --cue-border-style, --cue-ink, --cue-motion,
 *         --cue-width, --cue-height (its arch is the arch() mixin from
 *         its width, DES-26); a spark's --spark and its
 *         way out (--burst-x, --burst-y, --burst-turn)
 * Reads:  --card, --action, --accent-text, --ink-soft, --right, --right-soft,
 *         --right-text, --radius-card, --border-thick, --text-cue,
 *         --text-answer-letter, --text-answer-word, --text-label-small,
 *         --motion-glow, --motion-pop, --motion-burst, --illo-spark-win-1…4,
 *         --dur-celebrate, --dur-tap, --space-*
 * Board:  the Round board's "?" above the letters
 */

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { cx, dataState } from '@/utils/cx';
import { afterMotion } from '@/utils/motion';
import { Icon } from '../Icon/Icon';
import styles from './ListenCue.module.scss';

interface ListenCueProps {
  state?: 'waiting' | 'found';
  answer?: ReactNode;
  kind?: 'letter' | 'word';
  picture?: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  listenText?: string;
  foundText?: string;
  className?: string;
  /** Only the Kit page passes this: "tapped" holds the ripple. */
  'data-state'?: string;
}

export function ListenCue({
  state = 'waiting',
  answer,
  kind = 'letter',
  picture,
  onClick,
  label = 'Hear it again',
  listenText = 'tap to listen',
  foundText = 'found it!',
  className,
  'data-state': held,
}: ListenCueProps) {
  // each tap starts a fresh ripple (a new key), which clears after one beat
  const [ripple, setRipple] = useState(0);
  const cancel = useRef<() => void>(undefined);
  useEffect(() => () => cancel.current?.(), []);

  const tap = (e: MouseEvent<HTMLButtonElement>) => {
    cancel.current?.();
    setRipple(n => n + 1);
    cancel.current = afterMotion('celebrate', () => setRipple(0));
    onClick?.(e);
  };

  const found = state === 'found';
  return (
    <span className={cx(styles.root, className)} data-kind={kind} data-state={dataState(found && 'found', (ripple > 0 || held === 'tapped') && 'tapped')}>
      <button type="button" className={styles.arch} onClick={tap} aria-label={found ? undefined : label}>
        {found ? (
          <>
            <span className={styles.answer}>{answer}</span>
            <span className={styles.small}>{foundText}</span>
          </>
        ) : (
          <>
            <Icon name="ear" size={40} />
            {picture ? (
              <span className={styles.picture} aria-hidden="true">{picture}</span>
            ) : (
              <span className={styles.mark} aria-hidden="true">?</span>
            )}
            <span className={styles.small}>{listenText}</span>
          </>
        )}
      </button>
      {(ripple > 0 || held === 'tapped') && <span key={ripple} className={styles.ripple} aria-hidden="true" />}
      {found && (
        // five sparks fly out as it's found, as on the Round board (DES-22b)
        <span className={styles.burst} data-shot="cue-burst" aria-hidden="true">
          {[1, 2, 3, 4, 5].map(n => (
            <span key={n} className={styles.spark} data-n={n}>
              <Icon name="sparkle" size={24} filled />
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
