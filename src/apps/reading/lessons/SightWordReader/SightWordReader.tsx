import React, { useMemo } from 'react';
import type { SightWordReaderQuestion } from '@/types/reading';
import type { GameApi } from '../../engine/types';
import { shuffle } from '../../engine/content';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { ChunkyButton, Choice, ListenCue, PaperCard } from '@/components/kit';
import { choiceState, useAnswer, usePrompt } from '../shared/lessonHooks';
import kit from '../shared/LessonKit.module.scss';

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
    <div className={kit.lesson}>
      <ListenCue
        state={solved ? 'found' : 'waiting'}
        kind="word"
        answer={question.word}
        onClick={() => {
          soundManager.playLetterTap();
          pronunciation.speakWord(question.word);
        }}
      />
      <ChunkyButton variant="prompt" icon="speaker" onClick={sayPrompt}>
        {question.prompt}
      </ChunkyButton>

      <div className={kit.choices}>
        {options.map(option => (
          <Choice
            key={option.id}
            kind="word"
            data-shot="lesson-choice"
            state={choiceState(option.id, option.isCorrect, wrongId, solved)}
            onClick={() =>
              choose(option.id, option.isCorrect, onEnd => pronunciation.speakWord(option.word, { onEnd }))
            }
          >
            {option.word}
          </Choice>
        ))}
      </div>

      {solved && question.exampleSentence && (
        <PaperCard>
          <button
            className={kit.card}
            onClick={() => {
              soundManager.playPop();
              pronunciation.speakSentence(question.exampleSentence);
            }}
          >
            <span className={kit.sentence}>
              {sentence.map(({ token, isKey, i }) => (
                <span key={i} className={kit.word} data-state={isKey ? 'key' : undefined}>
                  {token}
                </span>
              ))}
            </span>
            <span className={kit.cardTap}>tap to hear it</span>
          </button>
        </PaperCard>
      )}
    </div>
  );
};
