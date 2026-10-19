/**
 * MilestoneMoon: the crescent in Luna's round black glasses, who visits now
 * and then to say "good job" for a big milestone (DES-17; round 2 Ms. Luna
 * board, moon 6, "Milestone moon"). The owl stays Luna.
 *
 * Props:  mood: 'happy' | 'cheer' (default 'happy') · size: px (default 160)
 *         talking?: left out, her mouth follows the voice, moving only while
 *         a clip plays (as Luna's beak, DES-15); true or false holds it (the
 *         Kit page) · className is layout only
 * States: happy: open eyes that blink, a small smile; cheer: smiling eyes,
 *         a wide smile, rosier cheeks. She rocks gently in both; talking
 *         moves her mouth. Under reduced motion she is still.
 * Tokens: --moon-rock, --moon-blink, --moon-talk
 * Reads:  --illo-moon-pale, --illo-moon-pale-crater, --illo-moon-edge,
 *         --illo-moon-cheek, --illo-moon-mouth, --illo-moon-glow,
 *         --illo-frames, --illo-line, --illo-shine, --motion-sway,
 *         --motion-blink, --motion-talk
 * Board:  Ms. Luna, row 2, moon 6 (the teacher's "Milestone moon")
 *
 * Her colours come only from _illustration.scss, through the classes in her
 * module: moon gold is only for the moon (colour.md). Who shows her, and when,
 * is the done screen's (engine/DoneScreen, MoonVisit).
 */

import { useSpeaking } from '@/utils/useSpeaking';
import { cx } from '@/utils/cx';
import styles from './MilestoneMoon.module.scss';

export type MoonMood = 'happy' | 'cheer';

interface MilestoneMoonProps {
  mood?: MoonMood;
  size?: number;
  talking?: boolean;
  className?: string;
}

export function MilestoneMoon({ mood = 'happy', size = 160, talking, className }: MilestoneMoonProps) {
  const speaking = useSpeaking();
  const cheer = mood === 'cheer';

  return (
    <span
      className={cx(styles.root, className)}
      data-mood={mood}
      data-state={(talking ?? speaking) ? 'talking' : undefined}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg className={styles.svg} viewBox="0 0 200 200">
        <g className={styles.rock}>
          <g transform="rotate(-18 100 110)">
            <path
              className={styles.face}
              d="M40 60.2 A72 72 0 1 0 160 60.2 A60 60 0 1 1 40 60.2 Z"
              strokeWidth={4}
              strokeLinejoin="round"
            />
            <circle className={styles.crater} cx={48} cy={110} r={5} />
            <circle className={styles.crater} cx={150} cy={114} r={5} />
            {cheer ? (
              <path className={styles.eyeLine} d="M77 144 q7 -8 14 0 M109 144 q7 -8 14 0" strokeWidth={4} strokeLinecap="round" />
            ) : (
              <g className={styles.eyes}>
                <circle className={styles.pupil} cx={84} cy={142} r={6} />
                <circle className={styles.pupil} cx={116} cy={142} r={6} />
                <circle className={styles.glint} cx={86} cy={139.5} r={2} />
                <circle className={styles.glint} cx={118} cy={139.5} r={2} />
              </g>
            )}
            <circle className={styles.frame} cx={84} cy={142} r={12} strokeWidth={4.5} />
            <circle className={styles.frame} cx={116} cy={142} r={12} strokeWidth={4.5} />
            <path className={styles.frame} d="M96 140 q4 -3 8 0" strokeWidth={4.5} strokeLinecap="round" />
            <ellipse className={styles.cheek} cx={66} cy={152} rx={cheer ? 7.5 : 6} ry={cheer ? 4.5 : 3.5} />
            <ellipse className={styles.cheek} cx={134} cy={152} rx={cheer ? 7.5 : 6} ry={cheer ? 4.5 : 3.5} />
            <g className={styles.mouthMove}>
              <path
                className={styles.mouth}
                d={cheer ? 'M90 157 h20 a10 10 0 0 1 -20 0 z' : 'M93 158 h14 a7 7 0 0 1 -14 0 z'}
              />
            </g>
          </g>
        </g>
      </svg>
    </span>
  );
}
