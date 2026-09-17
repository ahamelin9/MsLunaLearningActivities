import React, { useEffect, useMemo, useState } from 'react';
import type { GameApi, GameDef } from '../engine/types';
import { MINI_STORIES, pick, shuffle, tierFor, type MiniStory } from '../engine/content';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';

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

  const story = round.story;
  const allRevealed = revealed >= story.lines.length;

  const answers = useMemo(() => shuffle(story.answers), [story]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      pronunciation.speakText(story.title);
    }, 500);
    return () => window.clearTimeout(t);
  }, [story.title]);

  const readLine = (index: number) => {
    soundManager.playLetterTap();
    pronunciation.speakSentence(story.lines[index]);
  };

  const turnPage = () => {
    if (allRevealed) {
      setPhase('hunt');
      soundManager.playPop();
      pronunciation.speakSequence([
        { text: 'Now find the word' },
        { word: round.hunt },
        { text: 'in the story.' }
      ]);
      return;
    }
    const next = revealed + 1;
    setRevealed(next);
    soundManager.playPop();
    readLine(next - 1);
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
      api.miss({ hint: `You are looking for “${round.hunt}”. Read each line slowly with your finger.` });
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
      window.setTimeout(() => setWrongAnswer(null), 600);
      api.miss({ hint: 'Peek back at the story — the answer is hiding in one of the lines.' });
    }
  };

  return (
    <div className="game-surface story">
      <div className="storybook">
        <div className="book-spine" aria-hidden="true" />

        <div className="book-page left">
          <span className="story-emoji">{story.emoji}</span>
          <h3 className="story-title">{story.title}</h3>
          {phase === 'hunt' && (
            <p className="hunt-task">
              Find the word <strong>{round.hunt}</strong>
            </p>
          )}
        </div>

        <div className="book-page right">
          {story.lines.slice(0, revealed).map((line, i) => (
            <p
              key={i}
              className={`story-line ${phase === 'hunt' ? 'is-huntable' : ''}`}
              onClick={() => phase === 'read' && readLine(i)}
            >
              {line.split(' ').map((word, wi) => {
                const clean = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
                const isFound = foundWord && clean === round.hunt;
                return (
                  <span
                    key={wi}
                    className={`story-word ${isFound ? 'is-found' : ''}`}
                    onClick={e => {
                      if (phase !== 'hunt') return;
                      e.stopPropagation();
                      tapWord(word);
                    }}
                  >
                    {word}{' '}
                  </span>
                );
              })}
            </p>
          ))}

          {phase === 'read' && (
            <button className="page-turn" onClick={turnPage}>
              {allRevealed ? 'I have read it! →' : 'Next line →'}
            </button>
          )}
        </div>
      </div>

      {phase === 'question' && (
        <div className="story-question">
          <p className="stage-prompt">{story.question}</p>
          <div className="story-answers">
            {answers.map(a => (
              <button
                key={a.text}
                className={`story-answer ${wrongAnswer === a.text ? 'is-wrong' : ''} ${
                  answered && a.correct ? 'is-right' : ''
                }`}
                onClick={() => answer(a.text, a.correct)}
              >
                {a.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
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
