/**
 * Modal: a lifted card over the dimmed screen, with a 48px close button. For
 * grown-up screens (Settings, the Trophy room). No board shows one, so Alex
 * OKs its look on the Kit page.
 *
 * Props:  open · onClose (the close button, a tap on the dim, Escape)
 *         title: the heading, which also names the dialog
 *         closeLabel? (default 'Close') · children
 *         plus any <div> attribute for the card (data-shot); className is the
 *         card's layout only (its width)
 * States: open · closed (renders nothing)
 * Tokens: --modal-dim, --modal-width
 * Reads:  --shade-deep, --z-modal, --target-edge, --space-*, --text-display-m;
 *         PaperCard (lifted) and ChunkyButton (icon) for the rest
 * Board:  none (Settings and the Trophy room move onto it in DES-9b)
 *
 * The one kit root that sets its own position: an overlay covers the screen
 * (position: fixed). It renders where it's used, not in a portal, so it keeps
 * the light or dark of the screen it's on.
 */

import { useEffect, useId, useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '@/utils/cx';
import { ChunkyButton } from '../ChunkyButton/ChunkyButton';
import { PaperCard } from '../PaperCard/PaperCard';
import styles from './Modal.module.scss';

interface ModalProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  closeLabel?: string;
}

export function Modal({ open, onClose, title, closeLabel = 'Close', className, children, ...rest }: ModalProps) {
  const titleId = useId();
  const card = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; });

  // on opening, focus moves into the card and Escape closes; on closing, focus
  // goes back where it was
  useEffect(() => {
    if (!open) return;
    const before = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    card.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close.current(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      before?.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className={styles.root} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <PaperCard
        {...rest}
        ref={card}
        variant="lifted"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(styles.card, className)}
      >
        <div className={styles.head}>
          <h2 id={titleId} className={styles.title}>{title}</h2>
          <ChunkyButton variant="icon" icon="close" aria-label={closeLabel} data-shot="modal-close" onClick={onClose} />
        </div>
        {children}
      </PaperCard>
    </div>
  );
}
