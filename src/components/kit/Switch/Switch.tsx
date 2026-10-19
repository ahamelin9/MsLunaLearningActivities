/**
 * Switch: an on/off setting for grown-ups (Settings: sound effects, Ms.
 * Luna's voice, Less Motion).
 *
 * Props:  on · onChange(next) · label: what it switches, for screen readers
 *         (the row beside it shows the words) · disabled
 *         plus any <button> attribute (data-shot); className is layout only
 * States: off (a well with an edge) · on (the action colour, the knob slid
 *         over) · disabled (faded)
 * Tokens: --switch-track, --switch-edge, --switch-knob, --switch-shift
 * Reads:  --well, --edge, --action, --action-edge, --card, --target-chrome,
 *         --radius-chip, --border-regular, --elevation-card, --dur-quick,
 *         --ease-standard, --space-*
 * Board:  none (Settings has no board, DES-9b); Alex OKs it on the Kit page
 *
 * A button with role="switch", so a tap anywhere on its 48px target flips it.
 */

import type { ButtonHTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './Switch.module.scss';

interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
}

export function Switch({ on, onChange, label, className, type = 'button', ...rest }: SwitchProps) {
  return (
    <button
      {...rest}
      type={type}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={cx(styles.root, className)}
      data-state={on ? 'on' : 'off'}
      onClick={() => onChange(!on)}
    >
      <span className={styles.track}>
        <span className={styles.knob} />
      </span>
    </button>
  );
}
