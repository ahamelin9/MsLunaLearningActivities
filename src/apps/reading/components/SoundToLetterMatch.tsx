import React, { useMemo } from 'react';
import type { SoundToLetterQuestion } from '../../../types/reading';
import type { GameApi } from '../engine/types';
import { shuffle } from '../engine/content';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { ListenCue, PromptChip } from './LessonKit';
import { useAnswer, usePrompt } from './lessonHooks';

/** Hear a sound, find the letter that makes it. The sound is never written. */
export const SoundToLetterMatch: React.FC<{ question: SoundToLetterQuestion; api: GameApi }> = ({
  question,
  api
}) => {
  const options = useMemo(() => shuffle(question.options), [question.options]);
  const { solved, wrongId, choose } = useAnswer(api, question.hint);

  // the written prompt never names the sound; only the spoken one does
  const sayPrompt = () => {
    if (question.speechPrompt) soundManager.speak(question.speechPrompt);
    else pronunciation.speakSequence([{ text: 'What letter makes the sound' }, { sound: question.targetLetter }]);
  };
  usePrompt(sayPrompt);

  return (
    <div className="lesson">
      <ListenCue
        answer={solved ? question.targetLetter : null}
        onClick={() => {
          soundManager.playLetterTap();
          pronunciation.speakLetterSound(question.targetLetter);
        }}
      />
      <PromptChip text={question.prompt} onClick={sayPrompt} />

      <div className="lesson-choices">
        {options.map(option => (
          <button
            key={option.id}
            className={`lesson-choice ${wrongId === option.id ? 'is-wrong' : ''} ${
              solved && option.isCorrect ? 'is-right' : ''
            }`}
            disabled={solved}
            onClick={() =>
              choose(option.id, option.isCorrect, onEnd =>
                pronunciation.speakSequence([{ text: 'Letter' }, { name: option.letter }], { onEnd })
              )
            }
            aria-label={`letter ${option.letter}`}
          >
            <span className="choice-letter">{option.letter}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
