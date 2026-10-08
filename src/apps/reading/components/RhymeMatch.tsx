import React, { useMemo } from 'react';
import type { RhymeMatchQuestion } from '../../../types/reading';
import type { GameApi } from '../engine/types';
import { shuffle } from '../engine/content';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { PromptChip } from './LessonKit';
import { useAnswer, usePrompt } from './lessonHooks';

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
    <div className="lesson">
      <button
        className="lesson-card is-button"
        onClick={() => {
          soundManager.playPop();
          pronunciation.speakWord(question.targetWord);
        }}
        title="Hear the word"
      >
        <span className="card-emoji">{question.targetEmoji}</span>
        <span className="card-word">{question.targetWord}</span>
        <span className="card-tap">tap to listen</span>
      </button>
      <PromptChip text={question.prompt} onClick={sayPrompt} />

      <div className="lesson-choices">
        {options.map(option => (
          <button
            key={option.word}
            className={`lesson-choice ${wrongId === option.word ? 'is-wrong' : ''} ${
              solved && option.isRhyme ? 'is-right' : ''
            }`}
            disabled={solved}
            onClick={() =>
              choose(option.word, option.isRhyme, onEnd => pronunciation.speakWord(option.word, { onEnd }))
            }
            aria-label={option.word}
          >
            <span className="choice-emoji">{option.emoji}</span>
            {solved && <span className="choice-label">{option.word}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};
