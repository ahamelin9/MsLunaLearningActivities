import React, { useMemo, useState } from 'react';
import type { StoryReadQuestion } from '../../../types/reading';
import type { GameApi } from '../engine/types';
import { shuffle } from '../engine/content';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { PromptChip } from './LessonKit';
import { useAnswer, usePrompt } from './lessonHooks';

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
  const { solved, tried, wrongId, choose } = useAnswer(api, question.hint ?? STORY_HINT.text);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [activeWord, setActiveWord] = useState<string | null>(null);

  usePrompt(() => soundManager.speak(question.speechPrompt ?? question.prompt));

  const readLine = (index: number) => {
    soundManager.playLetterTap();
    setActiveLine(index);
    pronunciation.speakSentence(question.sentences[index].text, { rate: 0.9, onEnd: () => setActiveLine(null) });
  };

  const readWord = (word: string, key: string) => {
    soundManager.playPop();
    setActiveWord(key);
    pronunciation.speakWord(word.replace(/[^a-zA-Z0-9]/g, ''), { rate: 0.85, onEnd: () => setActiveWord(null) });
  };

  const sayQuestion = () => pronunciation.speakSentence(quiz.question);

  return (
    <div className="lesson">
      <div className="lesson-story">
        <div className="story-head">
          <span className="story-emoji">{question.imageEmoji}</span>
          <span className="story-title">{question.title}</span>
          <button
            className="lesson-action"
            disabled={!tried}
            onClick={() => {
              soundManager.playPop();
              // line by line: each line is a clip, the whole story glued together is not
              pronunciation.speakSequence(question.sentences.map(s => ({ text: s.text })));
            }}
            title={tried ? undefined : 'Try it first!'}
          >
            🔊 Read me the whole story
          </button>
        </div>

        {question.sentences.map((sentence, s) => (
          <div key={sentence.id} className={`story-line ${activeLine === s ? 'is-active' : ''}`}>
            <button
              className="line-play"
              disabled={!tried}
              onClick={() => readLine(s)}
              title="Read this line"
              aria-label="Read this line"
            >
              🔊
            </button>
            <span className="lesson-sentence">
              {sentence.text.split(' ').map((word, w) => {
                const key = `${s}-${w}`;
                return (
                  <button
                    key={key}
                    className={`lesson-word-chip ${activeWord === key ? 'is-active' : ''}`}
                    onClick={() => readWord(word, key)}
                  >
                    {word}
                  </button>
                );
              })}
            </span>
          </div>
        ))}
      </div>

      <PromptChip text={quiz.question} onClick={sayQuestion} />

      <div className="lesson-answers">
        {answers.map(answer => (
          <button
            key={answer.id}
            className={`lesson-answer ${wrongId === answer.id ? 'is-wrong' : ''} ${
              solved && answer.isCorrect ? 'is-right' : ''
            }`}
            disabled={solved}
            onClick={() =>
              choose(answer.id, answer.isCorrect, onEnd =>
                // a right answer is followed by why it is right
                answer.isCorrect
                  ? pronunciation.speakSentence(quiz.explanation, { onEnd })
                  : pronunciation.speakSentence(answer.text, { onEnd })
              )
            }
          >
            {answer.text}
          </button>
        ))}
      </div>
    </div>
  );
};
