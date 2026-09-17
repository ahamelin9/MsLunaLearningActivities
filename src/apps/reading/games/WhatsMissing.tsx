import React, { useEffect, useState } from 'react';
import type { GameApi, GameDef } from '../engine/types';
import { distinctByEmoji, sample, shuffle, tierFor, wordsUpTo, type WordItem } from '../engine/content';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';

interface Round {
  items: WordItem[];
  missing: WordItem;
  options: WordItem[];
  /** show words instead of pictures in the answer row */
  wordChoices: boolean;
  lookSeconds: number;
}

function buildRound(tier: 1 | 2 | 3): Round {
  const count = tier === 1 ? 4 : tier === 2 ? 5 : 6;
  const items = distinctByEmoji(wordsUpTo(tier), count);
  const missing = items[Math.floor(Math.random() * items.length)];
  const distractors = sample(items.filter(i => i.word !== missing.word), 2);

  return {
    items,
    missing,
    options: shuffle([missing, ...distractors]),
    wordChoices: tier >= 2,
    lookSeconds: tier === 1 ? 5 : tier === 2 ? 4 : 3
  };
}

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [phase, setPhase] = useState<'look' | 'curtain' | 'guess'>('look');
  const [countdown, setCountdown] = useState(round.lookSeconds);
  const [found, setFound] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);

  useEffect(() => {
    pronunciation.speakText('Look carefully at my desk...');
    const tick = window.setInterval(() => setCountdown(c => c - 1), 1000);
    const toCurtain = window.setTimeout(() => setPhase('curtain'), round.lookSeconds * 1000);
    const toGuess = window.setTimeout(() => {
      setPhase('guess');
      soundManager.playPop();
      pronunciation.speakText('What is missing?');
    }, round.lookSeconds * 1000 + 1100);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(toCurtain);
      window.clearTimeout(toGuess);
    };
  }, [round.lookSeconds]);

  const guess = (item: WordItem) => {
    if (api.locked || phase !== 'guess' || found) return;
    pronunciation.speakWord(item.word);

    if (item.word === round.missing.word) {
      setFound(true);
      api.win({ delay: 2000 });
    } else {
      setWrong(item.word);
      window.setTimeout(() => setWrong(null), 600);
      api.miss({
        hint: `${item.word} is still on the desk — look, there it is. Which one is NOT there any more?`
      });
    }
  };

  const visible = phase === 'guess' && !found ? round.items.filter(i => i.word !== round.missing.word) : round.items;

  return (
    <div className="game-surface missing">
      <div className="desk-scene">
        <div className={`desk-curtain ${phase === 'curtain' ? 'is-sweeping' : ''} ${phase === 'guess' ? 'is-gone' : ''}`}>
          <span aria-hidden="true">✨</span>
        </div>

        <div className="desk-top">
          {visible.map(item => (
            <span key={item.word} className="desk-item" title={item.word}>
              <span className="item-emoji">{item.emoji}</span>
              {phase === 'look' && <span className="item-word">{item.word}</span>}
            </span>
          ))}
          {found && (
            <span className="desk-item is-returned">
              <span className="item-emoji">{round.missing.emoji}</span>
              <span className="item-word">{round.missing.word}</span>
            </span>
          )}
        </div>

        <div className="desk-edge" aria-hidden="true" />
      </div>

      {phase === 'look' && (
        <div className="look-timer">
          <span className="timer-label">Memorise!</span>
          <span className="timer-count">{Math.max(1, countdown)}</span>
        </div>
      )}

      {phase === 'curtain' && <p className="stage-prompt">Luna is taking something…</p>}

      {phase === 'guess' && (
        <div className="missing-choices">
          <p className="stage-prompt">What disappeared?</p>
          <div className="choice-row">
            {round.options.map(opt => (
              <button
                key={opt.word}
                className={`missing-choice ${wrong === opt.word ? 'is-wrong' : ''} ${
                  found && opt.word === round.missing.word ? 'is-right' : ''
                }`}
                onClick={() => guess(opt)}
              >
                {round.wordChoices ? (
                  <span className="choice-word">{opt.word}</span>
                ) : (
                  <>
                    <span className="choice-emoji">{opt.emoji}</span>
                    <span className="choice-word small">{opt.word}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const whatsMissing: GameDef<Round> = {
  id: 'whats-missing',
  title: 'What’s Missing?',
  emoji: '🔦',
  tagline: 'Memorise Luna’s desk. She takes one thing away.',
  objective: 'Vocabulary recall — hold picture and word together in memory.',
  skill: 'vocabulary',
  mission: 'Look hard at my desk… I am about to take something!',
  roundsPerPlay: 4,
  shape: 'desk',
  sticker: 'lamp',
  makeRounds: ({ grade, difficulty, count }) => {
    const tier = tierFor(grade, difficulty);
    return Array.from({ length: count }, () => buildRound(tier));
  },
  Play
};
