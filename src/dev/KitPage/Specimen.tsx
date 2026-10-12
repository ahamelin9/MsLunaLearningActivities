// How a kit component's `.kit.tsx` lays out its states on the Kit page (DES-7a),
// so every component reads the same way: a row per group, each state with a
// caption under it.
//
//   <Specimens title="Variants">
//     <Specimen label="action"><ChunkyButton variant="action">Play</ChunkyButton></Specimen>
//   </Specimens>
//
// `on` sets a row on a card or a well, for pieces that sit on one on the
// boards (a chip's --well matches the light ground; a locked lesson is a well). `wide` lets a state take a row's
// spare width; `frame` gives it a box of its own that a fixed overlay (the
// Modal) fills instead of the whole page.

import type { ReactNode } from 'react';
import styles from './Specimen.module.scss';

export function Specimens({ title, on, children }: { title?: string; on?: 'card' | 'well'; children: ReactNode }) {
  return (
    <section className={styles.group}>
      {title && <h4 className={styles.title}>{title}</h4>}
      <div className={styles.row} data-variant={on}>{children}</div>
    </section>
  );
}

export function Specimen({ label, frame = false, wide = false, children }: {
  label: string;
  frame?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <figure className={styles.specimen} data-variant={frame ? 'frame' : wide ? 'wide' : undefined}>
      <div className={styles.sample}>{children}</div>
      <figcaption className={styles.label}>{label}</figcaption>
    </figure>
  );
}
