import React, { useEffect, useState } from 'react';
import type { GameApi, GameDef } from '../engine/types';
import { pick, sample, sentencesFor, shuffle, tierFor, type SentenceItem } from '../engine/content';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';

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
    sample(EXTRA_WORDS, 1).forEach((w, i) => tiles.push({ id: `x-${i}`, word: w, isExtra: true }));
  }

  return { sentence, words, tiles: shuffle(tiles) };
}

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [slots, setSlots] = useState<(Tile | null)[]>(() => round.words.map(() => null));
  const [readingIndex, setReadingIndex] = useState(-1);
  const [solved, setSolved] = useState(false);
  const [shakeSlot, setShakeSlot] = useState(false);

  const placed = slots.filter(Boolean) as Tile[];
  const available = round.tiles.filter(t => !placed.some(p => p.id === t.id));

  useEffect(() => {
    const t = window.setTimeout(() => {
      pronunciation.speakText('Put the words in order to make a sentence.');
    }, 500);
    return () => window.clearTimeout(t);
  }, []);

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
      readAloud(attempt, () => {
        pronunciation.speakSentence(round.sentence.text);
      });
      api.win({ delay: 3200 });
    } else {
      setShakeSlot(true);
      window.setTimeout(() => setShakeSlot(false), 500);
      const firstWrong = attempt.findIndex((w, i) => w !== round.words[i]);
      api.miss({
        hint:
          firstWrong === 0
            ? `A sentence starts with a capital letter. Which word begins with a big letter?`
            : `Word ${firstWrong + 1} is not quite right. Read it out loud and listen for the bump.`
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
    <div className="game-surface sentence">
      <div className="sentence-scene">
        <span className="scene-emoji">{round.sentence.emoji}</span>
        <button
          className="speak-chip"
          onClick={() => pronunciation.speakSentence(round.sentence.text)}
          disabled={!solved && api.hintLevel < 1}
          title={api.hintLevel < 1 ? 'Try it first!' : 'Hear the sentence'}
        >
          🔊 Hear the whole sentence
        </button>
      </div>

      <div className={`sentence-track ${shakeSlot ? 'is-shaking' : ''} ${solved ? 'is-solved' : ''}`}>
        {slots.map((slot, i) => (
          <button
            key={i}
            className={`sentence-slot ${slot ? 'is-filled' : ''} ${readingIndex === i ? 'is-reading' : ''}`}
            onClick={() => slot && removeTile(i)}
            aria-label={slot ? `${slot.word}, tap to take back` : `empty space ${i + 1}`}
          >
            {slot ? slot.word : <span className="slot-line" />}
          </button>
        ))}
        {solved && <span className="sentence-period">.</span>}
      </div>

      <div className="word-shelf">
        {available.map(tile => (
          <button key={tile.id} className="word-tile" onClick={() => placeTile(tile)}>
            {tile.word}
          </button>
        ))}
        {available.length === 0 && !solved && <span className="shelf-empty">Tap a word above to take it back</span>}
      </div>
    </div>
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
