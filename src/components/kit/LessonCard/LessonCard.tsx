/**
 * LessonCard: one lesson on the library's path, in order: done, up next or
 * locked (PRG-7, DES-13).
 *
 * Props:  number · title · state: 'done' | 'next' | 'locked'
 *         minutes: "took N min" when done, "about N min" otherwise (PRG-6)
 *         rounds?: { done, total }: up next, once started, shows a thin rounds
 *         bar (from the data)
 *         onClick: a done or up-next card opens the lesson; a locked one
 *         wobbles first, and the screen has Luna say to finish the open one
 *         className is layout only
 * States: done (a check badge, "took N min") · next (a glowing action border,
 *         an "Up next" tag that stays centred under reduced motion, "about N
 *         min", the rounds bar once started) · locked (dashed on the well, a
 *         lock badge, "about N min", a wobble on tap) · pressed (:active, done
 *         and next only)
 * Tokens: --lesson-bg, --lesson-border, --lesson-border-width,
 *         --lesson-border-style, --lesson-edge, --lesson-ledge, --lesson-number,
 *         --lesson-title, --lesson-motion
 * Reads:  --card, --well, --edge, --action, --right, --right-ink, --right-text,
 *         --accent-text, --ink, --ink-soft, --radius-card, --radius-chip,
 *         --border-regular, --border-thick, --ledge-small, --press-depth,
 *         --text-tag, --tracking-tag, --text-label-small, --motion-glow,
 *         --motion-wobble, --space-*; Chip, TimeChip, Icon and ProgressBar
 * Board:  Library (Lesson 1 done, Lesson 2 up next, 3–6 locked), Progress
 *         ("One bar": the thin rounds bar)
 *
 * It sets position: relative only to hold its badge and tag, which overhang
 * its top edge; it never places itself.
 */

import { useEffect, useRef, useState } from 'react';
import { cx, dataState } from '@/utils/cx';
import { afterMotion } from '@/utils/motion';
import { Chip, TimeChip } from '../Chip/Chip';
import { Icon } from '../Icon/Icon';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import styles from './LessonCard.module.scss';

interface LessonCardProps {
  number: number;
  title: string;
  state: 'done' | 'next' | 'locked';
  minutes: number;
  rounds?: { done: number; total: number };
  onClick?: () => void;
  className?: string;
  /** Only the Kit page passes this: "pressed" holds the press. */
  'data-state'?: string;
}

export function LessonCard({ number, title, state, minutes, rounds, onClick, className, 'data-state': held }: LessonCardProps) {
  const [wobbling, setWobbling] = useState(false);
  const cancel = useRef<() => void>(undefined);
  useEffect(() => () => cancel.current?.(), []);

  const tap = () => {
    if (state === 'locked' && !wobbling) {
      setWobbling(true);
      cancel.current = afterMotion('emphasis', () => setWobbling(false));
    }
    onClick?.();
  };

  const n = Math.max(1, Math.round(minutes));
  const said = `Lesson ${number}, ${title}, ${
    state === 'done' ? `done, took ${n} minutes` : state === 'next' ? `up next, about ${n} minutes` : 'locked'
  }`;
  const started = state === 'next' && rounds && rounds.done > 0;

  return (
    <button
      type="button"
      className={cx(styles.root, className)}
      data-state={dataState(state, wobbling && 'wobbling', held)}
      aria-label={said}
      onClick={tap}
    >
      {state === 'next' && <Chip variant="accent" className={styles.tag}>Up next</Chip>}
      {state !== 'next' && (
        <span className={styles.badge} data-variant={state} aria-hidden="true">
          <Icon name={state === 'done' ? 'check' : 'lock'} size={16} />
        </span>
      )}
      <span className={styles.number}>Lesson {number}</span>
      <span className={styles.title}>{title}</span>
      {started && <ProgressBar size="rounds" done={rounds.done} total={rounds.total} className={styles.rounds} />}
      <TimeChip
        minutes={minutes}
        took={state === 'done'}
        highlight={state === 'next'}
        ground={state === 'locked' ? 'well' : 'card'}
        className={styles.time}
      />
    </button>
  );
}
