// Behaviour every guided-lesson question shares. A lesson runs in the same
// shell as the games (see engine/lessons.ts), so a question only presents
// itself and reports right or wrong; Luna, hints, progress and rewards are the
// shell's.

import { useEffect, useRef, useState } from 'react';
import type { ChoiceState } from '@/components/kit';
import { afterMotion } from '@/utils/motion';
import type { GameApi } from '../../engine/types';
import type { SpeechPart } from '@/utils/pronunciation';

/** The instruction said last, so a reading lesson says each one once a play (CUR-14). */
let lastInstruction: string | null = null;

/**
 * Says the question's prompt once, a moment after it appears, unless the
 * child has already answered: it would cut their answer off (BUG-28).
 *
 * `instruction`: the prompt is only an instruction, the same every round
 * ("Read the sentence. Which picture shows it?"), so it is said on the play's
 * first round and again only when it changes; later rounds start quiet, and
 * the speaker button still says it (CUR-14; the teacher, 2026-11-12: "Ms.
 * Luna reading it all the time"). A listening lesson leaves it out: its
 * prompt is the question itself (heard, never shown).
 */
export function usePrompt(say: () => void, api: GameApi, instruction?: string) {
  // worked out once, as the round appears
  const [speak] = useState(
    () => instruction === undefined || api.ctx.roundIndex === api.ctx.firstRound || lastInstruction !== instruction
  );
  useEffect(() => {
    if (instruction !== undefined) lastInstruction = instruction;
    if (!speak) return;
    const id = window.setTimeout(() => !api.answered() && say(), 450);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * What Luna says when a word is tapped before the child has tried (CUR-14):
 * a sentence or story is theirs to read first, and every word reads itself
 * once they have answered.
 */
export const TRY_FIRST = { text: 'Try reading it first!' };

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

  // A sentence or story is the child's to read first: read aloud before they
  // have answered, it would be a listening question. One answer, right or
  // wrong, and it reads itself on tap, a line or a word (CUR-14: a word
  // tapped before then gets Luna's TRY_FIRST instead).
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
