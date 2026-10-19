import React, { useMemo } from 'react';
import type { ReadAndMatchQuestion } from '@/types/reading';
import type { GameApi } from '../../engine/types';
import { shuffle } from '../../engine/content';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { ChunkyButton, Choice, PaperCard } from '@/components/kit';
import { choiceState, useAnswer, usePrompt } from '../shared/lessonHooks';
import kit from '../shared/LessonKit.module.scss';

/** Read a word, find its picture. */
export const ReadAndMatch: React.FC<{ question: ReadAndMatchQuestion; api: GameApi }> = ({ question, api }) => {
  const options = useMemo(() => shuffle(question.options), [question.options]);
  const { solved, wrongId, revealed, choose } = useAnswer(api, question.hint);

  // the word is the child's to read: Luna never says it until it is found
  const sayPrompt = () => soundManager.speak(question.speechPrompt ?? 'Read the word, then find its picture.');
  usePrompt(sayPrompt, api);

  return (
    <div className={kit.lesson}>
      <PaperCard>
        <button
          className={kit.card}
          onClick={() => {
            if (!solved) return;
            soundManager.playPop();
            pronunciation.speakWord(question.word);
          }}
          title={solved ? 'Hear the word' : undefined}
        >
          <span className={kit.cardWord}>{question.word.toUpperCase()}</span>
          {solved && <span className={kit.cardTap}>tap to hear it</span>}
        </button>
      </PaperCard>
      <ChunkyButton variant="prompt" icon="speaker" onClick={sayPrompt}>
        {question.prompt}
      </ChunkyButton>

      <div className={kit.choices}>
        {options.map(option => (
          <Choice
            key={option.id}
            kind="picture"
            data-shot="lesson-choice"
            state={choiceState(option.id, option.isCorrect, wrongId, solved, revealed)}
            onClick={() =>
              choose(option.id, option.isCorrect, [{ text: option.text }])
            }
            aria-label={option.text}
            // named once found: written, it would be matched to the word letter for letter
            caption={solved ? option.text : undefined}
          >
            {option.imageEmoji}
          </Choice>
        ))}
      </div>
    </div>
  );
};
