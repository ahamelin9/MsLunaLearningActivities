// Timers tied to an animation (DES-5). A JS timer that has to end with an
// animation (a wrong answer clears when its wobble ends) reads the same
// duration role the CSS uses, never a typed number, so the two always agree,
// and both shorten together under reduced motion (DES-6).

/** The duration roles in src/styles/tokens/ (`--dur-*`). */
export type MotionDuration = 'tap' | 'quick' | 'emphasis' | 'enter' | 'celebrate' | 'petals' | 'loop';

/** A duration role in milliseconds, as `el` resolves it now (0 if it isn't there). */
export function motionMs(name: MotionDuration, el: Element = document.documentElement): number {
  const raw = getComputedStyle(el).getPropertyValue(`--dur-${name}`).trim();
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return 0;
  return raw.endsWith('ms') ? n : raw.endsWith('s') ? n * 1000 : n;
}

/** Runs `fn` once the duration role has passed; returns a cancel function. */
export function afterMotion(name: MotionDuration, fn: () => void, el?: Element): () => void {
  const id = window.setTimeout(fn, motionMs(name, el));
  return () => window.clearTimeout(id);
}
