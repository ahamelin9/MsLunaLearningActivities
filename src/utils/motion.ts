// Timers tied to an animation (DES-5). A JS timer that has to end with an
// animation (a wrong answer clears when its wobble ends) reads the same
// duration role the CSS uses, never a typed number, so the two always agree,
// and both shorten together under reduced motion (DES-6).
//
// Reduced motion (DES-6): `data-reduced-motion` on <html>, set from the
// Settings switch or the iPad's own setting. Under it the motion roles are off
// (src/styles/tokens/_roles.scss) and every legacy animation ends at once
// (src/styles/base/_reduced-motion.scss).

import { useEffect } from 'react';

/** Motion a game moves by script slows to this share under reduced motion (Bubble Sounds' bubbles). */
export const REDUCED_MOTION_PACE = 0.5;

/** Is reduced motion on right now? */
export function isReducedMotion(): boolean {
  return document.documentElement.hasAttribute('data-reduced-motion');
}

/** Keeps `data-reduced-motion` on <html> in step with the setting and the iPad's own. */
export function useReducedMotion(setting: boolean) {
  useEffect(() => {
    const device = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => document.documentElement.toggleAttribute('data-reduced-motion', setting || device.matches);
    apply();
    device.addEventListener('change', apply);
    return () => device.removeEventListener('change', apply);
  }, [setting]);
}

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
