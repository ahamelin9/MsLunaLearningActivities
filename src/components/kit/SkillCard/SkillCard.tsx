/**
 * SkillCard: one skill on the library, a bucket of a grade's lessons (CUR-7):
 * its picture, its name and a bar of its lessons done. Tapping it shows its
 * lessons, so the library stays short with 19 of them.
 *
 * Props:  icon (an emoji, until DES-27 draws them) · name · done · total
 *         state: 'done' | 'next' | 'started' | 'waiting', from its lessons'
 *         states (the screen works it out from `lessonStates`, PRG-7)
 *         open: its lessons are the ones showing (aria-expanded)
 *         onClick · data-shot (for the screenshots and checks) · className is
 *         layout only
 * States: done (every lesson done: a check badge) · next (the first skill not
 *         finished, since each skill's lessons open on their own, CUR-11: a
 *         glowing action border and a centred "Up next" tag, as the
 *         LessonCard's) · started (some done, not the first unfinished: plain) ·
 *         waiting (none open yet: dashed on the well; the library has none
 *         since CUR-11, as every skill's Lesson 1 is open) · open (the shelves' soil, its
 *         count in the main ink; the library's tray shares the fill) ·
 *         pressed (:active)
 * Tokens: --skill-bg, --skill-border, --skill-border-width,
 *         --skill-border-style, --skill-edge, --skill-ledge, --skill-motion,
 *         --skill-count
 * Reads:  --card, --well, --soil, --edge, --action, --right,
 *         --right-ink, --ink, --ink-soft, --radius-card, --radius-chip,
 *         --border-regular, --border-thick, --ledge-small, --text-display-l,
 *         --text-label-small, --text-tag, --tracking-tag, --motion-glow,
 *         --space-*; Chip, Icon and ProgressBar
 * Board:  none: the round 2 Library board has no buckets. Alex OKed the look
 *         in CUR-7's mock (screenshots/review/cur7-library-mock.png).
 *
 * It sets position: relative only to hold its badge and tag, which overhang
 * its top edge; it never places itself.
 */

import { cx, dataState } from '@/utils/cx';
import { Chip } from '../Chip/Chip';
import { Icon } from '../Icon/Icon';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import styles from './SkillCard.module.scss';

interface SkillCardProps {
  icon: string;
  name: string;
  done: number;
  total: number;
  state: 'done' | 'next' | 'started' | 'waiting';
  open: boolean;
  onClick?: () => void;
  className?: string;
  'data-shot'?: string;
  /** Only the Kit page passes this: "pressed" holds the press. */
  'data-state'?: string;
}

export function SkillCard({
  icon,
  name,
  done,
  total,
  state,
  open,
  onClick,
  className,
  'data-shot': shot,
  'data-state': held
}: SkillCardProps) {
  const count = `${done} of ${total} lessons done`;
  return (
    <button
      type="button"
      className={cx(styles.root, className)}
      data-state={dataState(state, held)}
      data-shot={shot}
      aria-expanded={open}
      aria-label={`${name}, ${count}${state === 'next' ? ', up next' : ''}`}
      onClick={onClick}
    >
      {state === 'next' && <Chip variant="accent" className={styles.tag}>Up next</Chip>}
      {state === 'done' && (
        <span className={styles.badge} aria-hidden="true">
          <Icon name="check" size={16} />
        </span>
      )}
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.name}>{name}</span>
      <ProgressBar size="rounds" done={done} total={total} label={count} className={styles.bar} />
      <span className={styles.count}>
        {done} of {total}
      </span>
    </button>
  );
}
