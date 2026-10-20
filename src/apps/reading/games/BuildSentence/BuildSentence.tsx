import React, { useEffect, useRef, useState } from 'react';
import type { GameApi, GameDef } from '../../engine/types';
import { pick, sentencesFor, shuffle, tierFor, type SentenceItem } from '../../engine/content';
import { pickWrong, textChoice } from '../../engine/distractors';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { ChunkyButton } from '@/components/kit';
import { afterMotion } from '@/utils/motion';
import { GameSurface } from '../shared/GameSurface/GameSurface';
import { dataState } from '@/utils/cx';
import styles from './BuildSentence.module.scss';

interface Tile {
  id: string;
  word: string;
  isExtra: boolean;
}

interface Round {
  sentence: SentenceItem;
  words: string[];
  tiles: Tile[];
}

const EXTRA_WORDS = ['jumped', 'purple', 'banana', 'quickly', 'seven', 'window'];

function buildRound(tier: 1 | 2 | 3): Round {
  const sentence = pick(sentencesFor(tier));
  const words = sentence.text.replace(/\.$/, '').split(' ');

  const tiles: Tile[] = words.map((w, i) => ({ id: `w-${i}`, word: w, isExtra: false }));
  if (tier === 3) {
    // the extra tile is never one of the sentence's own words, nor one that
    // would also make it true in place of one of them
    pickWrong(sentence.text, EXTRA_WORDS, 1, {
      as: textChoice,
      onScreen: words,
      blank: { alsoFits: sentence.alsoFits }
    }).forEach((w, i) =>
      tiles.push({ id: `x-${i}`, word: w, isExtra: true })
    );
  }

  return { sentence, words, tiles: shuffle(tiles) };
}

/** The longest a word of the read-aloud may take before the read-back goes on without it. */
const WORD_READ_MS = 1500;

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  // whether this round has an answer yet: its opening question waits for none (BUG-28)
  const { answered } = api;
  const [slots, setSlots] = useState<(Tile | null)[]>(() => round.words.map(() => null));
  const [readingIndex, setReadingIndex] = useState(-1);
  const [solved, setSolved] = useState(false);
  const [shakeSlot, setShakeSlot] = useState(false);
  // "show me" (FB-2): from the third miss the words from the first wrong place
  // go back to the shelf, and the word for the next space glows, one by one
  const [shown, setShown] = useState(false);
  // a read-aloud cut short never ends: the cheer comes anyway (FB-1)
  const readWatchdog = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(readWatchdog.current), []);

  const placed = slots.filter(Boolean) as Tile[];
  const nextWord = round.words[slots.findIndex(s => s === null)];
  const available = round.tiles.filter(t => !placed.some(p => p.id === t.id));

  useEffect(() => {
    const t = window.setTimeout(() => {
      // not once the round has an answer: it would cut it off (BUG-28)
      if (!answered()) pronunciation.speakText('Put the words in order to make a sentence.');
    }, 500);
    return () => window.clearTimeout(t);
  }, [answered]);

  const readAloud = (words: string[], onDone?: () => void) => {
    let i = 0;
    const step = () => {
      if (i >= words.length) {
        setReadingIndex(-1);
        onDone?.();
        return;
      }
      setReadingIndex(i);
      pronunciation.speakWord(words[i], {
        interrupt: false,
        onEnd: () => {
          i += 1;
          window.setTimeout(step, 90);
        }
      });
    };
    step();
  };

  const check = (filled: (Tile | null)[]) => {
    const attempt = filled.map(t => t?.word ?? '');
    const correct = attempt.join(' ') === round.words.join(' ');

    if (correct) {
      setSolved(true);
      soundManager.playCorrect();
      // word by word, then the whole sentence, and only then Luna's cheer
      // (FB-1, BUG-1: the cheer used to cut the read-back off)
      let settled = false;
      const readBack = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(readWatchdog.current);
        api.answer({ correct: true, say: [{ text: round.sentence.text }], delay: 1800 });
      };
      readWatchdog.current = window.setTimeout(readBack, attempt.length * WORD_READ_MS);
      readAloud(attempt, readBack);
    } else {
      // the page wobbles, and clears when its wobble ends (components.md)
      setShakeSlot(true);
      afterMotion('emphasis', () => setShakeSlot(false));
      const firstWrong = attempt.findIndex((w, i) => w !== round.words[i]);
      api.answer({
        correct: false,
        reveal: () => {
          setSlots(prev => prev.map((slot, i) => (i < firstWrong ? slot : null)));
          setShown(true);
        },
        hint:
          firstWrong === 0
            ? [{ text: 'A sentence starts with a capital letter. Which word begins with a big letter?' }]
            : [{ text: 'Look at the word' }, { word: attempt[firstWrong] }, { text: 'Is it in the right place? Read it out loud and listen for the bump.' }]
      });
    }
  };

  const placeTile = (tile: Tile) => {
    if (api.locked || solved) return;
    const emptyIndex = slots.findIndex(s => s === null);
    if (emptyIndex === -1) return;

    soundManager.playLetterSnap();
    pronunciation.speakWord(tile.word);

    const next = [...slots];
    next[emptyIndex] = tile;
    setSlots(next);

    if (!next.includes(null)) {
      window.setTimeout(() => check(next), 650);
    }
  };

  const removeTile = (index: number) => {
    if (api.locked || solved) return;
    soundManager.playPop();
    const next = [...slots];
    next[index] = null;
    setSlots(next);
  };

  return (
    <GameSurface>
      <div className={styles.scene}>
        <span className={styles.picture}>{round.sentence.emoji}</span>
        <ChunkyButton
          variant="prompt"
          icon="speaker"
          onClick={() => pronunciation.speakSentence(round.sentence.text)}
          disabled={!solved && api.hintLevel < 1}
          title={api.hintLevel < 1 ? 'Try it first!' : 'Hear the sentence'}
        >
          Hear the whole sentence
        </ChunkyButton>
      </div>

      {/* the page the words go back onto, in the one answer language (components.md) */}
      <div className={styles.page} data-state={dataState(shakeSlot ? 'wrong' : false, solved ? 'right' : false)}>
        {slots.map((slot, i) => (
          <button
            key={i}
            className={styles.slot}
            data-state={dataState(slot ? 'filled' : false, readingIndex === i ? 'reading' : false)}
            onClick={() => slot && removeTile(i)}
            aria-label={slot ? `${slot.word}, tap to take back` : `empty space ${i + 1}`}
          >
            {slot ? slot.word : <span className={styles.line} />}
          </button>
        ))}
        {solved && <span className={styles.period}>.</span>}
      </div>

      <div className={styles.shelf}>
        {available.map(tile => (
          <button
            key={tile.id}
            className={styles.tile}
            // the word for the next space, once "show me" is on (FB-2)
            data-state={shown && !solved && tile.word === nextWord ? 'revealed' : undefined}
            onClick={() => placeTile(tile)}
          >
            {tile.word}
          </button>
        ))}
        {available.length === 0 && !solved && <span className={styles.empty}>Tap a word above to take it back</span>}
      </div>
    </GameSurface>
  );
};

export const buildSentence: GameDef<Round> = {
  id: 'build-sentence',
  title: 'Words Off the Page',
  emoji: '🪶',
  tagline: 'The words fell out of order. Line them back up.',
  objective: 'Understand basic English word order and sentence structure.',
  skill: 'reading',
  mission: 'Oh no, the words slid right off the page. Put them back!',
  roundsPerPlay: 4,
  shape: 'page',
  sticker: 'quill',
  makeRounds: ({ grade, difficulty, count }) => {
    const tier = tierFor(grade, difficulty);
    const rounds: Round[] = [];
    const used = new Set<string>();
    let guard = 0;
    while (rounds.length < count && guard < 40) {
      guard++;
      const r = buildRound(tier);
      if (used.has(r.sentence.text)) continue;
      used.add(r.sentence.text);
      rounds.push(r);
    }
    while (rounds.length < count) rounds.push(buildRound(tier));
    return rounds;
  },
  Play
};
