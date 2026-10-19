import React, { useMemo, useState } from 'react';
import type { SentenceComprehensionQuestion } from '@/types/reading';
import type { GameApi } from '../../engine/types';
import { shuffle } from '../../engine/content';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { ChunkyButton, Choice, PaperCard } from '@/components/kit';
import { choiceState, useAnswer, usePrompt } from '../shared/lessonHooks';
import { dataState } from '@/utils/cx';
import kit from '../shared/LessonKit.module.scss';

/** Read a sentence, any word of it tappable, and find the picture it describes. */
export const SentenceReader: React.FC<{ question: SentenceComprehensionQuestion; api: GameApi }> = ({
  question,
  api
}) => {
  const options = useMemo(() => shuffle(question.options), [question.options]);
  const { solved, tried, wrongId, revealed, choose } = useAnswer(api, question.hint);
  const [active, setActive] = useState<number | null>(null);

  const sayPrompt = () => soundManager.speak(question.speechPrompt ?? question.prompt);
  usePrompt(sayPrompt);

  const words = question.sentence.split(' ');
  const keys = new Set((question.highlightWords ?? []).map(w => w.toLowerCase()));

  return (
    <div className={kit.lesson}>
      <ChunkyButton variant="prompt" icon="speaker" onClick={sayPrompt}>
        {question.prompt}
      </ChunkyButton>

      <PaperCard className={kit.card}>
        <div className={kit.sentence}>
          {words.map((word, i) => {
            // the reader keeps apostrophes; the inventory renders both spellings
            const clean = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '');
            return (
              <button
                key={`${word}-${i}`}
                className={kit.word}
                data-state={dataState(keys.has(clean.toLowerCase()) ? 'key' : false, active === i ? 'active' : false)}
                onClick={() => {
                  soundManager.playPop();
                  setActive(i);
                  pronunciation.speakWord(clean, { onEnd: () => setActive(null) });
                }}
              >
                {word}
              </button>
            );
          })}
        </div>
        <ChunkyButton
          variant="prompt"
          icon="speaker"
          disabled={!tried}
          onClick={() => {
            soundManager.playPop();
            pronunciation.speakSentence(question.sentence);
          }}
          title={tried ? undefined : 'Try it first!'}
        >
          Hear the sentence
        </ChunkyButton>
      </PaperCard>

      <div className={kit.choices}>
        {options.map(option => (
          <Choice
            key={option.id}
            // a picture to pick; with no picture, the words themselves
            kind={option.imageEmoji ? 'picture' : 'phrase'}
            data-shot="lesson-choice"
            state={choiceState(option.id, option.isCorrect, wrongId, solved, revealed)}
            onClick={() =>
              choose(option.id, option.isCorrect, [{ text: option.text }])
            }
            aria-label={option.text}
            // a written label repeats the sentence's words, so it waits for the answer
            caption={option.imageEmoji && solved ? option.text : undefined}
          >
            {option.imageEmoji || option.text}
          </Choice>
        ))}
      </div>
    </div>
  );
};
