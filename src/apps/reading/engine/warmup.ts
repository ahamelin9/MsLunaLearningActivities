// Luna repeats a fairly small set of things: her encouragement lines, the
// letter sounds and names, and the words for the current grade. Generating
// those quietly in the background means that by the time a child taps
// something, the clip is usually already waiting.

import type { GradeLevel } from '../../../types/reading';
import { pronunciation, type SpeechPart } from '../../../utils/pronunciation';
import { LUNA_PHRASES } from './luna';
import { lettersFor, tierFor, wordsUpTo } from './content';

export function warmReadingVoice(grade: GradeLevel) {
  const tier = tierFor(grade, 2);

  const sounds: SpeechPart[] = lettersFor(tier).map(l => ({ sound: l.letter }));
  const names: SpeechPart[] = lettersFor(tier).map(l => ({ name: l.letter }));
  const words: SpeechPart[] = wordsUpTo(tier).map(w => ({ word: w.word }));
  const lines: SpeechPart[] = LUNA_PHRASES.map(text => ({ text }));

  // Order matters: the sounds and Luna's reactions are heard constantly,
  // so they are generated first.
  pronunciation.warm([...sounds, ...lines, ...names, ...words]);
}

/** What Luna says the moment a game opens. (The tagline is only ever read, not spoken.) */
export function warmGameIntro(mission: string) {
  pronunciation.warm([{ text: mission }]);
}
