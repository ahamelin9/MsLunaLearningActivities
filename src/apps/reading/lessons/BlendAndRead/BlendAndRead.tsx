import React, { useMemo, useState } from 'react';
import type { BlendAndReadQuestion } from '@/types/reading';
import type { GameApi } from '../../engine/types';
import { shuffle } from '../../engine/content';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { ChunkyButton, Choice } from '@/components/kit';
import { choiceState, useAnswer, usePrompt } from '../shared/lessonHooks';
import kit from '../shared/LessonKit.module.scss';
import styles from './BlendAndRead.module.scss';

/** Sound out the letters, blend them, find the picture. */
export const BlendAndRead: React.FC<{ question: BlendAndReadQuestion; api: GameApi }> = ({ question, api }) => {
  const options = useMemo(() => shuffle(question.options), [question.options]);
  const { solved, wrongId, revealed, choose } = useAnswer(api, question.hint);
  const [active, setActive] = useState<number | null>(null);

  const sayPrompt = () => soundManager.speak(question.speechPrompt ?? 'Blend the sounds to read the word!');
  usePrompt(sayPrompt);

  const playSound = (index: number) => {
    soundManager.playLetterTap();
    setActive(index);
    pronunciation.speakLetterSound(question.phonemes[index].spokenSound, { onEnd: () => setActive(null) });
  };

  // Until the child has blended it, this plays the sounds in a row and leaves
  // the blending to them; saying the word would hand them the answer.
  const playAll = () => {
    soundManager.playPop();
    if (solved) pronunciation.speakWord(question.word);
    else pronunciation.speakSequence(question.phonemes.map(p => ({ sound: p.spokenSound })));
  };

  return (
    <div className={kit.lesson}>
      <ChunkyButton variant="prompt" icon="speaker" onClick={sayPrompt}>
        {question.prompt}
      </ChunkyButton>

      <div className={styles.blocks}>
        {question.phonemes.map((phoneme, i) => (
          <button
            key={`${phoneme.text}-${i}`}
            className={styles.block}
            data-state={active === i ? 'active' : undefined}
            onClick={() => playSound(i)}
            title="Hear this sound"
          >
            {/* letters only: a phonetic symbol like /æ/ means nothing to a child; the tile says its sound */}
            {phoneme.text}
          </button>
        ))}
      </div>

      <ChunkyButton variant="prompt" icon="speaker" onClick={playAll}>
        {solved ? `Blend & read: “${question.word}”` : 'Hear the sounds in a row'}
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
            // named once found: written, it could be matched letter for letter without blending
            caption={solved ? option.text : undefined}
          >
            {option.imageEmoji}
          </Choice>
        ))}
      </div>
    </div>
  );
};
