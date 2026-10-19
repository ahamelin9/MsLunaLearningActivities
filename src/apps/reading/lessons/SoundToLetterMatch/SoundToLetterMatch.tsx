import React, { useMemo } from 'react';
import type { SoundToLetterQuestion } from '@/types/reading';
import type { GameApi } from '../../engine/types';
import { shuffle } from '../../engine/content';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { ChunkyButton, Choice, ListenCue } from '@/components/kit';
import { choiceState, useAnswer, usePrompt } from '../shared/lessonHooks';
import kit from '../shared/LessonKit.module.scss';

/** Hear a sound, find the letter that makes it. The sound is never written. */
export const SoundToLetterMatch: React.FC<{ question: SoundToLetterQuestion; api: GameApi }> = ({
  question,
  api
}) => {
  const options = useMemo(() => shuffle(question.options), [question.options]);
  const { solved, wrongId, revealed, choose } = useAnswer(api, question.hint);

  // the written prompt never names the sound; only the spoken one does
  const sayPrompt = () => {
    if (question.speechPrompt) soundManager.speak(question.speechPrompt);
    else pronunciation.speakSequence([{ text: 'What letter makes the sound' }, { sound: question.targetLetter }]);
  };
  usePrompt(sayPrompt);

  return (
    <div className={kit.lesson}>
      <ListenCue
        state={solved ? 'found' : 'waiting'}
        answer={question.targetLetter}
        onClick={() => {
          soundManager.playLetterTap();
          pronunciation.speakLetterSound(question.targetLetter);
        }}
      />
      <ChunkyButton variant="prompt" icon="speaker" onClick={sayPrompt}>
        {question.prompt}
      </ChunkyButton>

      <div className={kit.choices}>
        {options.map(option => (
          <Choice
            key={option.id}
            data-shot="lesson-choice"
            state={choiceState(option.id, option.isCorrect, wrongId, solved, revealed)}
            onClick={() =>
              choose(option.id, option.isCorrect, [{ text: 'Letter' }, { name: option.letter }])
            }
            aria-label={`letter ${option.letter}`}
          >
            {option.letter}
          </Choice>
        ))}
      </div>
    </div>
  );
};
