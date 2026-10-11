import React, { useMemo, useState } from 'react';
import type { SentenceComprehensionQuestion } from '@/types/reading';
import type { GameApi } from '../../engine/types';
import { shuffle } from '../../engine/content';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { PromptChip } from '../shared/LessonKit';
import { useAnswer, usePrompt } from '../shared/lessonHooks';
import { dataState } from '@/utils/cx';
import kit from '../shared/LessonKit.module.scss';

/** Read a sentence, any word of it tappable, and find the picture it describes. */
export const SentenceReader: React.FC<{ question: SentenceComprehensionQuestion; api: GameApi }> = ({
  question,
  api
}) => {
  const options = useMemo(() => shuffle(question.options), [question.options]);
  const { solved, tried, wrongId, choose } = useAnswer(api, question.hint);
  const [active, setActive] = useState<number | null>(null);

  const sayPrompt = () => soundManager.speak(question.speechPrompt ?? question.prompt);
  usePrompt(sayPrompt);

  const words = question.sentence.split(' ');
  const keys = new Set((question.highlightWords ?? []).map(w => w.toLowerCase()));

  return (
    <div className={kit.lesson}>
      <PromptChip text={question.prompt} onClick={sayPrompt} />

      <div className={kit.lessonCard}>
        <div className={kit.lessonSentence}>
          {words.map((word, i) => {
            // the reader keeps apostrophes; the inventory renders both spellings
            const clean = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '');
            return (
              <button
                key={`${word}-${i}`}
                className={kit.lessonWordChip}
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
        <button
          className={kit.lessonAction}
          disabled={!tried}
          onClick={() => {
            soundManager.playPop();
            pronunciation.speakSentence(question.sentence);
          }}
          title={tried ? undefined : 'Try it first!'}
        >
          🔊 Hear the sentence
        </button>
      </div>

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
            {option.imageEmoji ? <span className={kit.choiceEmoji}>{option.imageEmoji}</span> : null}
            {/* a written label repeats the sentence's words, so it waits for the answer */}
            {(solved || !option.imageEmoji) && <span className={kit.choiceLabel}>{option.text}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};
