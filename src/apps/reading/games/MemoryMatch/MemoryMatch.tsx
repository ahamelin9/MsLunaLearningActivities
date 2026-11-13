import React, { useEffect, useRef, useState } from 'react';
import type { GameApi, GameDef } from '../../engine/types';
import { lettersFor, shuffle, tierFor, wordsUpTo, type LetterItem, type WordItem } from '../../engine/content';
import { deal, dealWeekFirst } from '../../engine/deck';
import { isWeekWord } from '../../engine/weekWords';
import { distinctByEmoji } from '../../engine/distractors';
import { soundManager } from '@/utils/audio';
import { pronunciation, type SpeechPart } from '@/utils/pronunciation';
import { StagePrompt } from '../shared/StagePrompt/StagePrompt';
import { GameSurface } from '../shared/GameSurface/GameSurface';
import { dataState } from '@/utils/cx';
import { afterMotion } from '@/utils/motion';
import { Icon, ProgressBar } from '@/components/kit';
import styles from './MemoryMatch.module.scss';

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
  /** what a screen reader announces when it is face up; Luna says cardParts() */
  ariaLabel: string;
}

interface Round {
  kind: 'case' | 'picture';
  cards: Card[];
  pairCount: number;
}

/**
 * A word card stays silent until its pair is found (GAME-4): read aloud on
 * flipping, it let a child match by ear. Pictures and letters are still said.
 */
const silentUntilFound = (card: Card) => card.kind === 'word' && !card.emoji;

/** How a card is said: "big" + the letter's name, or the word. Literal parts, so each has a clip. */
function cardParts(card: Card): SpeechPart[] {
  if (card.kind === 'word') return [{ word: card.pair }];
  return [card.caseLabel === 'big' ? { text: 'big' } : { text: 'little' }, { name: card.label }];
}

const pairsAt = (tier: 1 | 2 | 3) => (tier === 1 ? 4 : tier === 2 ? 5 : 6);

/**
 * A play's boards, each from what hasn't been dealt yet (GAME-8). Dealt whole,
 * so no letter or word is on two boards of one play either.
 */
function buildRounds(tier: 1 | 2 | 3, count: number): Round[] {
  const pairCount = pairsAt(tier);
  if (tier === 1) {
    const letters = deal('memory-match-letters', lettersFor(1).filter(l => l.letter.length === 1), pairCount * count, l => l.letter);
    return Array.from({ length: count }, (_, i) => letterRound(letters.slice(i * pairCount, (i + 1) * pairCount)));
  }
  const words = wordsUpTo(tier);
  // this week's words are dealt first (CUR-9), and each board takes what's left of them before the rest
  const dealt = dealWeekFirst('memory-match-words', words, pairCount * count, w => w.word, w => isWeekWord(w.word));
  const used = new Set<WordItem>();
  return Array.from({ length: count }, () => {
    const left = dealt.filter(w => !used.has(w));
    let chosen = distinctByEmoji(left, pairCount, [], distinctByEmoji(left.filter(w => isWeekWord(w.word)), pairCount));
    // two words that look alike can't share a board: the deck gives a spare,
    // so it isn't a word seen last time
    for (let tries = 0; chosen.length < pairCount && tries < words.length; tries++) {
      const spare = deal('memory-match-words', words, 1, w => w.word).filter(w => !used.has(w));
      chosen = distinctByEmoji(spare, pairCount, [], chosen);
    }
    chosen.forEach(w => used.add(w));
    return pictureRound(chosen);
  });
}

function letterRound(chosen: LetterItem[]): Round {
  const cards: Card[] = chosen.flatMap(l => [
    {
      id: `${l.letter}-up`,
      pair: l.letter,
      label: l.letter,
      kind: 'letter',
      caseLabel: 'big',
      ariaLabel: `big ${l.letter}`
    },
    {
      id: `${l.letter}-low`,
      pair: l.letter,
      label: l.letter.toLowerCase(),
      kind: 'letter',
      caseLabel: 'little',
      ariaLabel: `little ${l.letter}`
    }
  ]);
  return { kind: 'case', cards: shuffle(cards), pairCount: chosen.length };
}

function pictureRound(chosen: WordItem[]): Round {
  const cards: Card[] = chosen.flatMap(w => [
    { id: `${w.word}-pic`, pair: w.word, label: '', emoji: w.emoji, kind: 'word', ariaLabel: w.word },
    { id: `${w.word}-word`, pair: w.word, label: w.word, kind: 'word', ariaLabel: w.word }
  ]);
  return { kind: 'picture', cards: shuffle(cards), pairCount: chosen.length };
}

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  // whether this round has an answer yet: its opening question waits for none (BUG-28)
  const { answered } = api;
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [wobble, setWobble] = useState<string[]>([]);
  // "show me" (FB-2): from the third miss, both cards of the pair just
  // tried again glow face down
  const [shownPair, setShownPair] = useState<string | null>(null);
  const tried = useRef<Set<string>>(new Set());
  const busy = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      // not once the round has an answer: it would cut it off (BUG-28)
      if (answered()) return;
      pronunciation.speakText(
        round.kind === 'case'
          ? 'Find the big letter and its little partner.'
          : 'Find the picture and the word that go together.'
      );
    }, 500);
    return () => window.clearTimeout(t);
  }, [round.kind, answered]);

  const flip = (card: Card) => {
    if (api.locked || busy.current) return;
    if (flipped.includes(card.id) || matched.includes(card.pair)) return;

    soundManager.playLetterTap();

    const next = [...flipped, card.id];
    setFlipped(next);
    if (next.length < 2) {
      if (!silentUntilFound(card)) pronunciation.speakSequence(cardParts(card));
      return;
    }

    busy.current = true;
    const [firstId, secondId] = next;
    const first = round.cards.find(c => c.id === firstId)!;
    const second = round.cards.find(c => c.id === secondId)!;
    const isMatch = first.pair === second.pair;
    const lastPair = isMatch && matched.length + 1 >= round.pairCount;
    const key = [firstId, secondId].sort().join('|');
    const repeat = !isMatch && tried.current.has(key);
    if (!isMatch) tried.current.add(key);

    // the second card is said whole before Luna reacts to the pair (FB-1); a
    // word card only once it is found (GAME-4)
    const said = isMatch || !silentUntilFound(card) ? cardParts(card) : undefined;
    // the hint names a picture, never a word card the child has to read
    const named = round.kind === 'case' ? first : [first, second].find(c => c.emoji);
    if (lastPair) api.answer({ correct: true, say: said, delay: 1700 });
    else if (repeat)
      api.answer({
        correct: false,
        say: said,
        lunaLine: 'We already tried those two! Remember where they live.',
        reveal: () => setShownPair(first.pair),
        hint: named
          ? [{ text: 'Look for the partner of' }, ...cardParts(named)]
          : [{ text: 'Turn over a picture first, then find its word.' }]
      });
    else if (said) pronunciation.speakSequence(said);

    if (isMatch) {
      window.setTimeout(() => {
        setMatched([...matched, first.pair]);
        setFlipped([]);
        busy.current = false;
        if (!lastPair) api.tick();
      }, 620);
    } else {
      window.setTimeout(() => {
        setWobble([firstId, secondId]);
        // a repeat's try-again sound comes with Luna's line (api.answer)
        if (!repeat) soundManager.playTryAgain();

        // they turn back over once the wobble has played (components.md)
        afterMotion('emphasis', () => {
          setWobble([]);
          setFlipped([]);
          busy.current = false;
        });
      }, 760);
    }
  };

  return (
    <GameSurface>
      <StagePrompt>
        {round.kind === 'case' ? 'Big letter + little letter' : 'Picture + word'} — find every pair!
      </StagePrompt>

      <div className={styles.board} data-cols={round.pairCount === 5 ? 5 : 4}>
        {round.cards.map(card => {
          const isOpen = flipped.includes(card.id) || matched.includes(card.pair);
          const isMatched = matched.includes(card.pair);
          return (
            <button
              key={card.id}
              className={styles.card}
              // a game piece in the one answer language (components.md)
              data-state={dataState(
                isOpen ? 'open' : false,
                isMatched ? 'right' : false,
                wobble.includes(card.id) ? 'wrong' : false,
                shownPair === card.pair && !isMatched ? 'revealed' : false
              )}
              onClick={() => flip(card)}
              aria-label={isOpen ? card.ariaLabel : 'face down card'}
            >
              <span className={styles.inner}>
                <span className={styles.back} aria-hidden="true">
                  {/* a book, not an owl: one Luna per screen (DES-12) */}
                  <Icon name="book" size={32} />
                </span>
                <span className={styles.face}>
                  {card.emoji ? (
                    <span className={styles.picture}>{card.emoji}</span>
                  ) : (
                    <span className={styles.text} data-kind={round.kind === 'case' ? 'letter' : 'word'}>{card.label}</span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <ProgressBar
        size="rounds"
        done={matched.length}
        total={round.pairCount}
        label={`${matched.length} of ${round.pairCount} pairs found`}
        className={styles.tally}
      />
    </GameSurface>
  );
};

export const memoryMatch: GameDef<Round> = {
  id: 'memory-match',
  title: 'Luna’s Muddled Cards',
  emoji: '🃏',
  tagline: 'Flip two cards. Do they belong together?',
  objective: 'Pairs, from memory: matches a big letter with its little one, or a picture with its word.',
  skill: 'vocabulary',
  mission: 'I dropped my card box. Find the pairs before I panic!',
  // a board holds 4 to 6 pairs, so 4 boards are about 20 a play (CUR-15)
  roundsPerPlay: 4,
  // a whole board of pairs a round (PRG-6's first guess)
  roundSeconds: 75,
  shape: 'cards',
  sticker: 'cards',
  makeRounds: ({ grade, difficulty, count }) => {
    return buildRounds(tierFor(grade, difficulty), count);
  },
  Play
};
