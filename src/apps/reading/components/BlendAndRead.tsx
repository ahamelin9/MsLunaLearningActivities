import React, { useMemo, useState } from 'react';
import type { BlendAndReadQuestion } from '../../../types/reading';
import type { GameApi } from '../engine/types';
import { shuffle } from '../engine/content';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { PromptChip } from './LessonKit';
import { useAnswer, usePrompt } from './lessonHooks';

/** Sound out the letters, blend them, find the picture. */
export const BlendAndRead: React.FC<{ question: BlendAndReadQuestion; api: GameApi }> = ({ question, api }) => {
  const options = useMemo(() => shuffle(question.options), [question.options]);
  const { solved, wrongId, choose } = useAnswer(api, question.hint);
  const [active, setActive] = useState<number | null>(null);

  const sayPrompt = () => soundManager.speak(question.speechPrompt ?? 'Blend the sounds to read the word!');
  usePrompt(sayPrompt);

  const playSound = (index: number) => {
    soundManager.playLetterTap();
    setActive(index);
    pronunciation.speakLetterSound(question.phonemes[index].spokenSound, { onEnd: () => setActive(null) });
  };

  // Until the child has blended it, this plays the sounds in a row and leaves
  // the blending to them; saying the word would hand them the answer.
  const playAll = () => {
    soundManager.playPop();
    if (solved) pronunciation.speakWord(question.word);
    else pronunciation.speakSequence(question.phonemes.map(p => ({ sound: p.spokenSound })));
  };

  return (
    <div className="lesson">
      <PromptChip text={question.prompt} onClick={sayPrompt} />

      <div className="lesson-blocks">
        {question.phonemes.map((phoneme, i) => (
          <button
            key={`${phoneme.text}-${i}`}
            className={`lesson-block ${active === i ? 'is-active' : ''}`}
            onClick={() => playSound(i)}
            title="Hear this sound"
          >
            <span className="block-letters">{phoneme.text}</span>
            {phoneme.soundLabel && <span className="block-sound">{phoneme.soundLabel}</span>}
          </button>
        ))}
      </div>

      <button className="lesson-action" onClick={playAll}>
        🔊 {solved ? `Blend & read: “${question.word}”` : 'Hear the sounds in a row'}
      </button>

      <div className="lesson-choices">
        {options.map(option => (
          <button
            key={option.id}
            className={`lesson-choice ${wrongId === option.id ? 'is-wrong' : ''} ${
              solved && option.isCorrect ? 'is-right' : ''
            }`}
            disabled={solved}
            onClick={() =>
              choose(option.id, option.isCorrect, onEnd => pronunciation.speakText(option.text, { onEnd }))
            }
            aria-label={option.text}
          >
            <span className="choice-emoji">{option.imageEmoji}</span>
            {/* named once found: written, it could be matched letter for letter without blending */}
            {solved && <span className="choice-label">{option.text}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};
