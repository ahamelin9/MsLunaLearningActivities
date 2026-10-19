/**
 * ChunkyButton: the pressable button with a hard ledge.
 *
 * Props:  variant: 'action' | 'accent' | 'secondary' | 'quiet' | 'icon' |
 *         'prompt' (default 'secondary')
 *         size: 48 | 64 (default 48) · icon?, iconAfter?: IconName
 *         children: the words (none for 'icon', which needs an aria-label)
 *         plus any <button> attribute; className is layout only
 * States: idle · pressed (:active, sinks onto its ledge) · disabled (faded)
 *         · selected: aria-pressed="true" takes the action look, for a
 *         pick-one row (voice speed, grade; DES-9b)
 *         prompt (DES-22b): the Round board's pill a game puts by its text,
 *         a tap says it ("Say it again", "Read it to me"): the soft accent,
 *         round ends, no ledge, the reading type in bold, a speaker icon
 *         from the screen; disabled until the child has tried, where the
 *         text is theirs to read first
 *         hold (SET-1): with onHold, the grown-up gate. It runs onHold only
 *         after a press held for --dur-hold, while a ring of the action
 *         colour fills round the button; a quick tap only shows the note
 *         "Grown-ups: press and hold" under it for a while (the note's
 *         data-state="shown"). holdNote shows the note without a tap (the
 *         Kit page), and --hold-progress (0–1) holds the ring part-filled.
 *         holdNoteAt="start" lines the note up with the button's left edge,
 *         for a button near the screen's left edge (SET-2)
 *         className goes on the wrapper here
 * Tokens: --button-bg, --button-ink, --button-border, --button-border-style,
 *         --button-edge, --button-ledge, --button-height, --button-pad,
 *         --button-radius, --button-font, --hold-progress
 * Reads:  --card, --ink, --ink-soft, --edge, --soil, --action, --action-ink,
 *         --action-edge, --accent, --accent-ink, --accent-edge, --accent-soft,
 *         --ledge-small, --ledge-medium, --press-depth, --target-chrome,
 *         --target-answer, --radius-tile, --radius-chip, --border-regular,
 *         --border-thick, --text-label, --text-label-small, --text-read,
 *         --elevation-card, --z-float, --dur-tap, --dur-hold, --ease-standard,
 *         --space-*
 * Board:  the Library and Round headers (Home, the gear), the Done screen's
 *         actions (Play again, Next lesson, the dashed See my shelf); accent:
 *         the Round board's "Hear my clue" and the Library's Luna's Pick;
 *         prompt: the Round board's "What letter makes this sound?" pill
 */

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties } from 'react';
import { cx } from '@/utils/cx';
import { motionMs } from '@/utils/motion';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './ChunkyButton.module.scss';

interface ChunkyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'action' | 'accent' | 'secondary' | 'quiet' | 'icon' | 'prompt';
  size?: 48 | 64;
  icon?: IconName;
  iconAfter?: IconName;
  /** The grown-up gate (SET-1): runs after a press held for --dur-hold. */
  onHold?: () => void;
  /** Shows the hold note without a tap (the Kit page). */
  holdNote?: boolean;
  /** Where the note lines up: the button's right edge (default) or its left, for a button near the screen's left edge. */
  holdNoteAt?: 'end' | 'start';
}

const HOLD_NOTE = 'Grown-ups: press and hold';

export function ChunkyButton({
  variant = 'secondary',
  size = 48,
  icon,
  iconAfter,
  type = 'button',
  className,
  children,
  onHold,
  holdNote,
  holdNoteAt,
  ...rest
}: ChunkyButtonProps) {
  const edge = icon && !iconAfter ? 'start' : iconAfter && !icon ? 'end' : undefined;
  const props = {
    ...rest,
    type,
    'data-variant': variant,
    'data-size': size,
    'data-icon': variant === 'icon' ? undefined : edge,
    children: (
      <>
        {icon && <Icon name={icon} />}
        {children}
        {iconAfter && <Icon name={iconAfter} />}
      </>
    ),
  };
  if (onHold) return <HoldButton {...props} className={className} onHold={onHold} holdNote={holdNote} holdNoteAt={holdNoteAt} />;
  return <button {...props} className={cx(styles.root, className)} />;
}

/**
 * The hold mode: a press held for --dur-hold runs onHold, with the ring
 * filling meanwhile; letting go sooner shows the note for two hold lengths.
 * The wait keeps its length under reduced motion, and the ring still fills
 * (it's drawn from --hold-progress, not animated).
 */
function HoldButton({
  className,
  onHold,
  holdNote,
  holdNoteAt,
  style,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { onHold: () => void; holdNote?: boolean; holdNoteAt?: 'end' | 'start' }) {
  const [progress, setProgress] = useState(0);
  const [noted, setNoted] = useState(false);
  const holding = useRef(false);
  const timers = useRef({ done: 0, frame: 0, note: 0 });

  const stop = () => {
    window.clearTimeout(timers.current.done);
    window.cancelAnimationFrame(timers.current.frame);
    holding.current = false;
    setProgress(0);
  };
  useEffect(() => () => {
    stop();
    window.clearTimeout(timers.current.note);
  }, []);

  const start = (button: HTMLButtonElement) => {
    if (holding.current) return;
    holding.current = true;
    const ms = motionMs('hold', button);
    const began = performance.now();
    const fill = () => {
      setProgress(Math.min(1, (performance.now() - began) / ms));
      timers.current.frame = window.requestAnimationFrame(fill);
    };
    timers.current.frame = window.requestAnimationFrame(fill);
    timers.current.done = window.setTimeout(() => {
      stop();
      setNoted(false);
      onHold();
    }, ms);
  };
  // let go before the hold was done: no opening, just the note
  const release = (button: HTMLButtonElement) => {
    if (!holding.current) return;
    stop();
    setNoted(true);
    window.clearTimeout(timers.current.note);
    timers.current.note = window.setTimeout(() => setNoted(false), 2 * motionMs('hold', button));
  };

  const shown = noted || holdNote;
  return (
    <span className={cx(styles.hold, className)} data-note={holdNoteAt === 'start' ? 'start' : undefined}>
      <button
        {...rest}
        className={styles.root}
        data-hold=""
        style={{ ...style, ...(progress > 0 && { '--hold-progress': progress }) } as CSSProperties}
        onPointerDown={e => e.button === 0 && start(e.currentTarget)}
        onPointerUp={e => release(e.currentTarget)}
        onPointerLeave={e => release(e.currentTarget)}
        onPointerCancel={e => release(e.currentTarget)}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) start(e.currentTarget);
          if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
        }}
        onKeyUp={e => (e.key === 'Enter' || e.key === ' ') && release(e.currentTarget)}
        onContextMenu={e => e.preventDefault()}
      />
      <span className={styles.note} role="status" data-state={shown ? 'shown' : undefined}>
        {shown ? HOLD_NOTE : ''}
      </span>
    </span>
  );
}
