import { useRef } from 'react';

/**
 * A squishy speaks on its first squeeze only (BUG-30, Alex 2026-11-11: saying
 * it every time "sounds like too much"); later squeezes just squish, which the
 * kit's Squishy does by itself. The screen remembers what's been said while
 * it's open, keyed by the line, so a kind's line (or a "?"'s clue) plays once
 * a visit wherever it sits on the screen. Opening the screen again starts
 * afresh.
 */
export function useFirstSqueeze(): (line: string, speak: () => void) => void {
  const spoken = useRef(new Set<string>());
  return (line, speak) => {
    if (spoken.current.has(line)) return;
    spoken.current.add(line);
    speak();
  };
}
