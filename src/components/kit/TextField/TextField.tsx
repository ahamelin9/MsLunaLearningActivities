/**
 * TextField: a box to type in, for grown-ups (the site's password page,
 * OPS-14). Children never type: their answers are always Choice.
 *
 * Props:  label: the words above the box · note?: a line under it (the
 *         message when it's wrong) · wrong: the try-again look, with the
 *         note read out by screen readers
 *         plus any <input> attribute (type, name, autoComplete, autoFocus);
 *         className is layout only, on the wrapper
 * States: idle (a well with an edge) · focus (the focus ring) · wrong
 *         (the try-again edge and wash, its note in try-again ink)
 * Tokens: --field-bg, --field-edge, --field-ink, --field-note
 * Reads:  --well, --edge, --ink, --ink-soft, --try-again-edge,
 *         --try-again-soft, --try-again-text, --target-chrome, --radius-tile,
 *         --border-regular, --text-label, --text-label-small, --text-read,
 *         --space-*
 * Board:  none (the password page has no board); Alex OKs it on the Kit page
 */

import { useId, type InputHTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './TextField.module.scss';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  note?: string;
  wrong?: boolean;
}

export function TextField({ label, note, wrong = false, className, id, ...rest }: TextFieldProps) {
  const own = useId();
  const inputId = id ?? own;
  const noteId = `${inputId}-note`;
  return (
    <div className={cx(styles.root, className)} data-state={wrong ? 'wrong' : undefined}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input
        {...rest}
        id={inputId}
        className={styles.input}
        aria-invalid={wrong || undefined}
        aria-describedby={note ? noteId : undefined}
      />
      {note && (
        <p id={noteId} className={styles.note} role={wrong ? 'alert' : undefined}>
          {note}
        </p>
      )}
    </div>
  );
}
