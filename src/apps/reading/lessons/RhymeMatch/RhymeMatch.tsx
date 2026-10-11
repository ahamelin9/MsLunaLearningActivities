import React, { useMemo } from 'react';
import type { RhymeMatchQuestion } from '@/types/reading';
import type { GameApi } from '../../engine/types';
import { shuffle } from '../../engine/content';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { PromptChip } from '../shared/LessonKit';
import { useAnswer, usePrompt } from '../shared/lessonHooks';
import { dataState } from '@/utils/cx';
import kit from '../shared/LessonKit.module.scss';

/**
 * Which picture rhymes? Rhyme is heard: the choices are pictures, named once
 * found, because written "hat" is just matched to "cat" by its last letters.
 */
export const RhymeMatch: React.FC<{ question: RhymeMatchQuestion; api: GameApi }> = ({ question, api }) => {
  const options = useMemo(() => shuffle(question.options), [question.options]);
  const { solved, wrongId, choose } = useAnswer(api, question.hint);

  const sayPrompt = () => soundManager.speak(question.speechPrompt ?? question.prompt);
  usePrompt(sayPrompt);

  return (
    <div className={kit.lesson}>
      <button
        className={kit.lessonCard} data-state="button"
        onClick={() => {
          soundManager.playPop();
          pronunciation.speakWord(question.targetWord);
        }}
        title="Hear the word"
      >
        <span className={kit.cardEmoji}>{question.targetEmoji}</span>
        <span className={kit.cardWord}>{question.targetWord}</span>
        <span className={kit.cardTap}>tap to listen</span>
      </button>
      <PromptChip text={question.prompt} onClick={sayPrompt} />

      <div className={kit.lessonChoices}>
        {options.map(option => (
          <button
            key={option.word}
            data-shot="lesson-choice"
            className={kit.lessonChoice}
            data-state={dataState(wrongId === option.word ? 'wrong' : false, solved && option.isRhyme ? 'right' : false)}
            disabled={solved}
            onClick={() =>
              choose(option.word, option.isRhyme, onEnd => pronunciation.speakWord(option.word, { onEnd }))
            }
            aria-label={option.word}
          >
            <span className={kit.choiceEmoji}>{option.emoji}</span>
            {solved && <span className={kit.choiceLabel}>{option.word}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};
