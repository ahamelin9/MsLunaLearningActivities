import React, { useEffect, useMemo, useState } from 'react';
import type { GameApi, GameDef } from '../../engine/types';
import { MINI_STORIES, pick, shuffle, tierFor, type MiniStory } from '../../engine/content';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { Choice, ChunkyButton } from '@/components/kit';
import { afterMotion } from '@/utils/motion';
import { StagePrompt } from '../shared/StagePrompt/StagePrompt';
import { GameSurface } from '../shared/GameSurface/GameSurface';
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

/** After the hunted word is found: the word, then Luna's "Found it!", then the question. */
const QUESTION_AFTER_FOUND_MS = 3400;

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  // whether this round has an answer yet: its opening question waits for none (BUG-28)
  const { answered: roundAnswered } = api;
  const [revealed, setRevealed] = useState(1);
  const [phase, setPhase] = useState<'read' | 'hunt' | 'question'>('read');
  const [foundWord, setFoundWord] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [missedQuestion, setMissedQuestion] = useState(false);
  // "show me" (FB-2): from the third miss, the hunted word or the right answer glows
  const [shown, setShown] = useState(false);

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
      // not once the round has an answer: it would cut it off (BUG-28)
      if (roundAnswered()) return;
      pronunciation.speakSequence(readAlong ? [{ text: story.title }, { text: story.lines[0] }] : [{ text: story.title }]);
    }, 500);
    return () => window.clearTimeout(t);
  }, [story, readAlong, roundAnswered]);

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

    if (clean === round.hunt) {
      setFoundWord(true);
      soundManager.playCorrect();
      // the word, whole, before Luna's line (FB-1)
      api.tick({ say: [{ word: clean }], lunaLine: 'Found it! Right there in the middle of the page.' });
      // the question waits for the word and Luna's line (FB-1); at 1.1s it
      // used to cut her line off
      window.setTimeout(() => {
        setPhase('question');
        // the question's answer isn't shown until a miss there asks for it
        // (the round's misses carry on, so after a hard hunt that's the first)
        setShown(false);
        pronunciation.speakSentence(story.question);
      }, QUESTION_AFTER_FOUND_MS);
    } else {
      api.answer({
        correct: false,
        say: [{ word: clean }],
        reveal: () => setShown(true),
        hint: [{ text: 'You are looking for' }, { word: round.hunt }, { text: 'Read each line slowly with your finger.' }]
      });
    }
  };

  const answer = (text: string, correct: boolean) => {
    if (api.locked || answered) return;

    if (correct) {
      setAnswered(true);
      // the answer, said whole before Luna reacts (FB-1)
      api.answer({ correct: true, say: [{ text }], delay: 2100 });
    } else {
      // a wrong answer wobbles, and clears when its wobble ends (components.md)
      setWrongAnswer(text);
      setMissedQuestion(true);
      afterMotion('emphasis', () => setWrongAnswer(null));
      api.answer({
        correct: false,
        say: [{ text }],
        reveal: () => setShown(true),
        hint: [{ text: 'Peek back at the story — the answer is hiding in one of the lines.' }]
      });
    }
  };

  return (
    <GameSurface className={styles.story}>
      <div className={styles.book}>
        <div className={styles.spine} aria-hidden="true" />

        <div className={styles.cover}>
          <span className={styles.picture}>{story.emoji}</span>
          <h3 className={styles.title}>{story.title}</h3>
          {/* the word is heard, not shown: written here, the hunt is matching
              letters rather than reading the story */}
          {phase === 'hunt' && (
            <p className={styles.hunt}>
              {foundWord ? (
                <>
                  Found it: <strong className={styles.found}>{round.hunt}</strong>
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

        <div className={styles.page}>
          {story.lines.slice(0, revealed).map((line, i) => (
            <p
              key={i}
              className={styles.line}
              data-state={phase === 'hunt' ? 'huntable' : undefined}
              onClick={() => canHearLines && readLine(i)}
            >
              {line.split(' ').map((word, wi) => {
                const clean = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
                const isFound = foundWord && clean === round.hunt;
                const isShown = shown && phase === 'hunt' && clean === round.hunt;
                return (
                  <span
                    key={wi}
                    className={styles.word}
                    // the found word, in the one answer language (components.md)
                    data-state={isFound ? 'right' : isShown ? 'revealed' : undefined}
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
              className={styles.pageButton}
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
            <ChunkyButton variant="action" iconAfter="arrow-right" className={styles.pageButton} onClick={turnPage}>
              {allRevealed ? 'I have read it!' : 'Next line'}
            </ChunkyButton>
          )}
        </div>
      </div>

      {phase === 'question' && (
        <div className={styles.question}>
          <StagePrompt>{story.question}</StagePrompt>
          <div className={styles.answers}>
            {answers.map(a => (
              <Choice
                key={a.text}
                kind="phrase"
                state={
                  wrongAnswer === a.text
                    ? 'wrong'
                    : answered
                      ? a.correct ? 'right' : 'faded'
                      : shown && phase === 'question' && a.correct ? 'revealed' : 'idle'
                }
                onClick={() => answer(a.text, a.correct)}
              >
                {a.text}
              </Choice>
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
  // a story read line by line, a word hunt and a question (PRG-6's first guess)
  roundSeconds: 90,
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
