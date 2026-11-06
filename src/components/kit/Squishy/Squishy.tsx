/**
 * Squishy: a collectible squishy, and SquishyDots, the colours of one kind
 * found and still to find (PRG-5 builds the shelf from them).
 *
 * Props:  kind: one of the 18 in drawings.tsx · colour: 'oat' | 'caramel' |
 *         'toffee' | 'cream' | 'cocoa' (usual), 'blush' | 'butter' | 'sage' |
 *         'sky' | 'lilac' (rare), 'honey' (super rare: it wears its kind's
 *         look, looks.ts) · state: 'found' | 'ghost' | 'mystery' (default
 *         'found') · size: 64 | 96 | 128 (default 96) · label? (default "Bear,
 *         toffee", "Bear, glow", "Not found yet: Bear", "Not found yet: a
 *         mystery squishy") · onClick · className is layout only
 *         SquishyDots: dots: a colour found, 'grey' (a usual colour still to
 *         find) or '?' (a rare one still to find) · label
 * States: found (its colours; a rare or super-rare one wears a twinkling
 *         sparkle) · super rare (swirl: caramel with cream waves; shimmer: honey
 *         with bands of light; glow: honey with a soft halo; a select few move,
 *         and hold still under reduced motion) · ghost (a not-found squishy: its
 *         shape, greyed) · mystery (a harder one: a dashed "?" slot) · squish (a
 *         found one, tapped: the shared squish) · wobble (a ghost or "?", tapped)
 * Tokens: --sq-size, --sq-fill, --sq-edge, --sq-top, --sq-motion
 * Reads:  --illo-squishy-* (its colours, muzzle, cheeks, ears, leaf), --illo-line,
 *         --illo-shadow, --illo-shine, --illo-spark-rare(-deep),
 *         --illo-spark-super(-edge), --edge, --well, --soil, --ink-soft,
 *         --radius-card, --radius-tile, --radius-chip, --border-hair,
 *         --border-regular, --text-display-l, --text-tag, --motion-squish,
 *         --motion-wobble, --motion-twinkle, --motion-swirl, --motion-sheen,
 *         --motion-halo, --space-*
 * Board:  Squishies (the shelf: kinds, ghosts, "?" slots, colour dots), Done
 *         (the new squishy), Library (the Squishy Shelf card). The kinds and
 *         looks the board only names are on the sample sheet Alex OKed
 *         (.claude/skills/luna-design/pictures/squishies-sample.html)
 *
 * Its colours come only from _illustration.scss (colour.md, Illustrations).
 * The rarity tag is a Chip (variant 'rare' or 'super-rare', with shimmer).
 */

import { useEffect, useId, useRef, useState } from 'react';
import { cx, dataState } from '@/utils/cx';
import { afterMotion } from '@/utils/motion';
import { Icon } from '../Icon/Icon';
import { KINDS } from './drawings';
import { SQUISHY_LOOKS, type SquishyKind, type SquishyLook } from './looks';
import styles from './Squishy.module.scss';

export type { SquishyKind, SquishyLook };
export type SquishyColour =
  | 'oat' | 'caramel' | 'toffee' | 'cream' | 'cocoa'
  | 'blush' | 'butter' | 'sage' | 'sky' | 'lilac'
  | 'honey';
type DotColour = SquishyColour | 'grey' | '?';

const RARE = new Set<string>(['blush', 'butter', 'sage', 'sky', 'lilac']);
const SUPER = new Set<string>(['honey']);
const rarityOf = (c: string) => (SUPER.has(c) ? 'super' : RARE.has(c) ? 'rare' : 'usual');

// the swirl's waves, wider than a squishy on both sides so they can drift by a
// wave; the shimmer's two bands of light
const WAVES = 'M-100 40 Q-75 28 -50 44 T0 40 T50 44 T100 40 T150 44 T200 40 M-100 62 Q-75 50 -50 66 T0 62 T50 66 T100 62 T150 66 T200 62 M-100 84 Q-75 72 -50 88 T0 84 T50 88 T100 84 T150 88 T200 84 M-100 18 Q-75 6 -50 22 T0 18 T50 22 T100 18 T150 22 T200 18';
const BAND = 'M30 -6 L52 -6 L30 98 L8 98 Z';
const BAND_THIN = 'M60 -6 L67 -6 L45 98 L38 98 Z';

interface SquishyProps {
  kind: SquishyKind;
  colour?: SquishyColour;
  state?: 'found' | 'ghost' | 'mystery';
  size?: 64 | 96 | 128;
  label?: string;
  onClick?: () => void;
  className?: string;
}

/** One kind's drawing, greyed or in its colours, wearing its look if it has one on. */
function Drawing({ kind, look, ghost }: { kind: SquishyKind; look?: SquishyLook; ghost: boolean }) {
  // an id for its clip and its glow, one per squishy on the screen
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { parts, under, over, shadow, ghostExtra } = KINDS[kind];
  const clip = `url(#clip${id})`;

  return (
    <svg className={styles.drawing} viewBox="0 0 100 92" aria-hidden="true">
      {ghost ? (
        <>
          {ghostExtra}
          {parts(styles.body)}
        </>
      ) : (
        <>
          {look && (
            <defs>
              <clipPath id={`clip${id}`}>{parts()}</clipPath>
              {look === 'glow' && (
                <radialGradient id={`glow${id}`}>
                  <stop className={styles.glowInner} offset="55%" />
                  <stop className={styles.glowOuter} offset="100%" />
                </radialGradient>
              )}
            </defs>
          )}
          {look === 'glow' && <ellipse className={styles.halo} cx="50" cy="50" rx="56" ry="52" fill={`url(#glow${id})`} />}
          <ellipse className={styles.shadow} cx="50" cy="88" rx={shadow} ry="4" />
          {under}
          {parts(styles.body)}
          {look === 'swirl' && (
            <g clipPath={clip}>
              <path className={styles.waves} d={WAVES} />
            </g>
          )}
          {look === 'shimmer' && (
            <g clipPath={clip}>
              <g className={styles.sheen}>
                <path className={styles.band} d={BAND} />
                <path className={styles.bandThin} d={BAND_THIN} />
              </g>
            </g>
          )}
          {/* the waves and bands stop at its edge, so the edge goes back on top */}
          {(look === 'swirl' || look === 'shimmer') && parts(styles.outline)}
          {over}
        </>
      )}
    </svg>
  );
}

export function Squishy({ kind, colour = 'oat', state = 'found', size = 96, label, onClick, className }: SquishyProps) {
  // each tap restarts the squish (or the wobble) on a fresh key
  const [bump, setBump] = useState(0);
  const cancel = useRef<() => void>(undefined);
  useEffect(() => () => cancel.current?.(), []);
  const found = state === 'found';

  const tap = () => {
    cancel.current?.();
    setBump(b => b + 1);
    cancel.current = afterMotion(found ? 'celebrate' : 'emphasis', () => setBump(0));
    onClick?.();
  };

  const { name } = KINDS[kind];
  const rarity = rarityOf(colour);
  const worn = found && rarity === 'super' ? SQUISHY_LOOKS[kind] : undefined;
  const said = label ?? (found ? `${name}, ${worn?.look ?? colour}` : state === 'ghost' ? `Not found yet: ${name}` : 'Not found yet: a mystery squishy');

  return (
    <button
      type="button"
      className={cx(styles.root, className)}
      data-size={size}
      data-colour={found ? colour : undefined}
      data-look={worn?.look}
      data-moves={worn?.moves ? '' : undefined}
      data-state={dataState(state, bump > 0 && (found ? 'squish' : 'wobble'))}
      aria-label={said}
      onClick={tap}
    >
      <span key={bump} className={styles.art}>
        {state === 'mystery' ? (
          <span className={styles.slot} aria-hidden="true">?</span>
        ) : (
          <Drawing kind={kind} look={worn?.look} ghost={state === 'ghost'} />
        )}
      </span>
      {found && rarity !== 'usual' && (
        <span className={styles.badge} data-variant={rarity} aria-hidden="true">
          <Icon name="sparkle" size={20} filled />
        </span>
      )}
    </button>
  );
}

/** One kind's colours: found (its colour), 'grey' (usual, still to find), '?' (rare, still to find). */
export function SquishyDots({ dots, label, className }: { dots: DotColour[]; label: string; className?: string }) {
  return (
    <span className={cx(styles.dots, className)} role="img" aria-label={label}>
      {dots.map((d, i) => (
        <span key={i} className={styles.dot} data-colour={d === '?' ? 'rare-unknown' : d}>{d === '?' ? '?' : null}</span>
      ))}
    </span>
  );
}
