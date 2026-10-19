import React, { useMemo } from 'react';
import type { RhymeMatchQuestion } from '@/types/reading';
import type { GameApi } from '../../engine/types';
import { shuffle } from '../../engine/content';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { ChunkyButton, Choice, PaperCard } from '@/components/kit';
import { choiceState, useAnswer, usePrompt } from '../shared/lessonHooks';
import kit from '../shared/LessonKit.module.scss';

/**
 * Which picture rhymes? Rhyme is heard: the choices are pictures, named once
 * found, because written "hat" is just matched to "cat" by its last letters.
 */
export const RhymeMatch: React.FC<{ question: RhymeMatchQuestion; api: GameApi }> = ({ question, api }) => {
  const options = useMemo(() => shuffle(question.options), [question.options]);
  const { solved, wrongId, revealed, choose } = useAnswer(api, question.hint);

  const sayPrompt = () => soundManager.speak(question.speechPrompt ?? question.prompt);
  usePrompt(sayPrompt);

  return (
    <div className={kit.lesson}>
      <PaperCard>
        <button
          className={kit.card}
          onClick={() => {
            soundManager.playPop();
            pronunciation.speakWord(question.targetWord);
          }}
          title="Hear the word"
        >
          <span className={kit.cardPicture}>{question.targetEmoji}</span>
          <span className={kit.cardWord}>{question.targetWord}</span>
          <span className={kit.cardTap}>tap to listen</span>
        </button>
      </PaperCard>
      <ChunkyButton variant="prompt" icon="speaker" onClick={sayPrompt}>
        {question.prompt}
      </ChunkyButton>

      <div className={kit.choices}>
        {options.map(option => (
          <Choice
            key={option.word}
            kind="picture"
            data-shot="lesson-choice"
            state={choiceState(option.word, option.isRhyme, wrongId, solved, revealed)}
            onClick={() =>
              choose(option.word, option.isRhyme, [{ word: option.word }])
            }
            aria-label={option.word}
            caption={solved ? option.word : undefined}
          >
            {option.emoji}
          </Choice>
        ))}
      </div>
    </div>
  );
};
