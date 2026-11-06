// Each kind's super-rare look (PRG-5b): plain data, with no drawings or styles,
// so the app's own rules (engine/squishies.ts) can read it anywhere.

export type SquishyKind =
  | 'ball' | 'cat' | 'bunny' | 'bear' | 'butter' | 'peach' | 'cloud' | 'moon'
  | 'frog' | 'donut' | 'mushroom' | 'dumpling' | 'hamster' | 'heart'
  | 'toast' | 'acorn' | 'star' | 'penguin';

export type SquishyLook = 'swirl' | 'shimmer' | 'glow';

/** The look a kind wears when it's super rare, and the select few whose look moves (Alex, 2026-11-06). */
export const SQUISHY_LOOKS: Record<SquishyKind, { look: SquishyLook; moves?: true }> = {
  ball: { look: 'swirl' },
  cat: { look: 'glow' },
  bunny: { look: 'swirl' },
  bear: { look: 'glow' },
  butter: { look: 'swirl' },
  peach: { look: 'shimmer' },
  cloud: { look: 'shimmer', moves: true },
  moon: { look: 'swirl', moves: true },
  frog: { look: 'glow' },
  donut: { look: 'shimmer' },
  mushroom: { look: 'glow' },
  dumpling: { look: 'swirl' },
  hamster: { look: 'swirl' },
  heart: { look: 'glow', moves: true },
  toast: { look: 'shimmer' },
  acorn: { look: 'shimmer' },
  star: { look: 'glow' },
  penguin: { look: 'shimmer' }
};
