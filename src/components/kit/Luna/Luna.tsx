/**
 * Luna: Ms. Luna, the owl the teacher picked (round 2, owl 1, "Her pick"):
 * the rounder owl with caramel feathers in round black frames.
 *
 * Props:  mood: 'idle' | 'happy' | 'cheer' | 'think' | 'oops' | 'surprise' |
 *         'listen' | 'sleepy' (default 'idle') · size: px (default 96)
 *         talking?: left out, her beak follows the voice, moving only while
 *         one of her clips plays; true or false holds it (the Kit page, or
 *         someone else talking, DES-17) · float: a slow bob, for screens
 *         where nothing is being played (DES-15)
 *         onClick (she becomes a button) · label · className is layout only
 * States: the 8 moods re-pose one drawing (eyes, wings, beak, cheeks, a
 *         tilt); idle, happy, think and listen blink; cheer and surprise pop,
 *         oops wobbles; talking moves the beak
 * Tokens: --luna-move, --luna-blink, --luna-talk
 * Reads:  --illo-luna-* (feather, feather-deep, belly, eye, pupil, cheek,
 *         beak), --illo-frames, --illo-shine, --illo-shadow, --ink-soft (the
 *         sleepy "z", which floats on the screen, not on her),
 *         --motion-float, --motion-blink, --motion-pop, --motion-wobble,
 *         --motion-talk, --dur-tap, --ease-standard, --radius-card
 * Board:  Ms. Luna (owl 1), Library (the welcome row), Round (the perch),
 *         Done (cheer: wings up, happy eyes)
 *
 * Her colours come only from _illustration.scss, through the classes in her
 * module. A pose is drawing geometry, so it lives here as SVG transforms;
 * the shared motions run on wrappers, in the module.
 */

import { useSpeaking } from '@/utils/useSpeaking';
import { cx } from '@/utils/cx';
import styles from './Luna.module.scss';

export type LunaMood = 'idle' | 'happy' | 'cheer' | 'think' | 'oops' | 'surprise' | 'listen' | 'sleepy';

interface LunaProps {
  mood?: LunaMood;
  size?: number;
  talking?: boolean;
  float?: boolean;
  onClick?: () => void;
  label?: string;
  className?: string;
}

/** Scales a part about its own centre, in the drawing's 200-unit box. */
const grow = (x: number, y: number, by: number) => `translate(${x} ${y}) scale(${by}) translate(${-x} ${-y})`;

interface Pose {
  /** the whole owl, about her feet */
  tilt?: string;
  wingLeft?: string;
  wingRight?: string;
  /** where the pupils look */
  look?: string;
  /** pupils: round (as drawn), small (wide-eyed); or the eyes as lines */
  eyes?: 'round' | 'small' | 'smile' | 'closed';
  /** lower lids part-way up: eyes that smile */
  squint?: boolean;
  beak?: string;
  cheeks?: number;
  zzz?: boolean;
}

const POSES: Record<LunaMood, Pose> = {
  idle: {},
  happy: { wingLeft: 'rotate(22 40 96)', wingRight: 'rotate(-22 160 96)', look: 'translate(0 -3)', squint: true, cheeks: 1.2 },
  // the round 2 Done board: wings up, happy eyes
  cheer: { wingLeft: 'translate(-6 -28) rotate(40 40 124)', wingRight: 'translate(6 -28) rotate(-40 160 124)', eyes: 'smile', cheeks: 1.2 },
  think: { tilt: 'rotate(-6 100 186)', wingRight: 'translate(4 -40) rotate(-30 160 124)', look: 'translate(5 -5)' },
  oops: { wingLeft: 'rotate(-8 40 96)', wingRight: 'rotate(8 160 96)', look: 'translate(-5 6)', cheeks: 1.35 },
  surprise: { wingLeft: 'rotate(28 40 96)', wingRight: 'rotate(-28 160 96)', eyes: 'small', beak: 'translate(0 116) scale(1 1.45) translate(0 -116)' },
  listen: { tilt: 'rotate(7 100 186)', wingLeft: 'translate(-12 -40) rotate(40 40 124)', look: 'translate(-5 1)' },
  sleepy: { tilt: 'rotate(-4 100 186) translate(0 3)', eyes: 'closed', zzz: true }
};

/** One eye's pupil and glint; `small` shrinks them about the pupil's centre. */
function Pupil({ cx: x, look, small }: { cx: number; look?: string; small: boolean }) {
  return (
    <g transform={small ? grow(x, 96, 0.7) : look}>
      <circle className={styles.pupil} cx={x} cy={96} r={10} />
      <circle className={styles.glint} cx={x + 3.5} cy={92} r={3.5} />
    </g>
  );
}

export function Luna({ mood = 'idle', size = 96, talking, float = false, onClick, label, className }: LunaProps) {
  const speaking = useSpeaking();
  const pose = POSES[mood];
  const eyes = pose.eyes ?? 'round';
  const Tag = onClick ? 'button' : 'span';

  return (
    <Tag
      className={cx(styles.root, className)}
      data-mood={mood}
      data-state={(talking ?? speaking) ? 'talking' : undefined}
      data-float={float || undefined}
      style={{ width: size, height: size }}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      aria-label={onClick ? (label ?? 'Ms. Luna, tap to hear again') : undefined}
    >
      <span className={styles.figure}>
        <svg className={styles.svg} viewBox="0 0 200 200" aria-hidden="true">
          <ellipse className={styles.shadow} cx={100} cy={191} rx={50} ry={7} />
          <g transform={pose.tilt}>
            <path className={styles.ear} d="M58 66 L50 28 L86 48 Z" strokeWidth={8} strokeLinejoin="round" />
            <path className={styles.ear} d="M142 66 L150 28 L114 48 Z" strokeWidth={8} strokeLinejoin="round" />
            <ellipse className={styles.wing} cx={40} cy={124} rx={14} ry={30} transform={pose.wingLeft} />
            <ellipse className={styles.wing} cx={160} cy={124} rx={14} ry={30} transform={pose.wingRight} />
            <ellipse className={styles.body} cx={100} cy={112} rx={66} ry={72} />
            <ellipse className={styles.belly} cx={100} cy={150} rx={40} ry={30} />
            <path
              className={styles.chevrons}
              d="M84 142 l6 6 6 -6 M104 142 l6 6 6 -6 M94 156 l6 6 6 -6"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <circle className={styles.eyeWhite} cx={74} cy={94} r={21} />
            <circle className={styles.eyeWhite} cx={126} cy={94} r={21} />
            {(eyes === 'round' || eyes === 'small') && (
              <g className={styles.eyes}>
                <Pupil cx={76} look={pose.look} small={eyes === 'small'} />
                <Pupil cx={124} look={pose.look} small={eyes === 'small'} />
              </g>
            )}
            {eyes === 'smile' && (
              <path className={styles.eyeLine} d="M64 98 q12 -12 24 0 M112 98 q12 -12 24 0" strokeWidth={6} strokeLinecap="round" />
            )}
            {eyes === 'closed' && (
              <path className={styles.eyeLine} d="M64 94 q12 8 24 0 M112 94 q12 8 24 0" strokeWidth={5} strokeLinecap="round" />
            )}
            {pose.squint && (
              <path className={styles.lid} d="M53.4 98 A21 21 0 0 0 94.6 98 Z M105.4 98 A21 21 0 0 0 146.6 98 Z" />
            )}

            <circle className={styles.frame} cx={74} cy={94} r={23} strokeWidth={5} />
            <circle className={styles.frame} cx={126} cy={94} r={23} strokeWidth={5} />
            <path className={styles.frame} d="M97 91 q3 -3 6 0 M51 90 l-11 -5 M149 90 l11 -5" strokeWidth={5} strokeLinecap="round" />

            <ellipse className={styles.cheek} cx={56} cy={124} rx={9} ry={5.5} transform={pose.cheeks ? grow(56, 124, pose.cheeks) : undefined} />
            <ellipse className={styles.cheek} cx={144} cy={124} rx={9} ry={5.5} transform={pose.cheeks ? grow(144, 124, pose.cheeks) : undefined} />

            <g className={styles.beakMove}>
              <path className={styles.beak} d="M92 116 h16 l-8 11 z" strokeWidth={3} strokeLinejoin="round" transform={pose.beak} />
            </g>
            <ellipse className={styles.foot} cx={82} cy={186} rx={11} ry={6} />
            <ellipse className={styles.foot} cx={118} cy={186} rx={11} ry={6} />
          </g>

          {pose.zzz && (
            <path
              className={styles.zzz}
              d="M150 44 h14 l-14 16 h14 M170 24 h9 l-9 10 h9"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </span>
    </Tag>
  );
}
