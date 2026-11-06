// The Squishy's 18 kinds (DES-7c, PRG-5b), from the round 2 Squishies board and
// the sample sheet Alex OKed (.claude/skills/luna-design/pictures/squishies-sample.html),
// on a 100 × 92 grid. No colours here: each part has a class (Squishy.module.scss)
// that reads the squishy's colour or a fixed `--illo-squishy-*` one.
//
// A kind is drawn in layers: `under` (behind it), `parts` (the shapes that take
// its colour), a super-rare look over those, then `over` (its face and extras).
// `parts` takes a class, as it's drawn more than once: filled, as the look's
// clip, and as the outline over the look. A ghost is only `parts` and `ghostExtra`.

import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import type { SquishyKind } from './looks';
import styles from './Squishy.module.scss';

const face = (left: [number, number], right: [number, number], mouth: string, r = 3) => (
  <>
    <circle className={styles.eye} cx={left[0]} cy={left[1]} r={r} />
    <circle className={styles.eye} cx={right[0]} cy={right[1]} r={r} />
    <path className={styles.mouth} d={mouth} />
  </>
);

const cheeks = (a: number, b: number, y: number, rx = 5, ry = 3) => (
  <>
    <ellipse className={styles.cheek} cx={a} cy={y} rx={rx} ry={ry} />
    <ellipse className={styles.cheek} cx={b} cy={y} rx={rx} ry={ry} />
  </>
);

const MOON = 'M40 60.2 A72 72 0 1 0 160 60.2 A60 60 0 1 1 40 60.2 Z';
const HEART = 'M50 86 C20 66 12 48 22 36 C32 24 46 28 50 40 C54 28 68 24 78 36 C88 48 80 66 50 86 Z';

/** A star with its tips and dips rounded, as soft as the others. */
function softStar(cx0: number, cy0: number, outer: number, inner: number): string {
  const at = (i: number): [number, number] => {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const d = i % 2 ? inner : outer;
    return [cx0 + d * Math.cos(angle), cy0 + d * Math.sin(angle)];
  };
  const mid = (i: number) => {
    const [a, b] = [at(i), at((i + 1) % 10)];
    return `${((a[0] + b[0]) / 2).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)}`;
  };
  let d = `M${mid(9)}`;
  for (let i = 0; i < 10; i++) d += ` Q${at(i)[0].toFixed(1)} ${at(i)[1].toFixed(1)} ${mid(i)}`;
  return `${d} Z`;
}

/** The donut's glaze: a scalloped ring round the hole. */
function glaze(): string {
  const n = 14;
  const point = (r: number, turn: number) => `${(50 + r * Math.cos(turn * 2 * Math.PI)).toFixed(1)} ${(56 + r * Math.sin(turn * 2 * Math.PI)).toFixed(1)}`;
  let d = `M${point(24.5, 0)}`;
  for (let i = 0; i < n; i++) d += ` Q${point(32, (i + 0.5) / n)} ${point(24.5, (i + 1) / n)}`;
  return `${d} Z M39 56 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0 Z`;
}

interface KindDrawing {
  name: string;
  /** how wide its shadow is */
  shadow: number;
  /** the shapes that take its colour */
  parts: (className?: string) => ReactNode;
  /** behind them: a mushroom's stem, a penguin's feet */
  under?: ReactNode;
  /** over them: its face and extras */
  over: ReactNode;
  /** what its greyed shape keeps of `under` */
  ghostExtra?: ReactNode;
}

export const KINDS: Record<SquishyKind, KindDrawing> = {
  ball: {
    name: 'Squish Ball',
    shadow: 28,
    parts: c => <circle className={c} cx="50" cy="52" r="34" />,
    over: <>
      <ellipse className={styles.shine} cx="38" cy="36" rx="9" ry="5.5" />
      {face([41, 56], [59, 56], 'M46 62 q4 4 8 0')}
    </>,
  },
  cat: {
    name: 'Mochi Cat',
    shadow: 30,
    parts: c => <>
      <path className={c} d="M24 44 L28 22 L44 34 Z M76 44 L72 22 L56 34 Z" />
      <ellipse className={c} cx="50" cy="60" rx="38" ry="26" />
    </>,
    over: <>
      {face([40, 58], [60, 58], 'M45 64 q2.5 3 5 0 q2.5 3 5 0')}
      <path className={styles.whisker} d="M22 60 h10 M22 66 l10 -2 M78 60 h-10 M78 66 l-10 -2" />
    </>,
  },
  bunny: {
    name: 'Bunny',
    shadow: 30,
    parts: c => <>
      <ellipse className={c} cx="38" cy="28" rx="8" ry="20" />
      <ellipse className={c} cx="62" cy="28" rx="8" ry="20" />
      <ellipse className={c} cx="50" cy="62" rx="36" ry="24" />
    </>,
    over: <>
      <ellipse className={styles.innerEar} cx="38" cy="30" rx="3.5" ry="12" />
      <ellipse className={styles.innerEar} cx="62" cy="30" rx="3.5" ry="12" />
      {face([41, 60], [59, 60], 'M46 66 q4 4 8 0')}
      {cheeks(33, 67, 67)}
    </>,
  },
  bear: {
    name: 'Bear',
    shadow: 28,
    parts: c => <>
      <circle className={c} cx="26" cy="30" r="11" />
      <circle className={c} cx="74" cy="30" r="11" />
      <circle className={c} cx="50" cy="54" r="32" />
    </>,
    over: <>
      <ellipse className={styles.muzzle} cx="50" cy="65" rx="13" ry="9" />
      <ellipse className={styles.eye} cx="50" cy="61" rx="4" ry="3" />
      {face([39, 50], [61, 50], 'M47 67 q3 3 6 0')}
    </>,
  },
  butter: {
    name: 'Butter Block',
    shadow: 32,
    parts: c => <rect className={c} x="16" y="38" width="68" height="46" rx="16" />,
    over: <>
      <rect className={styles.top} x="30" y="28" width="40" height="18" rx="8" />
      {face([40, 62], [60, 62], 'M46 68 q4 4 8 0')}
    </>,
  },
  peach: {
    name: 'Peach',
    shadow: 28,
    parts: c => <circle className={c} cx="50" cy="54" r="32" />,
    over: <>
      <path className={styles.crease} d="M50 24 q-10 30 0 62" />
      <path className={styles.leaf} d="M52 24 q8 -14 22 -12 q-6 14 -22 12 z" />
      {face([40, 58], [60, 58], 'M46 64 q4 4 8 0')}
    </>,
  },
  cloud: {
    name: 'Cloud',
    shadow: 34,
    parts: c => <path className={c} d="M24 82 C8 82 6 60 20 56 C18 38 40 30 50 42 C56 26 82 28 82 48 C96 50 96 82 78 82 Z" />,
    over: face([42, 64], [60, 64], 'M47 70 q4 4 8 0'),
  },
  moon: {
    name: 'Little Moon',
    shadow: 26,
    parts: c => <path className={cx(c, styles.halfScale)} d={MOON} transform="scale(0.5) rotate(-18 100 110)" />,
    over: face([47, 72], [62, 67], 'M52 77 q4 2.5 8 -1.5', 2.6),
  },
  frog: {
    name: 'Frog',
    shadow: 32,
    parts: c => <>
      <circle className={c} cx="32" cy="40" r="12" />
      <circle className={c} cx="68" cy="40" r="12" />
      <ellipse className={c} cx="50" cy="64" rx="36" ry="24" />
    </>,
    over: <>
      {face([32, 39], [68, 39], 'M37 66 q13 10 26 0', 3.6)}
      {cheeks(25, 75, 70)}
    </>,
  },
  donut: {
    name: 'Donut',
    shadow: 30,
    parts: c => <path className={c} fillRule="evenodd" clipRule="evenodd" d="M16 56 a34 34 0 1 0 68 0 a34 34 0 1 0 -68 0 Z M39 56 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0 Z" />,
    over: <>
      <path className={styles.glaze} fillRule="evenodd" d={glaze()} />
      {face([31, 56], [69, 56], 'M46 74 q4 3.5 8 0', 2.8)}
    </>,
  },
  mushroom: {
    name: 'Mushroom',
    shadow: 24,
    under: <rect className={styles.stem} x="33" y="50" width="34" height="34" rx="11" />,
    ghostExtra: <rect className={styles.ghostPart} x="36" y="50" width="28" height="34" rx="10" />,
    parts: c => <path className={c} d="M14 56 Q14 18 50 18 Q86 18 86 56 Q50 63 14 56 Z" />,
    over: <>
      <circle className={styles.spot} cx="32" cy="38" r="5" />
      <circle className={styles.spot} cx="56" cy="30" r="4.5" />
      <circle className={styles.spot} cx="71" cy="43" r="3.5" />
      {face([43, 68], [57, 68], 'M46 74 q4 3.5 8 0', 2.8)}
    </>,
  },
  dumpling: {
    name: 'Dumpling',
    shadow: 36,
    parts: c => <path className={c} d="M12 80 Q12 38 50 32 Q88 38 88 80 Q50 90 12 80 Z" />,
    over: <>
      <path className={styles.pleat} d="M50 33 q-9 5 -15 13 M50 33 q-3 6 -5 14 M50 33 q3 6 5 14 M50 33 q9 5 15 13" />
      {face([40, 64], [60, 64], 'M46 70 q4 4 8 0')}
      {cheeks(30, 70, 71)}
    </>,
  },
  hamster: {
    name: 'Hamster',
    shadow: 32,
    parts: c => <>
      <circle className={c} cx="28" cy="38" r="9" />
      <circle className={c} cx="72" cy="38" r="9" />
      <ellipse className={c} cx="50" cy="62" rx="38" ry="26" />
    </>,
    over: <>
      <circle className={styles.earInside} cx="28" cy="39" r="4.5" />
      <circle className={styles.earInside} cx="72" cy="39" r="4.5" />
      <ellipse className={styles.spot} cx="50" cy="73" rx="13" ry="8.5" />
      <ellipse className={styles.eye} cx="50" cy="67" rx="3" ry="2.2" />
      {face([38, 58], [62, 58], 'M47 72 q3 3 6 0')}
      {cheeks(23, 77, 68, 7, 5)}
    </>,
  },
  heart: {
    name: 'Heart',
    shadow: 20,
    parts: c => <path className={c} d={HEART} />,
    over: <>
      {face([40, 50], [60, 50], 'M46 56 q4 4 8 0')}
      {cheeks(31, 69, 58)}
    </>,
  },
  toast: {
    name: 'Toast',
    shadow: 32,
    parts: c => <path className={c} d="M24 84 Q16 84 16 76 L16 46 C6 40 8 18 30 18 L70 18 C92 18 94 40 84 46 L84 76 Q84 84 76 84 Z" />,
    over: <>
      <path className={styles.crumb} d="M28 77 Q23 77 23 72 L23 42 C15 38 17 25 31 25 L69 25 C83 25 85 38 77 42 L77 72 Q77 77 72 77 Z" />
      {face([40, 52], [60, 52], 'M46 58 q4 4 8 0')}
      {cheeks(32, 68, 60)}
    </>,
  },
  acorn: {
    name: 'Acorn',
    shadow: 22,
    parts: c => <path className={c} d="M24 44 C24 66 36 80 50 86 C64 80 76 66 76 44 Z" />,
    over: <>
      <path className={styles.capStem} d="M50 18 q-1 -8 5 -11" />
      <path className={styles.cap} d="M16 44 C16 26 32 18 50 18 C68 18 84 26 84 44 C84 50 80 52 74 52 L26 52 C20 52 16 50 16 44 Z" />
      {face([41, 62], [59, 62], 'M46 68 q4 4 8 0')}
    </>,
  },
  star: {
    name: 'Star',
    shadow: 26,
    parts: c => <path className={c} d={softStar(50, 50, 46, 26)} />,
    over: <>
      {face([41, 50], [59, 50], 'M46 56 q4 4 8 0')}
      {cheeks(34, 66, 58)}
    </>,
  },
  penguin: {
    name: 'Penguin',
    shadow: 24,
    under: <>
      <ellipse className={styles.beak} cx="38" cy="85" rx="9" ry="3.5" />
      <ellipse className={styles.beak} cx="62" cy="85" rx="9" ry="3.5" />
    </>,
    parts: c => <ellipse className={c} cx="50" cy="52" rx="33" ry="33" />,
    over: <>
      <path className={styles.belly} d="M50 30 C60 24 72 34 71 50 C71 70 62 80 50 80 C38 80 29 70 29 50 C28 34 40 24 50 30 Z" />
      <path className={styles.beak} d="M45 52 L55 52 L50 59 Z" />
      <circle className={styles.eye} cx="41" cy="46" r="3" />
      <circle className={styles.eye} cx="59" cy="46" r="3" />
      {cheeks(35, 65, 55)}
    </>,
  },
};
