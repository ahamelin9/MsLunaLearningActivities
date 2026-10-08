// Behaviour every guided-lesson question shares. A lesson runs in the same
// shell as the games (see engine/lessons.ts), so a question only presents
// itself and reports right or wrong; Luna, hints, progress and rewards are the
// shell's.

import { useEffect, useRef, useState } from 'react';
import type { GameApi } from '../engine/types';

/** Says the question's prompt once, a moment after it appears. */
export function usePrompt(say: () => void) {
  useEffect(() => {
    const id = window.setTimeout(say, 450);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Answering. The choice is said aloud first — "letter D", "dog" — and only
 * then does the shell cheer or console, so neither cuts the other off. Taps
 * while that plays are ignored. The question's own hint is what Luna says
 * from the second miss on.
 */
export function useAnswer(api: GameApi, hint?: string) {
  const [solved, setSolved] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const busy = useRef(false);
  const fallback = useRef<number | undefined>(undefined);

  // a timer must not settle an answer for a question the child has left
  useEffect(() => () => window.clearTimeout(fallback.current), []);

  const choose = (id: string, correct: boolean, say: (onEnd: () => void) => void) => {
    if (busy.current || solved || api.locked) return;
    busy.current = true;
    if (correct) setSolved(true);
    else {
      setWrongId(id);
      window.setTimeout(() => setWrongId(null), 600);
    }

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(fallback.current);
      if (correct) {
        api.win({ delay: 1600 });
        return;
      }
      busy.current = false;
      api.miss({ hint: hint ? [{ text: hint }] : undefined });
    };
    // Speech that is cut short — the child taps "listen" while their answer
    // is being said — never reports that it ended, and waiting for it left
    // the question deaf to every later tap. So the answer also settles on its
    // own: soon for a miss, later for a right answer, whose explanation can
    // run a few seconds.
    fallback.current = window.setTimeout(settle, correct ? 7000 : 2500);
    say(settle);
  };

  return { solved, wrongId, choose };
}
