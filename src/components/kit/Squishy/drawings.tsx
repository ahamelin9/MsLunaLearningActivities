// The Squishy's eight kinds (DES-7c), from the round 2 Squishies board, on a
// 100 × 92 grid. No colours here: each part has a class (Squishy.module.scss)
// that reads the squishy's colour or a fixed `--illo-squishy-*` one.

import type { ReactNode } from 'react';
import styles from './Squishy.module.scss';

const face = (left: [number, number], right: [number, number], mouth: string, r = 3) => (
  <>
    <circle className={styles.eye} cx={left[0]} cy={left[1]} r={r} />
    <circle className={styles.eye} cx={right[0]} cy={right[1]} r={r} />
    <path className={styles.mouth} d={mouth} />
  </>
);

const shadow = (rx: number) => <ellipse className={styles.shadow} cx="50" cy="88" rx={rx} ry="4" />;

const MOON = 'M40 60.2 A72 72 0 1 0 160 60.2 A60 60 0 1 1 40 60.2 Z';

export const KINDS = {
  ball: {
    name: 'Squish Ball',
    art: <>
      {shadow(28)}
      <circle className={styles.body} cx="50" cy="52" r="34" />
      <ellipse className={styles.shine} cx="38" cy="36" rx="9" ry="5.5" />
      {face([41, 56], [59, 56], 'M46 62 q4 4 8 0')}
    </>,
  },
  cat: {
    name: 'Mochi Cat',
    art: <>
      {shadow(30)}
      <path className={styles.body} d="M24 44 L28 22 L44 34 Z M76 44 L72 22 L56 34 Z" />
      <ellipse className={styles.body} cx="50" cy="60" rx="38" ry="26" />
      {face([40, 58], [60, 58], 'M45 64 q2.5 3 5 0 q2.5 3 5 0')}
      <path className={styles.whisker} d="M22 60 h10 M22 66 l10 -2 M78 60 h-10 M78 66 l-10 -2" />
    </>,
  },
  bunny: {
    name: 'Bunny',
    art: <>
      {shadow(30)}
      <ellipse className={styles.body} cx="38" cy="28" rx="8" ry="20" />
      <ellipse className={styles.body} cx="62" cy="28" rx="8" ry="20" />
      <ellipse className={styles.innerEar} cx="38" cy="30" rx="3.5" ry="12" />
      <ellipse className={styles.innerEar} cx="62" cy="30" rx="3.5" ry="12" />
      <ellipse className={styles.body} cx="50" cy="62" rx="36" ry="24" />
      {face([41, 60], [59, 60], 'M46 66 q4 4 8 0')}
      <ellipse className={styles.cheek} cx="33" cy="67" rx="5" ry="3" />
      <ellipse className={styles.cheek} cx="67" cy="67" rx="5" ry="3" />
    </>,
  },
  bear: {
    name: 'Bear',
    art: <>
      {shadow(28)}
      <circle className={styles.body} cx="26" cy="30" r="11" />
      <circle className={styles.body} cx="74" cy="30" r="11" />
      <circle className={styles.body} cx="50" cy="54" r="32" />
      <ellipse className={styles.muzzle} cx="50" cy="65" rx="13" ry="9" />
      <ellipse className={styles.eye} cx="50" cy="61" rx="4" ry="3" />
      {face([39, 50], [61, 50], 'M47 67 q3 3 6 0')}
    </>,
  },
  butter: {
    name: 'Butter Block',
    art: <>
      {shadow(32)}
      <rect className={styles.body} x="16" y="38" width="68" height="46" rx="16" />
      <rect className={styles.top} x="30" y="28" width="40" height="18" rx="8" />
      {face([40, 62], [60, 62], 'M46 68 q4 4 8 0')}
    </>,
  },
  peach: {
    name: 'Peach',
    art: <>
      {shadow(28)}
      <circle className={styles.body} cx="50" cy="54" r="32" />
      <path className={styles.crease} d="M50 24 q-10 30 0 62" />
      <path className={styles.leaf} d="M52 24 q8 -14 22 -12 q-6 14 -22 12 z" />
      {face([40, 58], [60, 58], 'M46 64 q4 4 8 0')}
    </>,
  },
  cloud: {
    name: 'Cloud',
    art: <>
      {shadow(34)}
      <path className={styles.body} d="M24 82 C8 82 6 60 20 56 C18 38 40 30 50 42 C56 26 82 28 82 48 C96 50 96 82 78 82 Z" />
      {face([42, 64], [60, 64], 'M47 70 q4 4 8 0')}
    </>,
  },
  moon: {
    name: 'Little Moon',
    art: <>
      {shadow(26)}
      <path className={`${styles.body} ${styles.halfScale}`} d={MOON} transform="scale(0.5) rotate(-18 100 110)" />
      {face([47, 72], [62, 67], 'M52 77 q4 2.5 8 -1.5', 2.6)}
    </>,
  },
} satisfies Record<string, { name: string; art: ReactNode }>;

export type SquishyKind = keyof typeof KINDS;
