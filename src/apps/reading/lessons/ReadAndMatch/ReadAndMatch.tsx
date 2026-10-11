import React, { useMemo } from 'react';
import type { ReadAndMatchQuestion } from '@/types/reading';
import type { GameApi } from '../../engine/types';
import { shuffle } from '../../engine/content';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { PromptChip } from '../shared/LessonKit';
import { useAnswer, usePrompt } from '../shared/lessonHooks';
import { dataState } from '@/utils/cx';
import kit from '../shared/LessonKit.module.scss';

/** Read a word, find its picture. */
export const ReadAndMatch: React.FC<{ question: ReadAndMatchQuestion; api: GameApi }> = ({ question, api }) => {
  const options = useMemo(() => shuffle(question.options), [question.options]);
  const { solved, wrongId, choose } = useAnswer(api, question.hint);

  // the word is the child's to read: Luna never says it until it is found
  const sayPrompt = () => soundManager.speak(question.speechPrompt ?? 'Read the word, then find its picture.');
  usePrompt(sayPrompt);

  return (
    <div className={kit.lesson}>
      <button
        className={kit.lessonCard}
        data-state={solved ? 'button' : undefined}
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
              choose(option.id, option.isCorrect, onEnd => pronunciation.speakText(option.text, { onEnd }))
            }
            aria-label={option.text}
          >
            <span className={kit.choiceEmoji}>{option.imageEmoji}</span>
            {/* named once found: written, it would be matched to the word letter for letter */}
            {solved && <span className={kit.choiceLabel}>{option.text}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};
