import React, { useMemo } from 'react';
import type { ReadAndMatchQuestion } from '../../../types/reading';
import type { GameApi } from '../engine/types';
import { shuffle } from '../engine/content';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { PromptChip } from './LessonKit';
import { useAnswer, usePrompt } from './lessonHooks';

/** Read a word, find its picture. */
export const ReadAndMatch: React.FC<{ question: ReadAndMatchQuestion; api: GameApi }> = ({ question, api }) => {
  const options = useMemo(() => shuffle(question.options), [question.options]);
  const { solved, wrongId, choose } = useAnswer(api, question.hint);

  // the word is the child's to read: Luna never says it until it is found
  const sayPrompt = () => soundManager.speak(question.speechPrompt ?? 'Read the word, then find its picture.');
  usePrompt(sayPrompt);

  return (
    <div className="lesson">
      <button
        className={`lesson-card ${solved ? 'is-button' : ''}`}
        onClick={() => {
          if (!solved) return;
          soundManager.playPop();
          pronunciation.speakWord(question.word);
        }}
        title={solved ? 'Hear the word' : undefined}
      >
        <span className="card-word">{question.word.toUpperCase()}</span>
        {solved && <span className="card-tap">tap to hear it</span>}
      </button>
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
              choose(option.id, option.isCorrect, onEnd => pronunciation.speakText(option.text, { onEnd }))
            }
            aria-label={option.text}
          >
            <span className="choice-emoji">{option.imageEmoji}</span>
            {/* named once found: written, it would be matched to the word letter for letter */}
            {solved && <span className="choice-label">{option.text}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};
