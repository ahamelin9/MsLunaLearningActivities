import React, { useEffect, useState } from 'react';
import type { GameDef, GameApi } from '../engine/types';
import {
  distinctByEmoji,
  lettersFor,
  pick,
  shuffle,
  tierFor,
  wordsNotStartingWith,
  wordsStartingWith,
  type LetterItem,
  type WordItem
} from '../engine/content';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';

interface Suspect extends WordItem {
  id: string;
  x: number;
  y: number;
  scale: number;
  tilt: number;
}

interface Round {
  letter: LetterItem;
  answerId: string;
  suspects: Suspect[];
}

const SPOTS = [
  { x: 16, y: 24 },
  { x: 48, y: 14 },
  { x: 80, y: 26 },
  { x: 22, y: 62 },
  { x: 52, y: 72 },
  { x: 82, y: 60 }
];

function buildRound(tier: 1 | 2 | 3): Round {
  const candidates = lettersFor(tier).filter(l => wordsStartingWith(l.letter.toLowerCase(), tier).length > 0);
  const letter = pick(candidates);
  const key = letter.letter.toLowerCase();

  const correct = pick(wordsStartingWith(key, tier));
  const decoyCount = tier === 1 ? 3 : tier === 2 ? 4 : 5;
  const decoys = distinctByEmoji(
    wordsNotStartingWith(key, tier).filter(w => w.word !== correct.word),
    decoyCount,
    [correct.emoji]
  );

  const chosen = shuffle([correct, ...decoys]);
  const spots = shuffle(SPOTS).slice(0, chosen.length);

  const suspects: Suspect[] = chosen.map((w, i) => ({
    ...w,
    id: `${w.word}-${i}`,
    x: spots[i].x + (Math.random() * 8 - 4),
    y: spots[i].y + (Math.random() * 8 - 4),
    scale: 0.9 + Math.random() * 0.35,
    tilt: Math.random() * 18 - 9
  }));

  const answer = suspects.find(s => s.word === correct.word)!;
  return { letter, answerId: answer.id, suspects };
}

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [focusId, setFocusId] = useState<string | null>(null);
  const [caught, setCaught] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);

  const playSound = () => {
    soundManager.playLetterTap();
    // the phoneme itself: /m/ as "mmmm", never the letter name "em"
    pronunciation.speakLetterSound(round.letter.letter);
  };

  useEffect(() => {
    const timer = window.setTimeout(playSound, 700);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inspect = (s: Suspect) => {
    if (api.locked || caught) return;
    setFocusId(s.id);
    soundManager.playPop();

    if (s.id === round.answerId) {
      window.setTimeout(() => {
        // sound, then the word that carries it
        pronunciation.speakSequence([
          { word: s.word },
          { sound: round.letter.letter },
          { word: s.word }
        ]);
        setCaught(true);
        api.win({ delay: 2400 });
      }, 420);
    } else {
      window.setTimeout(() => {
        pronunciation.speakWord(s.word);
        setWrongId(s.id);
        window.setTimeout(() => setWrongId(null), 600);
        api.miss({
          hint: `Say it slowly: ${s.word}. Does it begin with ${round.letter.sound}? Listen to the very first sound.`
        });
      }, 380);
    }
  };

  const focused = round.suspects.find(s => s.id === focusId);

  return (
    <div className="game-surface detective">
      <div className="detective-brief">
        <button className="sound-horn" onClick={playSound} title="Hear the sound again">
          <span className="horn-icon" aria-hidden="true">📯</span>
          <span className="horn-sound">{round.letter.sound}</span>
        </button>
        <p className="detective-case">
          Someone here starts with <strong>{round.letter.sound}</strong>. Tap a suspect to hear its name.
        </p>
      </div>

      <div className="detective-room">
        <div className="room-rug" aria-hidden="true" />

        {round.suspects.map(s => {
          const isFocus = focusId === s.id;
          const isCaught = caught && s.id === round.answerId;
          return (
            <button
              key={s.id}
              className={`suspect ${isFocus ? 'is-focus' : ''} ${isCaught ? 'is-caught' : ''} ${
                wrongId === s.id ? 'is-wrong' : ''
              }`}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                transform: `translate(-50%, -50%) rotate(${s.tilt}deg) scale(${s.scale})`
              }}
              onClick={() => inspect(s)}
              aria-label={s.word}
            >
              <span className="suspect-emoji">{s.emoji}</span>
              {(isFocus || isCaught) && <span className="suspect-name">{s.word}</span>}
            </button>
          );
        })}

        {focused && (
          <span
            className={`magnifier ${caught ? 'is-locked' : ''}`}
            style={{ left: `${focused.x}%`, top: `${focused.y}%` }}
            aria-hidden="true"
          >
            🔎
          </span>
        )}

        {caught && (
          <div className="case-solved">
            <span>Case solved!</span>
            <strong>
              {round.letter.letter} {round.letter.sound} — {round.suspects.find(s => s.id === round.answerId)?.word}
            </strong>
          </div>
        )}
      </div>

      {api.hintLevel >= 2 && !caught && (
        <button
          className="speak-chip reveal-chip"
          onClick={() => {
            const answer = round.suspects.find(s => s.id === round.answerId);
            if (answer) inspect(answer);
          }}
        >
          🔦 Show me the suspect
        </button>
      )}
    </div>
  );
};

export const soundDetective: GameDef<Round> = {
  id: 'sound-detective',
  title: 'Luna’s Sound Detective',
  emoji: '🔎',
  tagline: 'Listen to a sound, then find who is hiding it.',
  objective: 'Identify the beginning phoneme of a spoken word (initial sound matching).',
  skill: 'phonics',
  mission: 'Something in this room starts with that sound. Find the suspect!',
  roundsPerPlay: 5,
  shape: 'scene',
  sticker: 'magnifier',
  makeRounds: ({ grade, difficulty, count }) => {
    const tier = tierFor(grade, difficulty);
    const rounds: Round[] = [];
    const used = new Set<string>();
    let guard = 0;
    while (rounds.length < count && guard < 60) {
      guard++;
      const r = buildRound(tier);
      if (used.has(r.letter.letter)) continue;
      used.add(r.letter.letter);
      rounds.push(r);
    }
    while (rounds.length < count) rounds.push(buildRound(tier));
    return rounds;
  },
  Play
};
