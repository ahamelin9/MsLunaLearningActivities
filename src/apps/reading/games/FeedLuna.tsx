import React, { useEffect, useRef, useState } from 'react';
import type { GameApi, GameDef } from '../engine/types';
import {
  lettersFor,
  pick,
  sample,
  shuffle,
  tierFor,
  wordsUpTo,
  type LetterItem,
  type WordItem
} from '../engine/content';
import { LunaOwl } from '../engine/LunaOwl';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';

type Mode = 'toLower' | 'toUpper' | 'bySound' | 'byWord';

type CuePart = { text?: string; sound?: string; name?: string; word?: string };

interface Round {
  mode: Mode;
  /** what Luna is asking for, shown on her little sign */
  cue: string;
  cueEmoji?: string;
  /** spoken as a sequence so a phoneme stays a phoneme */
  cueParts: CuePart[];
  answer: string;
  options: string[];
}

function buildRound(tier: 1 | 2 | 3): Round {
  const letters = lettersFor(tier).filter(l => l.letter.length === 1);
  const modes: Mode[] =
    tier === 1
      ? ['toLower', 'toLower', 'bySound']
      : tier === 2
        ? ['toLower', 'toUpper', 'bySound']
        : ['toUpper', 'bySound', 'byWord'];

  const mode = pick(modes);
  const letter: LetterItem = pick(letters);
  const others = letters.filter(l => l.letter !== letter.letter);
  const decoyCount = tier === 1 ? 2 : 3;

  if (mode === 'byWord') {
    const word: WordItem = pick(
      wordsUpTo(tier).filter(w => w.initial.length === 1 && letters.some(l => l.letter.toLowerCase() === w.initial))
    );
    const answer = word.initial.toLowerCase();
    const decoys = sample(
      letters.map(l => l.letter.toLowerCase()).filter(c => c !== answer),
      decoyCount
    );
    return {
      mode,
      cue: word.word,
      cueEmoji: word.emoji,
      cueParts: [{ text: 'I want the letter that starts' }, { word: word.word }],
      answer,
      options: shuffle([answer, ...decoys])
    };
  }

  if (mode === 'bySound') {
    const answer = tier === 1 ? letter.letter : letter.letter.toLowerCase();
    const decoys = sample(
      others.map(l => (tier === 1 ? l.letter : l.letter.toLowerCase())),
      decoyCount
    );
    return {
      mode,
      cue: letter.sound,
      cueParts: [{ text: 'I am hungry for the letter that says' }, { sound: letter.letter }],
      answer,
      options: shuffle([answer, ...decoys])
    };
  }

  const toLower = mode === 'toLower';
  const cue = toLower ? letter.letter : letter.letter.toLowerCase();
  const answer = toLower ? letter.letter.toLowerCase() : letter.letter;
  const decoys = sample(
    others.map(l => (toLower ? l.letter.toLowerCase() : l.letter)),
    decoyCount
  );

  return {
    mode,
    cue,
    cueParts: toLower
      ? [{ text: 'Find the little' }, { name: letter.letter }, { text: 'that matches this big' }, { name: letter.letter }]
      : [{ text: 'Find the big' }, { name: letter.letter }, { text: 'that matches this little' }, { name: letter.letter }],
    answer,
    options: shuffle([answer, ...decoys])
  };
}

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [eaten, setEaten] = useState<string[]>([]);
  const [spat, setSpat] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ char: string; x: number; y: number } | null>(null);
  const [chewing, setChewing] = useState(false);

  const beakRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const sayCue = () => {
    soundManager.playLetterTap();
    pronunciation.speakSequence(round.cueParts);
  };

  useEffect(() => {
    const t = window.setTimeout(sayCue, 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const feed = (char: string) => {
    if (api.locked || eaten.includes(char)) return;

    if (char === round.answer) {
      setEaten([...eaten, char]);
      setChewing(true);
      soundManager.playLetterSnap();
      window.setTimeout(() => {
        pronunciation.speakSequence([
          { text: `Mmm! ${char === char.toLowerCase() ? 'little' : 'big'}` },
          { name: char }
        ]);
      }, 260);
      api.win({ delay: 1900 });
    } else {
      setSpat(char);
      window.setTimeout(() => setSpat(null), 800);
      api.miss({
        hint:
          round.mode === 'bySound'
            ? `Say the sound out loud: ${round.cue}. Which letter makes it?`
            : round.mode === 'byWord'
              ? `Stretch the word: ${round.cue}. What is the very first sound?`
              : `Look at the shape of ${round.cue}. Its partner looks almost the same, just a different size.`
      });
    }
  };

  const onPointerDown = (e: React.PointerEvent, char: string) => {
    if (api.locked || eaten.includes(char)) return;
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect) return;
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // some input devices refuse capture; dragging still works without it
    }
    startRef.current = { x: e.clientX, y: e.clientY };
    setDragging({ char, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragging({ ...dragging, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    const beak = beakRef.current?.getBoundingClientRect();
    const start = startRef.current;
    const moved = start ? Math.hypot(e.clientX - start.x, e.clientY - start.y) : 0;
    const overBeak =
      beak &&
      e.clientX > beak.left - 30 &&
      e.clientX < beak.right + 30 &&
      e.clientY > beak.top - 30 &&
      e.clientY < beak.bottom + 30;

    const char = dragging.char;
    setDragging(null);
    startRef.current = null;

    // A short tap counts as feeding too, so dragging is never required.
    if (overBeak || moved < 10) {
      feed(char);
    }
  };

  return (
    <div
      className="game-surface feed"
      ref={surfaceRef}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setDragging(null)}
    >
      <div className="feed-top">
        <div className="feed-luna">
          <LunaOwl mood={chewing ? 'cheer' : spat ? 'oops' : 'happy'} size={152} talking={chewing} />
          <div ref={beakRef} className={`beak-zone ${dragging ? 'is-armed' : ''} ${chewing ? 'is-chewing' : ''}`}>
            <span aria-hidden="true">{chewing ? '😋' : 'drop here'}</span>
          </div>
        </div>

        <button className="feed-sign" onClick={sayCue}>
          <span className="sign-kicker">Luna wants…</span>
          {round.cueEmoji ? (
            <span className="sign-picture">
              <span className="sign-emoji">{round.cueEmoji}</span>
              <span className="sign-word">{round.cue}</span>
              <span className="sign-hint">first letter?</span>
            </span>
          ) : (
            <span className="sign-char">{round.cue}</span>
          )}
          <span className="sign-tap">🔊 tap to hear</span>
        </button>
      </div>

      <div className="cookie-tray">
        {round.options.map(char => {
          const isEaten = eaten.includes(char);
          const isSpat = spat === char;
          const isDragged = dragging?.char === char;
          return (
            <button
              key={char}
              className={`cookie ${isEaten ? 'is-eaten' : ''} ${isSpat ? 'is-spat' : ''} ${
                isDragged ? 'is-dragged' : ''
              }`}
              onPointerDown={e => onPointerDown(e, char)}
              onClick={() => {
                // keyboard and assistive clicks never produce a drag
                if (!dragging) feed(char);
              }}
              disabled={isEaten}
              aria-label={`letter ${char}`}
            >
              <span className="cookie-char">{char}</span>
            </button>
          );
        })}
      </div>

      {dragging && (
        <span className="cookie floating" style={{ left: dragging.x, top: dragging.y }} aria-hidden="true">
          <span className="cookie-char">{dragging.char}</span>
        </span>
      )}

      <p className="feed-note">Drag a cookie to Luna — or just tap it.</p>
    </div>
  );
};

export const feedLuna: GameDef<Round> = {
  id: 'feed-luna',
  title: 'Feed Luna the Letter',
  emoji: '🍪',
  tagline: 'She only eats the letter she asked for.',
  objective: 'Match uppercase to lowercase letters and letters to their sounds.',
  skill: 'letters',
  mission: 'I am SO hungry. Feed me the right letter cookie!',
  roundsPerPlay: 5,
  shape: 'plate',
  sticker: 'cookie',
  makeRounds: ({ grade, difficulty, count }) => {
    const tier = tierFor(grade, difficulty);
    return Array.from({ length: count }, () => buildRound(tier));
  },
  Play
};
