// Behaviour every guided-lesson question shares. A lesson runs in the same
// shell as the games (see engine/lessons.ts), so a question only presents
// itself and reports right or wrong; Luna, hints, progress and rewards are the
// shell's.

import { useEffect, useRef, useState } from 'react';
import type { ChoiceState } from '@/components/kit';
import { afterMotion } from '@/utils/motion';
import type { GameApi } from '../../engine/types';
import type { SpeechPart } from '@/utils/pronunciation';

/** Says the question's prompt once, a moment after it appears. */
export function usePrompt(say: () => void) {
  useEffect(() => {
    const id = window.setTimeout(say, 450);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Answering, through the shell's one answer path (FB-1): the choice is said
 * aloud first — "letter D", "dog" — and only then does the shell cheer or
 * console, so neither cuts the other off. Taps while that plays are ignored.
 * The question's own hint is what Luna says from the second miss on, and from
 * the third the right choice is revealed (FB-2).
 */
export function useAnswer(api: GameApi, hint?: string) {
  const [solved, setSolved] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  // "show me" (FB-2): the shell asks for it from the third miss
  const [revealed, setRevealed] = useState(false);
  // two taps in one frame, before the shell's lock reaches this question
  const busy = useRef(false);
  useEffect(() => {
    if (!api.locked) busy.current = false;
  }, [api.locked]);

  const choose = (id: string, correct: boolean, say: SpeechPart[]) => {
    if (busy.current || solved || api.locked) return;
    busy.current = true;
    if (correct) setSolved(true);
    else {
      // a wrong answer wobbles, and clears when its wobble ends (components.md)
      setWrongId(id);
      afterMotion('emphasis', () => setWrongId(null));
    }
    api.answer({
      correct,
      say,
      delay: 1600,
      hint: hint ? [{ text: hint }] : undefined,
      reveal: () => setRevealed(true)
    });
  };

  // A sentence or story is the child's to read first: read aloud whole before
  // they have answered, it would be a listening question. One answer, right
  // or wrong, and it reads itself on tap. (A single word can always be tapped,
  // the way a child would ask the teacher.)
  const tried = solved || api.attempts > 0;

  return { solved, tried, wrongId, revealed, choose };
}

/**
 * A choice's state in the one answer language (DES-23): wobbling while
 * wrong; once solved, the right one right and the others faded; and after
 * three misses, the right one revealed (FB-2) until it's chosen.
 */
export function choiceState(
  id: string,
  correct: boolean,
  wrongId: string | null,
  solved: boolean,
  revealed = false
): ChoiceState {
  if (wrongId === id) return 'wrong';
  if (solved) return correct ? 'right' : 'faded';
  if (revealed && correct) return 'revealed';
  return 'idle';
}
