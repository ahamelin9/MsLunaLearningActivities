import React, { useEffect, useRef, useState } from 'react';
import type { GameApi, GameDef } from '../engine/types';
import { distinctByEmoji, lettersFor, sample, shuffle, tierFor, wordsUpTo } from '../engine/content';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';

interface Card {
  id: string;
  pair: string;
  /** what shows on the face */
  label: string;
  emoji?: string;
  /** letters are named aloud, words are read aloud */
  kind: 'letter' | 'word';
  /** "big" / "little" for letter cards */
  caseLabel?: string;
  /** spoken when flipped */
  spoken: string;
}

interface Round {
  kind: 'case' | 'picture';
  cards: Card[];
  pairCount: number;
}

function buildRound(tier: 1 | 2 | 3): Round {
  const pairCount = tier === 1 ? 4 : tier === 2 ? 5 : 6;

  if (tier === 1) {
    const chosen = sample(lettersFor(1).filter(l => l.letter.length === 1), pairCount);
    const cards: Card[] = chosen.flatMap(l => [
      {
        id: `${l.letter}-up`,
        pair: l.letter,
        label: l.letter,
        kind: 'letter',
        caseLabel: 'big',
        spoken: `big ${l.letter}`
      },
      {
        id: `${l.letter}-low`,
        pair: l.letter,
        label: l.letter.toLowerCase(),
        kind: 'letter',
        caseLabel: 'little',
        spoken: `little ${l.letter}`
      }
    ]);
    return { kind: 'case', cards: shuffle(cards), pairCount };
  }

  const chosen = distinctByEmoji(wordsUpTo(tier), pairCount);
  const cards: Card[] = chosen.flatMap(w => [
    { id: `${w.word}-pic`, pair: w.word, label: '', emoji: w.emoji, kind: 'word', spoken: w.word },
    { id: `${w.word}-word`, pair: w.word, label: w.word, kind: 'word', spoken: w.word }
  ]);
  return { kind: 'picture', cards: shuffle(cards), pairCount };
}

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [wobble, setWobble] = useState<string[]>([]);
  const tried = useRef<Set<string>>(new Set());
  const busy = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      pronunciation.speakText(
        round.kind === 'case'
          ? 'Find the big letter and its little partner.'
          : 'Find the picture and the word that go together.'
      );
    }, 500);
    return () => window.clearTimeout(t);
  }, [round.kind]);

  const flip = (card: Card) => {
    if (api.locked || busy.current) return;
    if (flipped.includes(card.id) || matched.includes(card.pair)) return;

    soundManager.playLetterTap();
    if (card.kind === 'letter') {
      pronunciation.speakSequence([{ text: card.caseLabel ?? '' }, { name: card.label }]);
    } else {
      pronunciation.speakWord(card.spoken);
    }

    const next = [...flipped, card.id];
    setFlipped(next);
    if (next.length < 2) return;

    busy.current = true;
    const [firstId, secondId] = next;
    const first = round.cards.find(c => c.id === firstId)!;
    const second = round.cards.find(c => c.id === secondId)!;

    if (first.pair === second.pair) {
      window.setTimeout(() => {
        const nowMatched = [...matched, first.pair];
        setMatched(nowMatched);
        setFlipped([]);
        busy.current = false;

        if (nowMatched.length >= round.pairCount) {
          api.win({ delay: 1700 });
        } else {
          api.tick();
        }
      }, 620);
    } else {
      const key = [firstId, secondId].sort().join('|');
      const repeat = tried.current.has(key);
      tried.current.add(key);

      window.setTimeout(() => {
        setWobble([firstId, secondId]);
        if (repeat) {
          api.miss({
            lunaLine: 'We already tried those two! Remember where they live.',
            hint: `Look for the partner of ${first.spoken}.`
          });
        } else {
          soundManager.playTryAgain();
        }

        window.setTimeout(() => {
          setWobble([]);
          setFlipped([]);
          busy.current = false;
        }, 520);
      }, 760);
    }
  };

  return (
    <div className="game-surface memory">
      <p className="stage-prompt memory-prompt">
        {round.kind === 'case' ? 'Big letter + little letter' : 'Picture + word'} — find every pair!
      </p>

      <div className={`memory-board cols-${round.pairCount >= 6 ? 4 : round.pairCount === 5 ? 5 : 4}`}>
        {round.cards.map(card => {
          const isOpen = flipped.includes(card.id) || matched.includes(card.pair);
          const isMatched = matched.includes(card.pair);
          return (
            <button
              key={card.id}
              className={`memory-card ${isOpen ? 'is-open' : ''} ${isMatched ? 'is-matched' : ''} ${
                wobble.includes(card.id) ? 'is-wobble' : ''
              }`}
              onClick={() => flip(card)}
              aria-label={isOpen ? card.spoken : 'face down card'}
            >
              <span className="card-inner">
                <span className="card-back" aria-hidden="true">
                  <span className="back-mark">🦉</span>
                </span>
                <span className="card-face">
                  {card.emoji ? (
                    <span className="face-emoji">{card.emoji}</span>
                  ) : (
                    <span className={`face-text ${round.kind === 'case' ? 'is-letter' : ''}`}>{card.label}</span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="memory-tally">
        {Array.from({ length: round.pairCount }).map((_, i) => (
          <span key={i} className={`pair-heart ${i < matched.length ? 'won' : ''}`}>
            {i < matched.length ? '💛' : '🤍'}
          </span>
        ))}
      </div>
    </div>
  );
};

export const memoryMatch: GameDef<Round> = {
  id: 'memory-match',
  title: 'Luna’s Muddled Cards',
  emoji: '🃏',
  tagline: 'Flip two cards. Do they belong together?',
  objective: 'Uppercase–lowercase pairing and picture–word vocabulary recall.',
  skill: 'vocabulary',
  mission: 'I dropped my card box. Find the pairs before I panic!',
  roundsPerPlay: 2,
  shape: 'cards',
  sticker: 'cards',
  makeRounds: ({ grade, difficulty, count }) => {
    const tier = tierFor(grade, difficulty);
    return Array.from({ length: count }, () => buildRound(tier));
  },
  Play
};
