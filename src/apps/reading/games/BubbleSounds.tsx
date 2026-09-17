import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { GameApi, GameDef } from '../engine/types';
import { lettersFor, pick, sample, tierFor, type LetterItem } from '../engine/content';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';

interface Bubble {
  id: number;
  char: string;
  isTarget: boolean;
  x: number;
  y: number;
  speed: number;
  size: number;
  drift: number;
  popped: boolean;
  poppedAt?: number;
}

interface Round {
  letter: LetterItem;
  decoys: string[];
  needed: number;
  speed: number;
}

let bubbleId = 0;

function makeBubble(round: Round, forceTarget = false): Bubble {
  const isTarget = forceTarget || Math.random() < 0.38;
  return {
    id: ++bubbleId,
    char: isTarget ? round.letter.letter : pick(round.decoys),
    isTarget,
    x: 8 + Math.random() * 84,
    y: 104 + Math.random() * 40,
    speed: round.speed * (0.8 + Math.random() * 0.5),
    size: 0.85 + Math.random() * 0.4,
    drift: Math.random() * 2 - 1,
    popped: false
  };
}

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>(() => [
    makeBubble(round, true),
    makeBubble(round),
    makeBubble(round),
    makeBubble(round, true),
    makeBubble(round)
  ]);
  const [popped, setPopped] = useState(0);
  const [splash, setSplash] = useState<{ id: number; ok: boolean } | null>(null);
  const doneRef = useRef(false);
  const poppedRef = useRef(0);

  const spawn = useCallback((forceTarget = false) => makeBubble(round, forceTarget), [round]);

  const sayTarget = useCallback(() => {
    soundManager.playLetterTap();
    pronunciation.speakSequence([
      { text: 'Pop the bubbles that say' },
      { sound: round.letter.letter }
    ]);
  }, [round.letter]);

  useEffect(() => {
    const t = window.setTimeout(sayTarget, 500);
    return () => window.clearTimeout(t);
  }, [sayTarget]);

  // The float loop: bubbles rise, drift, and are replaced when they escape.
  // The next frame is built outside setState so spawning stays a side effect.
  const liveRef = useRef<Bubble[]>(bubbles);
  useEffect(() => {
    liveRef.current = bubbles;
  }, [bubbles]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (doneRef.current) return;
      const now = Date.now();
      const moved = liveRef.current
        .map(b => (b.popped ? b : { ...b, y: b.y - b.speed, x: b.x + b.drift * 0.12 }))
        // popped bubbles linger just long enough for the burst to play
        .filter(b => b.y > -18 && (!b.popped || now - (b.poppedAt ?? 0) < 420));

      while (moved.length < 6) {
        const live = moved.filter(b => !b.popped);
        const needTarget = live.filter(b => b.isTarget).length < 2;
        const fresh = spawn(needTarget);
        // avoid two identical decoys drifting side by side
        if (!fresh.isTarget && live.some(b => b.char === fresh.char)) {
          fresh.char = pick(round.decoys.filter(d => !live.some(b => b.char === d)) ?? [fresh.char]);
        }
        moved.push(fresh);
      }

      liveRef.current = moved;
      setBubbles(moved);
    }, 60);

    return () => window.clearInterval(interval);
  }, [spawn, round.decoys]);

  const pop = (bubble: Bubble) => {
    if (api.locked || doneRef.current || bubble.popped) return;

    setBubbles(prev => prev.map(b => (b.id === bubble.id ? { ...b, popped: true, poppedAt: Date.now() } : b)));
    setSplash({ id: bubble.id, ok: bubble.isTarget });
    window.setTimeout(() => setSplash(null), 450);

    if (bubble.isTarget) {
      soundManager.playPop();
      pronunciation.speakLetterSound(round.letter.letter);
      poppedRef.current += 1;
      setPopped(poppedRef.current);

      if (poppedRef.current >= round.needed) {
        doneRef.current = true;
        api.win({ delay: 1500 });
      } else {
        api.tick();
      }
    } else {
      pronunciation.speakSequence([{ text: 'That one says' }, { sound: bubble.char }]);
      api.miss({
        hint: `You want ${round.letter.sound}, like ${round.letter.anchor}. That bubble is ${bubble.char}.`
      });
    }
  };

  return (
    <div className="game-surface bubbles">
      <div className="bubble-header">
        <button className="sound-horn small" onClick={sayTarget}>
          <span className="horn-icon" aria-hidden="true">🫧</span>
          <span className="horn-sound">{round.letter.sound}</span>
        </button>
        <div className="bubble-tally" aria-label={`${popped} of ${round.needed} popped`}>
          {Array.from({ length: round.needed }).map((_, i) => (
            <span key={i} className={`tally-dot ${i < popped ? 'lit' : ''}`} />
          ))}
        </div>
      </div>

      <div className="bubble-tank">
        {bubbles.map(b => (
          <button
            key={b.id}
            className={`bubble ${b.popped ? 'is-popped' : ''}`}
            style={{ left: `${b.x}%`, top: `${b.y}%`, '--size': b.size } as React.CSSProperties}
            onClick={() => pop(b)}
            aria-label={`bubble ${b.char}`}
          >
            <span className="bubble-shine" aria-hidden="true" />
            <span className="bubble-char">{b.char}</span>
          </button>
        ))}

        {splash && (
          <span className={`bubble-splash ${splash.ok ? 'ok' : 'no'}`} aria-hidden="true">
            {splash.ok ? '✦' : '💧'}
          </span>
        )}

        <div className="tank-floor" aria-hidden="true">
          <span>🐠</span>
          <span>🪸</span>
          <span>🐚</span>
        </div>
      </div>
    </div>
  );
};

export const bubbleSounds: GameDef<Round> = {
  id: 'bubble-sounds',
  title: 'Bubble Sounds',
  emoji: '🫧',
  tagline: 'Pop only the bubbles that make the right sound.',
  objective: 'Match a spoken phoneme to its letter under light time pressure (sound–symbol fluency).',
  skill: 'phonics',
  mission: 'Quick! Pop the bubbles with that sound before they float away!',
  roundsPerPlay: 4,
  shape: 'bubbles',
  sticker: 'bubble',
  makeRounds: ({ grade, difficulty, count }) => {
    const tier = tierFor(grade, difficulty);
    const pool = lettersFor(tier);
    const rounds: Round[] = [];

    for (let i = 0; i < count; i++) {
      const letter = pool[(i * 3 + Math.floor(Math.random() * 3)) % pool.length];
      const decoys = sample(
        pool.filter(l => l.letter !== letter.letter).map(l => l.letter),
        10
      );

      rounds.push({
        letter,
        decoys,
        needed: tier === 1 ? 3 : 4,
        speed: tier === 1 ? 0.55 : tier === 2 ? 0.75 : 0.95
      });
    }
    return rounds;
  },
  Play
};
