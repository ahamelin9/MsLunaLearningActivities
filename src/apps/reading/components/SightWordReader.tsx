import React, { useMemo } from 'react';
import type { SightWordReaderQuestion } from '../../../types/reading';
import type { GameApi } from '../engine/types';
import { shuffle } from '../engine/content';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { ListenCue, PromptChip } from './LessonKit';
import { useAnswer, usePrompt } from './lessonHooks';

/**
 * Hear a sight word, read it among others. It is not shown until found: the
 * choices are words, so showing it would turn reading into matching letters.
 */
export const SightWordReader: React.FC<{ question: SightWordReaderQuestion; api: GameApi }> = ({
  question,
  api
}) => {
  const options = useMemo(() => shuffle(question.options), [question.options]);
  const { solved, wrongId, choose } = useAnswer(api, question.hint);

  // the written prompt never names the word; only the spoken one does
  const sayPrompt = () => {
    if (question.speechPrompt) soundManager.speak(question.speechPrompt);
    else pronunciation.speakSequence([{ text: 'Find the word' }, { word: question.word }]);
  };
  usePrompt(sayPrompt);

  // the example sentence is the reward once the word is found, the word in it marked
  const sentence = question.exampleSentence.split(/\s+/).map((token, i) => ({
    token,
    isKey: token.replace(/[^a-zA-Z']/g, '').toLowerCase() === question.word.toLowerCase(),
    i
  }));

  return (
    <div className="lesson">
      <ListenCue
        answer={solved ? question.word : null}
        onClick={() => {
          soundManager.playLetterTap();
          pronunciation.speakWord(question.word);
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
              choose(option.id, option.isCorrect, onEnd => pronunciation.speakWord(option.word, { onEnd }))
            }
          >
            <span className="choice-word">{option.word}</span>
          </button>
        ))}
      </div>

      {solved && question.exampleSentence && (
        <button
          className="lesson-card is-button"
          onClick={() => {
            soundManager.playPop();
            pronunciation.speakSentence(question.exampleSentence);
          }}
        >
          <span className="lesson-sentence">
            {sentence.map(({ token, isKey, i }) => (
              <span key={i} className={`lesson-word-chip ${isKey ? 'is-key' : ''}`}>
                {token}
              </span>
            ))}
          </span>
          <span className="card-tap">tap to hear it</span>
        </button>
      )}
    </div>
  );
};
