import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { StoryQuiz, StoryReadQuestion } from '@/types/reading';
import type { GameApi } from '../../engine/types';
import { shuffle } from '../../engine/content';
import { soundManager } from '@/utils/audio';
import { pronunciation, type SpeechPart } from '@/utils/pronunciation';
import { ChunkyButton, Choice, PaperCard } from '@/components/kit';
import { TRY_FIRST, choiceState, useAnswer, usePrompt } from '../shared/lessonHooks';
import { cx } from '@/utils/cx';
import kit from '../shared/LessonKit.module.scss';
import styles from './StoryReader.module.scss';

/** Said from the second wrong answer when a story has no hint of its own. */
const STORY_HINT = { text: 'Peek back at the story. Tap a line and I will read it to you.' };

/** After a right answer that isn't the story's last: Luna's "because", then the next question. */
const NEXT_QUESTION_MS = 2600;

/**
 * Read a short story, then answer its questions about it, one after another
 * (CUR-22a: 4 a story). The child reads it first; once they have answered,
 * any line or word is read aloud on tap, and before then a word tapped gets
 * Luna's nudge to try first (CUR-14). Each right answer is a step on the
 * bar; the last one wins the round.
 */
export const StoryReader: React.FC<{ question: StoryReadQuestion; api: GameApi }> = ({ question, api }) => {
  const [step, setStep] = useState(0);
  // a right answer before the last opens the story too (CUR-14's rule)
  const [answeredOne, setAnsweredOne] = useState(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const next = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(next.current), []);

  const quizzes = question.questions;
  const last = step === quizzes.length - 1;
  const tried = answeredOne || api.attempts > 0;

  const instruction = question.speechPrompt ?? question.prompt;
  usePrompt(() => soundManager.speak(instruction), api, instruction);

  const readLine = (index: number) => {
    soundManager.playLetterTap();
    setActiveLine(index);
    // at the speed picked in Settings: a fixed rate here always played Normal (BUG-8)
    pronunciation.speakSentence(question.sentences[index].text, { onEnd: () => setActiveLine(null) });
  };

  const readWord = (word: string, key: string) => {
    soundManager.playPop();
    if (!tried) return api.say(TRY_FIRST.text);
    setActiveWord(key);
    pronunciation.speakWord(word.replace(/[^a-zA-Z0-9]/g, ''), { onEnd: () => setActiveWord(null) });
  };

  const stepOn = (say: SpeechPart[]) => {
    setAnsweredOne(true);
    // the answer's "because", said before the bar moves on (FB-1)
    api.tick({ say });
    next.current = window.setTimeout(() => setStep(s => s + 1), NEXT_QUESTION_MS);
  };

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

      {/* a fresh question each step: its own answers, misses and "show me" */}
      <Quiz key={step} quiz={quizzes[step]} api={api} hint={question.hint} onRight={last ? undefined : stepOn} />
    </div>
  );
};

/** One question about the story, and its three answers. */
const Quiz: React.FC<{ quiz: StoryQuiz; api: GameApi; hint?: string; onRight?: (say: SpeechPart[]) => void }> = ({
  quiz,
  api,
  hint,
  onRight
}) => {
  const answers = useMemo(
    () => shuffle(quiz.options.map((text, i) => ({ id: String(i), text, isCorrect: i === quiz.correctIndex }))),
    [quiz]
  );
  const { solved, wrongId, revealed, choose } = useAnswer(api, hint ?? STORY_HINT.text, onRight);

  return (
    <>
      <ChunkyButton variant="prompt" icon="speaker" onClick={() => pronunciation.speakSentence(quiz.question)}>
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
    </>
  );
};
