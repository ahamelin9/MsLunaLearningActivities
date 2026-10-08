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

  const sayPrompt = () => {
    if (question.speechPrompt) soundManager.speak(question.speechPrompt);
    else pronunciation.speakSequence([{ text: 'Read the word' }, { word: question.word }]);
  };
  usePrompt(sayPrompt);

  return (
    <div className="lesson">
      <button
        className="lesson-card is-button"
        onClick={() => {
          soundManager.playPop();
          pronunciation.speakWord(question.word);
        }}
        title="Hear the word"
      >
        <span className="card-word">{question.word.toUpperCase()}</span>
        {question.phonemes && question.phonemes.length > 0 && (
          <span className="lesson-phonemes">
            {question.phonemes.map((ph, i) => (
              <span key={i}>{ph}</span>
            ))}
          </span>
        )}
        <span className="card-tap">tap to listen</span>
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
