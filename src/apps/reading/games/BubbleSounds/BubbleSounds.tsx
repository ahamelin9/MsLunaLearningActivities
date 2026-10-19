import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { GameApi, GameDef } from '../../engine/types';
import { lettersFor, pick, sample, tierFor, type LetterItem } from '../../engine/content';
import { pickWrong, textChoice } from '../../engine/distractors';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { ChunkyButton, ProgressBar } from '@/components/kit';
import { isReducedMotion, REDUCED_MOTION_PACE } from '@/utils/motion';
import { GameSurface } from '../shared/GameSurface/GameSurface';
import styles from './BubbleSounds.module.scss';

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
    // with less motion the bubbles slow down, since their rising is the game (DES-6)
    speed: round.speed * (0.8 + Math.random() * 0.5) * (isReducedMotion() ? REDUCED_MOTION_PACE : 1),
    // never under the answer size (DES-22b): a little bigger at most
    size: 1 + Math.random() * 0.25,
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
  // "show me" (FB-2): the bubbles that make the sound are pointed at from the third miss
  const [shown, setShown] = useState(false);
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

    // the bubble itself shows right or wrong as it goes (components.md)
    setBubbles(prev => prev.map(b => (b.id === bubble.id ? { ...b, popped: true, poppedAt: Date.now() } : b)));

    if (bubble.isTarget) {
      soundManager.playPop();
      poppedRef.current += 1;
      setPopped(poppedRef.current);

      if (poppedRef.current >= round.needed) {
        doneRef.current = true;
        // its sound, whole, then Luna's cheer (FB-1)
        api.answer({ correct: true, say: [{ sound: round.letter.letter }], delay: 1500 });
      } else {
        pronunciation.speakLetterSound(round.letter.letter);
        api.tick();
      }
    } else {
      // "That one says /m/", whole, before Luna's line (FB-1)
      api.answer({
        correct: false,
        say: [{ text: 'That one says' }, { sound: bubble.char }],
        reveal: () => setShown(true),
        hint: [{ text: 'Listen for' }, { sound: round.letter.letter }, { text: 'like' }, { word: round.letter.anchor }]
      });
    }
  };

  return (
    <GameSurface className={styles.bubbles}>
      <div className={styles.header}>
        {/* the sound is only ever heard: written here, it would name the bubble to pop */}
        <ChunkyButton variant="prompt" icon="speaker" onClick={sayTarget} title="Hear the sound again">
          Listen
        </ChunkyButton>
        <ProgressBar
          size="rounds"
          done={popped}
          total={round.needed}
          label={`${popped} of ${round.needed} popped`}
          className={styles.tally}
        />
      </div>

      {/* the water, in the game's own tint, as on its Play Shelf picture */}
      <div className={styles.tank}>
        {bubbles.map(b => (
          <button
            key={b.id}
            className={styles.bubble}
            // a game piece in the one answer language (components.md)
            data-state={b.popped ? (b.isTarget ? 'right' : 'wrong') : shown && b.isTarget ? 'revealed' : undefined}
            style={{ left: `${b.x}%`, top: `${b.y}%`, '--size': b.size } as React.CSSProperties}
            onClick={() => pop(b)}
            aria-label={`bubble ${b.char}`}
          >
            <span className={styles.shine} aria-hidden="true" />
            <span className={styles.char}>{b.char}</span>
          </button>
        ))}

        <div className={styles.floor} aria-hidden="true" />
      </div>
    </GameSurface>
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
    // any letter in the tier's pool, none twice in a play (BUG-21: slots i*3
    // to i*3+2 only ever reached the pool's first 12)
    const letters = sample(pool, count);

    for (let i = 0; i < count; i++) {
      const letter = letters[i % letters.length];
      const decoys = pickWrong(letter.letter, pool.map(l => l.letter), 10, { as: textChoice, letterBy: 'sound' });

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
