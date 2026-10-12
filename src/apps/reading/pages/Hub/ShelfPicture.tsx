import type { GameShape } from '../../engine/types';
import { cx } from '@/utils/cx';
import styles from './ShelfPicture.module.scss';

/**
 * The drawn picture on each game's Play Shelf Tile (DES-21), as on the round 2
 * Library board. Colours come from the illustration palette (`--illo-tile-*`)
 * and roles, through classes in the module; each picture moves gently with
 * the shared sway or float, which reduced motion stills.
 */

export function ShelfPicture({ shape }: { shape: GameShape }) {
  switch (shape) {
    case 'jar':
      // the Letter Jar: letters jiggling inside a glass jar
      return (
        <svg className={styles.picture} width={96} height={68} viewBox="0 0 120 86" aria-hidden="true">
          <rect className={styles.olive} x={34} y={4} width={52} height={10} rx={4} />
          <path className={styles.glass} d="M38 14h44v58a10 10 0 0 1-10 10H48a10 10 0 0 1-10-10z" strokeWidth={3} />
          <text className={cx(styles.letter, styles.toffee, styles.sway)} x={45} y={48} fontSize={20}>B</text>
          <text className={cx(styles.letter, styles.walnut, styles.sway, styles.later)} x={64} y={60} fontSize={18}>m</text>
          <text className={cx(styles.letter, styles.olive, styles.sway, styles.latest)} x={48} y={74} fontSize={16}>s</text>
        </svg>
      );
    case 'bubbles':
      // Bubble Sounds: three bubbles bobbing
      return (
        <svg className={styles.picture} width={120} height={68} viewBox="0 0 120 68" aria-hidden="true">
          <circle className={cx(styles.bubble, styles.float)} cx={38} cy={34} r={16} strokeWidth={3} />
          <circle className={cx(styles.bubble, styles.float, styles.later)} cx={68} cy={40} r={11} strokeWidth={3} />
          <circle className={cx(styles.bubble, styles.float, styles.latest)} cx={90} cy={46} r={7} strokeWidth={3} />
        </svg>
      );
    case 'plate':
      // Feed Luna (Letter Cookies, GAME-6): two letter cookies
      return (
        <svg className={styles.picture} width={120} height={68} viewBox="0 0 140 80" aria-hidden="true">
          <g className={styles.sway}>
            <circle className={styles.cookie} cx={54} cy={42} r={28} strokeWidth={3} />
            <text className={cx(styles.letter, styles.line)} x={54} y={51} fontSize={26} textAnchor="middle">b</text>
            <circle className={styles.walnut} cx={40} cy={30} r={2.6} />
            <circle className={styles.walnut} cx={70} cy={34} r={2.4} />
            <circle className={styles.walnut} cx={66} cy={60} r={2.6} />
          </g>
          <g className={cx(styles.sway, styles.later)}>
            <circle className={styles.cookieLight} cx={102} cy={50} r={19} strokeWidth={3} />
            <text className={cx(styles.letter, styles.line)} x={102} y={57} fontSize={19} textAnchor="middle">s</text>
          </g>
        </svg>
      );
    case 'cards':
      // Muddled Cards: a face-up card between two shuffling backs
      return (
        <svg className={styles.picture} width={120} height={68} viewBox="0 0 140 80" aria-hidden="true">
          <g transform="rotate(-10 49 39)">
            <rect className={cx(styles.toffee, styles.sway)} x={30} y={12} width={38} height={54} rx={8} />
          </g>
          <rect className={styles.cardFace} x={52} y={10} width={38} height={54} rx={8} strokeWidth={3} />
          <circle className={styles.clay} cx={71} cy={37} r={9} />
          <g transform="rotate(12 93 41)">
            <rect className={cx(styles.toffee, styles.sway, styles.later)} x={74} y={14} width={38} height={54} rx={8} />
          </g>
        </svg>
      );
    case 'page':
      // Words Off the Page: three words drifting
      return (
        <svg className={styles.picture} width={150} height={60} viewBox="0 0 150 60" aria-hidden="true">
          {WORDS.map(({ word, x, width, tilt }, i) => (
            <g key={word} className={cx(styles.float, i === 1 && styles.later, i === 2 && styles.latest)}>
              <g transform={`rotate(${tilt} ${x + width / 2} 30)`}>
                <rect className={styles.cream} x={x} y={16} width={width} height={28} rx={8} />
                <text className={cx(styles.letter, styles.line)} x={x + width / 2} y={36} fontSize={17} textAnchor="middle">{word}</text>
              </g>
            </g>
          ))}
        </svg>
      );
    case 'desk':
      // What's Missing?: two things on the desk, and the space where one was
      return (
        <svg className={styles.picture} width={130} height={60} viewBox="0 0 130 60" aria-hidden="true">
          <circle className={styles.cookie} cx={24} cy={34} r={14} strokeWidth={2.5} />
          <rect className={styles.leaf} x={48} y={20} width={28} height={28} rx={6} strokeWidth={2.5} />
          <rect className={cx(styles.gone, styles.sway)} x={92} y={20} width={28} height={28} rx={8} strokeWidth={2.5} strokeDasharray="5 5" />
        </svg>
      );
    case 'map':
      // Treasure Path: a dotted path to an X
      return (
        <svg className={styles.picture} width={150} height={64} viewBox="0 0 160 70" aria-hidden="true">
          <path className={styles.path} d="M14 56C40 56 40 14 80 24s40 34 66 14" strokeWidth={4} strokeLinecap="round" strokeDasharray="2 10" />
          <path className={cx(styles.mark, styles.sway)} d="M138 28l12 12M150 28l-12 12" strokeWidth={4} strokeLinecap="round" />
        </svg>
      );
    case 'book':
      // Story Corner: an open book, its right page lifting
      return (
        <svg className={styles.picture} width={104} height={64} viewBox="0 0 120 74" aria-hidden="true">
          <path className={styles.page} d="M60 18c-12-8-28-9-44-6v50c16-3 32-2 44 6z" strokeWidth={3} />
          <path className={cx(styles.page, styles.float)} d="M60 18c12-8 28-9 44-6v50c-16-3-32-2-44 6z" strokeWidth={3} />
        </svg>
      );
    case 'lesson':
      return null;
  }
}

const WORDS = [
  { word: 'The', x: 4, width: 50, tilt: -5 },
  { word: 'cat', x: 62, width: 46, tilt: 4 },
  { word: 'is', x: 116, width: 30, tilt: -2 }
];
