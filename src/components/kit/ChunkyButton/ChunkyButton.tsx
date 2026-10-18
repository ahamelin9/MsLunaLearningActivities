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
 * Tokens: --button-bg, --button-ink, --button-border, --button-border-style,
 *         --button-edge, --button-ledge, --button-height, --button-pad,
 *         --button-radius, --button-font
 * Reads:  --card, --ink, --ink-soft, --edge, --soil, --action, --action-ink,
 *         --action-edge, --accent, --accent-ink, --accent-edge, --accent-soft,
 *         --ledge-small, --ledge-medium, --press-depth, --target-chrome,
 *         --target-answer, --radius-tile, --radius-chip, --border-regular,
 *         --text-label, --text-read, --dur-tap, --ease-standard, --space-*
 * Board:  the Library and Round headers (Home, the gear), the Done screen's
 *         actions (Play again, Next lesson, the dashed See my shelf); accent:
 *         the Round board's "Hear my clue" and the Library's Luna's Pick;
 *         prompt: the Round board's "What letter makes this sound?" pill
 */

import type { ButtonHTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './ChunkyButton.module.scss';

interface ChunkyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'action' | 'accent' | 'secondary' | 'quiet' | 'icon' | 'prompt';
  size?: 48 | 64;
  icon?: IconName;
  iconAfter?: IconName;
}

export function ChunkyButton({
  variant = 'secondary',
  size = 48,
  icon,
  iconAfter,
  type = 'button',
  className,
  children,
  ...rest
}: ChunkyButtonProps) {
  const edge = icon && !iconAfter ? 'start' : iconAfter && !icon ? 'end' : undefined;
  return (
    <button
      {...rest}
      type={type}
      className={cx(styles.root, className)}
      data-variant={variant}
      data-size={size}
      data-icon={variant === 'icon' ? undefined : edge}
    >
      {icon && <Icon name={icon} />}
      {children}
      {iconAfter && <Icon name={iconAfter} />}
    </button>
  );
}
