import React, { useEffect, useState } from 'react';
import type { GameApi, GameDef } from '../engine/types';
import {
  CATEGORIES,
  distinctByEmoji,
  shuffle,
  tierFor,
  wordsUpTo,
  type WordItem
} from '../engine/content';
import { pronunciation } from '../../../utils/pronunciation';

interface Basket {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

interface SortItem extends WordItem {
  id: string;
  basketId: string;
}

interface Round {
  mode: 'category' | 'sound';
  baskets: Basket[];
  items: SortItem[];
}

function buildRound(tier: 1 | 2 | 3): Round {
  const pool = wordsUpTo(tier);
  const useSound = tier === 3 || (tier === 2 && Math.random() < 0.4);

  if (useSound) {
    const initials = shuffle([...new Set(pool.map(w => w.initial))].filter(
      i => pool.filter(w => w.initial === i).length >= 2
    )).slice(0, 2);

    const baskets: Basket[] = initials.map((initial, i) => ({
      id: initial,
      label: `starts with ${initial}`,
      emoji: i === 0 ? '🧺' : '🪣',
      color: i === 0 ? '#4AA05A' : '#4FA8D8'
    }));

    const items: SortItem[] = shuffle(
      initials.flatMap(initial =>
        distinctByEmoji(pool.filter(w => w.initial === initial), 2).map((w, i) => ({
          ...w,
          id: `${w.word}-${i}`,
          basketId: initial
        }))
      )
    );

    return { mode: 'sound', baskets, items };
  }

  const cats = shuffle(CATEGORIES.filter(c => pool.filter(w => w.cat === c.id).length >= 2)).slice(0, 2);
  const baskets: Basket[] = cats.map(c => ({
    id: c.id,
    label: c.label,
    emoji: c.emoji,
    color: c.color
  }));

  const items: SortItem[] = shuffle(
    cats.flatMap(c =>
      distinctByEmoji(pool.filter(w => w.cat === c.id), 2).map((w, i) => ({
        ...w,
        id: `${w.word}-${i}`,
        basketId: c.id
      }))
    )
  );

  return { mode: 'category', baskets, items };
}

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [index, setIndex] = useState(0);
  const [sorted, setSorted] = useState<Record<string, SortItem[]>>({});
  const [flyTo, setFlyTo] = useState<string | null>(null);
  const [shakeBasket, setShakeBasket] = useState<string | null>(null);

  const current = round.items[index];

  useEffect(() => {
    const t = window.setTimeout(() => {
      pronunciation.speakText(
        round.mode === 'sound' ? 'Sort them by their first sound.' : 'Put each one in the right basket.'
      );
    }, 500);
    return () => window.clearTimeout(t);
  }, [round.mode]);

  const drop = (basket: Basket) => {
    if (api.locked || !current || flyTo) return;
    pronunciation.speakWord(current.word);

    if (basket.id === current.basketId) {
      setFlyTo(basket.id);
      window.setTimeout(() => {
        setSorted(prev => ({ ...prev, [basket.id]: [...(prev[basket.id] ?? []), current] }));
        setFlyTo(null);
        const next = index + 1;
        setIndex(next);
        if (next >= round.items.length) {
          api.win({ delay: 1600 });
        } else {
          api.tick();
        }
      }, 420);
    } else {
      setShakeBasket(basket.id);
      window.setTimeout(() => setShakeBasket(null), 500);
      api.miss({
        hint:
          round.mode === 'sound'
            ? `Say it slowly: ${current.word}. It begins with “${current.initial}”.`
            : `A ${current.word} belongs with ${round.baskets.find(b => b.id === current.basketId)?.label.toLowerCase()}.`
      });
    }
  };

  return (
    <div className="game-surface sorting">
      <div className="sort-belt">
        <span className="belt-label">Next up</span>
        <div className="sort-item-holder">
          {current ? (
            <button
              className={`sort-item ${flyTo ? `is-flying to-${flyTo}` : ''}`}
              onClick={() => pronunciation.speakWord(current.word)}
              aria-label={current.word}
            >
              <span className="sort-emoji">{current.emoji}</span>
              <span className="sort-word">{current.word}</span>
            </button>
          ) : (
            <span className="sort-done">All tidy! 🧹</span>
          )}
        </div>
        <div className="belt-queue" aria-hidden="true">
          {round.items.slice(index + 1).map(i => (
            <span key={i.id} className="queue-dot">
              {i.emoji}
            </span>
          ))}
        </div>
      </div>

      <div className="basket-row">
        {round.baskets.map(basket => (
          <button
            key={basket.id}
            className={`basket ${shakeBasket === basket.id ? 'is-shaking' : ''}`}
            style={{ '--basket-color': basket.color } as React.CSSProperties}
            onClick={() => drop(basket)}
            disabled={!current}
          >
            <span className="basket-emoji">{basket.emoji}</span>
            <span className="basket-label">{basket.label}</span>
            <span className="basket-contents">
              {(sorted[basket.id] ?? []).map(item => (
                <span key={item.id} className="basket-item">
                  {item.emoji}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const sortingBaskets: GameDef<Round> = {
  id: 'sorting-baskets',
  title: 'Tidy the Baskets',
  emoji: '🧺',
  tagline: 'Everything is in the wrong basket. Sort it out.',
  objective: 'Vocabulary categorisation and beginning-sound sorting.',
  skill: 'vocabulary',
  mission: 'My shelves are chaos. Help me sort every single thing!',
  roundsPerPlay: 4,
  shape: 'baskets',
  sticker: 'basket',
  makeRounds: ({ grade, difficulty, count }) => {
    const tier = tierFor(grade, difficulty);
    return Array.from({ length: count }, () => buildRound(tier));
  },
  Play
};
