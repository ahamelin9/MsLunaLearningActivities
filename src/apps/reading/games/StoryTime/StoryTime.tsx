import React, { useEffect, useMemo, useState } from 'react';
import type { GameApi, GameDef } from '../../engine/types';
import { MINI_STORIES, pick, shuffle, tierFor, type MiniStory } from '../../engine/content';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { ChunkyButton } from '@/components/kit';
import { StagePrompt } from '../shared/StagePrompt/StagePrompt';
import { GameSurface } from '../shared/GameSurface/GameSurface';
import { cx, dataState } from '@/utils/cx';
import styles from './StoryTime.module.scss';

interface Round {
  story: MiniStory;
  /** a word the child must find inside the passage */
  hunt: string;
}

const SKIP = new Set([
  'the', 'a', 'and', 'was', 'is', 'it', 'in', 'on', 'to', 'her', 'she', 'he', 'his', 'up', 'so', 'all'
]);

function buildRound(story: MiniStory): Round {
  const words = story.lines
    .join(' ')
    .split(/\s+/)
    .map(w => w.replace(/[^a-zA-Z]/g, '').toLowerCase())
    .filter(w => w.length >= 3 && !SKIP.has(w));

  return { story, hunt: pick(words.length > 0 ? words : ['luna']) };
}

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [revealed, setRevealed] = useState(1);
  const [phase, setPhase] = useState<'read' | 'hunt' | 'question'>('read');
  const [foundWord, setFoundWord] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [missedQuestion, setMissedQuestion] = useState(false);

  const story = round.story;
  const allRevealed = revealed >= story.lines.length;

  const answers = useMemo(() => shuffle(story.answers), [story]);

  // Kindergarten is a read-along: every line is read as it appears. From 1st
  // grade the story is the child's to read, as in the lessons: lines stay
  // silent until they have answered the question once, and a wrong answer
  // unlocks them. (A miss in the word hunt doesn't count: nearly every hunt
  // has one, and the question would be a listening one again.) A single word
  // can always be tapped, the way a child would ask the teacher.
  const readAlong = api.ctx.grade === 'kindergarten';
  const tried = answered || missedQuestion;
  const canHearLines = phase !== 'hunt' && (readAlong || tried);

  // The book opens on line 1, so a read-along reads it with the title, the
  // way "Next line" reads every line after it.
  useEffect(() => {
    const t = window.setTimeout(() => {
      pronunciation.speakSequence(readAlong ? [{ text: story.title }, { text: story.lines[0] }] : [{ text: story.title }]);
    }, 500);
    return () => window.clearTimeout(t);
  }, [story, readAlong]);

  const readLine = (index: number) => {
    soundManager.playLetterTap();
    pronunciation.speakSentence(story.lines[index]);
  };

  const sayHunt = () => {
    pronunciation.speakSequence([{ text: 'Now find the word' }, { word: round.hunt }, { text: 'in the story.' }]);
  };

  const turnPage = () => {
    if (allRevealed) {
      setPhase('hunt');
      soundManager.playPop();
      sayHunt();
      return;
    }
    const next = revealed + 1;
    setRevealed(next);
    soundManager.playPop();
    if (readAlong) readLine(next - 1);
  };

  const tapWord = (raw: string) => {
    if (phase !== 'hunt' || foundWord) return;
    const clean = raw.replace(/[^a-zA-Z]/g, '').toLowerCase();
    pronunciation.speakWord(clean);

    if (clean === round.hunt) {
      setFoundWord(true);
      soundManager.playCorrect();
      api.tick({ lunaLine: 'Found it! Right there in the middle of the page.' });
      window.setTimeout(() => {
        setPhase('question');
        pronunciation.speakSentence(story.question);
      }, 1100);
    } else {
      api.miss({
        hint: [{ text: 'You are looking for' }, { word: round.hunt }, { text: 'Read each line slowly with your finger.' }]
      });
    }
  };

  const answer = (text: string, correct: boolean) => {
    if (api.locked || answered) return;
    pronunciation.speakSentence(text);

    if (correct) {
      setAnswered(true);
      api.win({ delay: 2100 });
    } else {
      setWrongAnswer(text);
      setMissedQuestion(true);
      window.setTimeout(() => setWrongAnswer(null), 600);
      api.miss({ hint: [{ text: 'Peek back at the story — the answer is hiding in one of the lines.' }] });
    }
  };

  return (
    <GameSurface className={styles.story}>
      <div className={styles.storybook}>
        <div className={styles.bookSpine} aria-hidden="true" />

        <div className={cx(styles.bookPage, styles.left)}>
          <span className={styles.storyEmoji}>{story.emoji}</span>
          <h3 className={styles.storyTitle}>{story.title}</h3>
          {/* the word is heard, not shown: written here, the hunt is matching
              letters rather than reading the story */}
          {phase === 'hunt' && (
            <p className={styles.huntTask}>
              {foundWord ? (
                <>
                  Found it: <strong>{round.hunt}</strong>
                </>
              ) : (
                <>
                  Find the word I say{' '}
                  <ChunkyButton
                    variant="prompt"
                    icon="speaker"
                    onClick={() => {
                      soundManager.playLetterTap();
                      sayHunt();
                    }}
                  >
                    Hear it
                  </ChunkyButton>
                </>
              )}
            </p>
          )}
        </div>

        <div className={cx(styles.bookPage, styles.right)}>
          {story.lines.slice(0, revealed).map((line, i) => (
            <p
              key={i}
              className={styles.storyLine}
              data-state={phase === 'hunt' ? 'huntable' : undefined}
              onClick={() => canHearLines && readLine(i)}
            >
              {line.split(' ').map((word, wi) => {
                const clean = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
                const isFound = foundWord && clean === round.hunt;
                return (
                  <span
                    key={wi}
                    className={styles.storyWord}
                    data-state={isFound ? 'found' : undefined}
                    onClick={e => {
                      if (phase === 'hunt') {
                        e.stopPropagation();
                        tapWord(word);
                      } else if (!canHearLines) {
                        // the line is still the child's to read; one word is fine
                        e.stopPropagation();
                        pronunciation.speakWord(word.replace(/[^a-zA-Z']/g, ''));
                      }
                    }}
                  >
                    {word}{' '}
                  </span>
                );
              })}
            </p>
          ))}

          {phase === 'question' && (
            <ChunkyButton
              variant="prompt"
              icon="speaker"
              className={styles.pageChip}
              disabled={!canHearLines}
              title={canHearLines ? 'Hear the story' : 'Try it first!'}
              onClick={() => {
                soundManager.playLetterTap();
                // line by line: each line is a clip, the whole story glued together is not
                pronunciation.speakSequence(story.lines.map(text => ({ text })));
              }}
            >
              Read me the story
            </ChunkyButton>
          )}

          {phase === 'read' && (
            <button className={styles.pageTurn} onClick={turnPage}>
              {allRevealed ? 'I have read it! →' : 'Next line →'}
            </button>
          )}
        </div>
      </div>

      {phase === 'question' && (
        <div className={styles.storyQuestion}>
          <StagePrompt>{story.question}</StagePrompt>
          <div className={styles.storyAnswers}>
            {answers.map(a => (
              <button
                key={a.text}
                className={styles.storyAnswer}
                data-state={dataState(wrongAnswer === a.text ? 'wrong' : false, answered && a.correct ? 'right' : false)}
                onClick={() => answer(a.text, a.correct)}
              >
                {a.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </GameSurface>
  );
};

export const storyTime: GameDef<Round> = {
  id: 'story-time',
  title: 'Story Corner',
  emoji: '📗',
  tagline: 'Read a tiny story, hunt a word, answer one question.',
  objective: 'Reading comprehension and locating a target word inside a passage.',
  skill: 'reading',
  mission: 'Snuggle in. This one is short, I promise.',
  roundsPerPlay: 2,
  shape: 'book',
  sticker: 'book',
  makeRounds: ({ grade, difficulty, count }) => {
    const tier = tierFor(grade, difficulty);
    const preferred = MINI_STORIES.filter(s => s.tier <= tier);
    const ordered = shuffle(preferred.length > 0 ? preferred : MINI_STORIES);
    return Array.from({ length: count }, (_, i) => buildRound(ordered[i % ordered.length]));
  },
  Play
};
