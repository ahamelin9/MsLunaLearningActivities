import React, { useMemo, useState } from 'react';
import type { StoryReadQuestion } from '@/types/reading';
import type { GameApi } from '../../engine/types';
import { shuffle } from '../../engine/content';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { ChunkyButton, Choice, PaperCard } from '@/components/kit';
import { choiceState, useAnswer, usePrompt } from '../shared/lessonHooks';
import { cx } from '@/utils/cx';
import kit from '../shared/LessonKit.module.scss';
import styles from './StoryReader.module.scss';

/** Said from the second wrong answer when a story has no hint of its own. */
const STORY_HINT = { text: 'Peek back at the story. Tap a line and I will read it to you.' };

/**
 * Read a short story, then answer one question about it. The child reads it
 * first; once they have answered, any line is read aloud on tap. A single
 * word can be tapped any time.
 */
export const StoryReader: React.FC<{ question: StoryReadQuestion; api: GameApi }> = ({ question, api }) => {
  const quiz = question.comprehensionQuestion;
  const answers = useMemo(
    () => shuffle(quiz.options.map((text, i) => ({ id: String(i), text, isCorrect: i === quiz.correctIndex }))),
    [quiz]
  );
  const { solved, tried, wrongId, revealed, choose } = useAnswer(api, question.hint ?? STORY_HINT.text);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [activeWord, setActiveWord] = useState<string | null>(null);

  usePrompt(() => soundManager.speak(question.speechPrompt ?? question.prompt));

  const readLine = (index: number) => {
    soundManager.playLetterTap();
    setActiveLine(index);
    // at the speed picked in Settings: a fixed rate here always played Normal (BUG-8)
    pronunciation.speakSentence(question.sentences[index].text, { onEnd: () => setActiveLine(null) });
  };

  const readWord = (word: string, key: string) => {
    soundManager.playPop();
    setActiveWord(key);
    pronunciation.speakWord(word.replace(/[^a-zA-Z0-9]/g, ''), { onEnd: () => setActiveWord(null) });
  };

  const sayQuestion = () => pronunciation.speakSentence(quiz.question);

  return (
    <div className={kit.lesson}>
      <PaperCard className={styles.story}>
        <div className={styles.head}>
          <span className={styles.picture}>{question.imageEmoji}</span>
          <span className={styles.title}>{question.title}</span>
          <ChunkyButton
            variant="prompt"
            icon="speaker"
            disabled={!tried}
            onClick={() => {
              soundManager.playPop();
              // line by line: each line is a clip, the whole story glued together is not
              pronunciation.speakSequence(question.sentences.map(s => ({ text: s.text })));
            }}
            title={tried ? undefined : 'Try it first!'}
          >
            Read me the whole story
          </ChunkyButton>
        </div>

        {question.sentences.map((sentence, s) => (
          <div key={sentence.id} className={styles.line} data-state={activeLine === s ? 'active' : undefined}>
            <ChunkyButton
              variant="icon"
              icon="speaker"
              disabled={!tried}
              onClick={() => readLine(s)}
              title="Read this line"
              aria-label="Read this line"
            />
            <span className={cx(kit.sentence, styles.sentence)}>
              {sentence.text.split(' ').map((word, w) => {
                const key = `${s}-${w}`;
                return (
                  <button
                    key={key}
                    className={kit.word}
                    data-state={activeWord === key ? 'active' : undefined}
                    onClick={() => readWord(word, key)}
                  >
                    {word}
                  </button>
                );
              })}
            </span>
          </div>
        ))}
      </PaperCard>

      <ChunkyButton variant="prompt" icon="speaker" onClick={sayQuestion}>
        {quiz.question}
      </ChunkyButton>

      <div className={kit.choices}>
        {answers.map(answer => (
          <Choice
            key={answer.id}
            kind="phrase"
            data-shot="lesson-choice"
            state={choiceState(answer.id, answer.isCorrect, wrongId, solved, revealed)}
            onClick={() =>
              choose(
                answer.id,
                answer.isCorrect,
                // a right answer is followed by why it is right
                [{ text: answer.isCorrect ? quiz.explanation : answer.text }]
              )
            }
          >
            {answer.text}
          </Choice>
        ))}
      </div>
    </div>
  );
};
