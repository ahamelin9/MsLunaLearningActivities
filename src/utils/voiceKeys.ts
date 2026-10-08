// The identity of a pre-rendered voice clip.
//
// This module is imported by both sides on purpose. The build script names the
// files it writes and the app names the file it wants, and if those two ever
// disagree by so much as a capital letter the app silently falls back to the
// robotic browser voice. Keeping the naming in one place makes that
// impossible rather than merely unlikely.

/** The three speeds the settings screen offers. */
export const RATE_BUCKETS = {
  slow: 0.75,
  normal: 0.95,
  quick: 1.15
} as const;

export type RateBucket = keyof typeof RATE_BUCKETS;

export type ClipKind = 'sound' | 'name' | 'word' | 'text';

export const RATE_BUCKET_NAMES = Object.keys(RATE_BUCKETS) as RateBucket[];

/** Which bucket an arbitrary stored rate falls into. */
export function bucketFor(rate: number): RateBucket {
  if (rate < 0.85) return 'slow';
  if (rate <= 1.05) return 'normal';
  return 'quick';
}

/**
 * Sounds and single words are never pushed past natural pace — a child
 * sounding out /m/ gains nothing from a fast one — so those kinds clamp at 1.0.
 */
export function speedFor(kind: ClipKind, bucket: RateBucket): number {
  const rate = RATE_BUCKETS[bucket];
  return kind === 'sound' || kind === 'word' ? Math.min(rate, 1) : rate;
}

/**
 * Case and spacing are folded so that 'm', 'M' and ' M ' are one clip, while
 * the '+alt' marker for a letter's second sound survives intact.
 */
export function normalizeValue(kind: ClipKind, value: string): string {
  const trimmed = value.trim();
  switch (kind) {
    case 'sound': {
      const [base, ...rest] = trimmed.split('+');
      return rest.length ? `${base.toUpperCase()}+${rest.join('+').toLowerCase()}` : base.toUpperCase();
    }
    case 'name':
      return trimmed.toUpperCase();
    case 'word':
      return trimmed.toLowerCase();
    default:
      return trimmed;
  }
}

export function keyOf(kind: ClipKind, value: string, bucket: RateBucket): string {
  return `${kind}|${normalizeValue(kind, value)}|${bucket}`;
}
