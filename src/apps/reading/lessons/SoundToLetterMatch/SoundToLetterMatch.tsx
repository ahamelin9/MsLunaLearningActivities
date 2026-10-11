import React, { useMemo } from 'react';
import type { SoundToLetterQuestion } from '@/types/reading';
import type { GameApi } from '../../engine/types';
import { shuffle } from '../../engine/content';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { ListenCue, PromptChip } from '../shared/LessonKit';
import { useAnswer, usePrompt } from '../shared/lessonHooks';
import { dataState } from '@/utils/cx';
import kit from '../shared/LessonKit.module.scss';

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
    <div className={kit.lesson}>
      <ListenCue
        answer={solved ? question.targetLetter : null}
        onClick={() => {
          soundManager.playLetterTap();
          pronunciation.speakLetterSound(question.targetLetter);
        }}
      />
      <PromptChip text={question.prompt} onClick={sayPrompt} />

      <div className={kit.lessonChoices}>
        {options.map(option => (
          <button
            key={option.id}
            data-shot="lesson-choice"
            className={kit.lessonChoice}
            data-state={dataState(wrongId === option.id ? 'wrong' : false, solved && option.isCorrect ? 'right' : false)}
            disabled={solved}
            onClick={() =>
              choose(option.id, option.isCorrect, onEnd =>
                pronunciation.speakSequence([{ text: 'Letter' }, { name: option.letter }], { onEnd })
              )
            }
            aria-label={`letter ${option.letter}`}
          >
            <span className={kit.choiceLetter}>{option.letter}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
