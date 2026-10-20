import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { GameApi, GameDef } from '../../engine/types';
import { lettersFor, pick, sample, shuffle, tierFor, type LetterItem } from '../../engine/content';
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
  /** which lane of the tank it rises in: one bubble per lane near the bottom (GAME-3) */
  lane: number;
  /** when it set off (performance.now()), so the frame loop knows how far it has risen */
  born: number;
  size: number;
  popped: boolean;
  /** how far it had risen when popped: it stays there while its burst plays */
  poppedAt?: number;
  poppedRise?: number;
}

interface Round {
  letter: LetterItem;
  decoys: string[];
  needed: number;
  speed: number;
  /** how many of the bubbles on the regular rhythm are the answer (GAME-7): fewer at higher tiers */
  bag: { answers: number; of: number };
}

/**
 * How many bubbles coming in on the regular rhythm are the answer, by tier
 * (GAME-7): a shuffled bag, so a short play is never mostly the answer by
 * chance. With the extra answer that comes in whenever none is left on screen,
 * the answer is about 1 in 3 of the bubbles on screen at tier 1, 1 in 4 at
 * tier 2 and 1 in 5 at tier 3 (proposed to Alex 2026-10-10, his to settle once
 * he's seen them in play; `bubble-share-sim.mjs` checks these bags against
 * those aims). It was about half at every tier, so a child could pop without
 * listening.
 */
const ANSWER_BAG = {
  1: { answers: 2, of: 7 },
  2: { answers: 1, of: 6 },
  3: { answers: 1, of: 10 }
} as const;

/** Room round a bubble in its lane, as a share of its size (GAME-3: never touching). */
const LANE_ROOM = 1.3;
/** The most bubbles in the water at once. */
const MOST_BUBBLES = 6;
/** How long a bubble takes to fade in at the bottom and out at the top, in ms. */
const FADE_MS = 300;
/** How long a popped bubble stays for its burst, in ms. */
const BURST_MS = 420;

let bubbleId = 0;

function makeBubble(round: Round, lane: number, born: number, isTarget: boolean): Bubble {
  return {
    id: ++bubbleId,
    char: isTarget ? round.letter.letter : pick(round.decoys),
    isTarget,
    lane,
    born,
    // never under the answer size (DES-22b): a little bigger at most
    size: 1 + Math.random() * 0.25,
    popped: false
  };
}

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  // whether this round has an answer yet: its opening question waits for none (BUG-28)
  const { answered } = api;
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [popped, setPopped] = useState(0);
  // "show me" (FB-2): the bubbles that make the sound are pointed at from the third miss
  const [shown, setShown] = useState(false);
  const doneRef = useRef(false);
  const poppedRef = useRef(0);

  const sayTarget = useCallback(() => {
    soundManager.playLetterTap();
    pronunciation.speakSequence([
      { text: 'Pop the bubbles that say' },
      { sound: round.letter.letter }
    ]);
  }, [round.letter]);

  useEffect(() => {
    // not once the round has an answer: it would cut it off (BUG-28)
    const t = window.setTimeout(() => !answered() && sayTarget(), 500);
    return () => window.clearTimeout(t);
  }, [sayTarget, answered]);

  // The float loop (GAME-3): bubbles rise by a transform written straight to
  // their element each frame, so React only hears of a bubble when it comes,
  // goes or is popped. The tank is split into lanes a bubble and a bit wide,
  // and all of a round's bubbles rise at one speed, so a lane's bubbles never
  // catch each other up: none ever overlaps. They come in inside the water and
  // leave just under its top, so none is ever cut off.
  const tankRef = useRef<HTMLDivElement | null>(null);
  const slots = useRef(new Map<number, HTMLSpanElement>());
  const liveRef = useRef<Bubble[]>(bubbles);
  useEffect(() => {
    liveRef.current = bubbles;
  }, [bubbles]);

  useEffect(() => {
    let frame = 0;
    // when the last bubble came in: they arrive evenly spaced, not as a row
    let lastSpawn = -Infinity;
    let started = false;
    // whether each bubble on the rhythm is the answer: dealt from a shuffled bag (GAME-7)
    let bag: boolean[] = [];
    const deal = () => {
      if (!bag.length) bag = shuffle(Array.from({ length: round.bag.of }, (_, i) => i < round.bag.answers));
      return bag.pop() ?? false;
    };
    const loop = () => {
      frame = window.requestAnimationFrame(loop);
      const tank = tankRef.current;
      if (!tank || doneRef.current) return;
      const width = tank.clientWidth;
      const height = tank.clientHeight;
      const style = getComputedStyle(tank);
      const answer = parseFloat(style.getPropertyValue('--target-answer')) || 64;
      const floor = parseFloat(style.getPropertyValue('--space-8')) || 32;
      const biggest = answer * 1.25;
      const lanes = Math.max(3, Math.min(MOST_BUBBLES, Math.floor(width / (biggest * LANE_ROOM))));
      // the round's pace was a share of the tank's height per 60 ms tick
      const pace = ((round.speed / 100) * height) / 60 * (isReducedMotion() ? REDUCED_MOTION_PACE : 1);
      const start = height - floor - biggest; // a bubble's top as it comes in, above the sand
      const travel = start; // up to the top of the water
      const now = performance.now();
      // one comes in every crossing ÷ lanes, so about one per lane is in the water
      const gap = travel / pace / lanes;

      const rise = (b: Bubble) => (b.popped ? (b.poppedRise ?? 0) : (now - b.born) * pace);

      // the round starts with the water already part full, at staggered heights
      if (!started) {
        started = true;
        const first = sample(Array.from({ length: lanes }, (_, i) => i), Math.max(2, lanes - 1)).map((lane, k) =>
          makeBubble(round, lane, now - (k + 1) * gap, k === 0 || deal())
        );
        liveRef.current = first;
        setBubbles(first);
        lastSpawn = now;
        return;
      }
      let changed = false;
      const kept = liveRef.current.filter(b => {
        const gone = b.popped ? now - (b.poppedAt ?? now) > BURST_MS : rise(b) >= travel;
        if (gone) changed = true;
        return !gone;
      });

      // a new bubble goes in a lane whose last bubble has risen clear of the bottom
      const clear = (lane: number) => kept.every(b => b.lane % lanes !== lane || rise(b) >= biggest * LANE_ROOM);
      const free = Array.from({ length: lanes }, (_, i) => i).filter(clear);
      const live = kept.filter(b => !b.popped);
      const targets = live.filter(b => b.isTarget).length;
      // the regular rhythm, at the tier's chance; and, outside it, an extra
      // answer whenever none is left, so popping fast never fills the water
      // with answers (GAME-7)
      const onRhythm = kept.length < lanes && now - lastSpawn >= gap;
      if (free.length && (onRhythm || targets === 0)) {
        if (onRhythm) lastSpawn = now;
        const lane = free[Math.floor(Math.random() * free.length)];
        const fresh = makeBubble(round, lane, now, targets === 0 || (onRhythm && deal()));
        // two of the same wrong letter don't rise side by side
        if (!fresh.isTarget && live.some(b => b.char === fresh.char)) {
          const other = round.decoys.filter(d => !live.some(b => b.char === d));
          if (other.length) fresh.char = pick(other);
        }
        kept.push(fresh);
        changed = true;
      }
      if (changed) {
        liveRef.current = kept;
        setBubbles(kept);
      }

      // place every bubble: its lane across, its rise up, fading in and out
      for (const b of liveRef.current) {
        const el = slots.current.get(b.id);
        if (!el) continue;
        const r = rise(b);
        const x = ((b.lane % lanes) + 0.5) * (width / lanes);
        el.style.transform = `translate(${x}px, ${start - r}px) translateX(-50%)`;
        if (!b.popped) el.style.opacity = String(Math.min(1, (r / pace) / FADE_MS, (travel - r) / pace / FADE_MS));
      }
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, [round]);

  // `when` is the tap's time stamp: the same clock as the frame loop's performance.now()
  const pop = (bubble: Bubble, when: number) => {
    if (api.locked || doneRef.current || bubble.popped) return;

    // the bubble itself shows right or wrong as it goes (components.md)
    const next = liveRef.current.map(b => {
      if (b.id !== bubble.id) return b;
      // it stays where it was popped while its burst plays
      const el = slots.current.get(b.id);
      const at = el ? new DOMMatrixReadOnly(getComputedStyle(el).transform).m42 : 0;
      const tank = tankRef.current;
      const style = tank ? getComputedStyle(tank) : null;
      const height = tank?.clientHeight ?? 0;
      const biggest = (parseFloat(style?.getPropertyValue('--target-answer') ?? '') || 64) * 1.25;
      const start = height - (parseFloat(style?.getPropertyValue('--space-8') ?? '') || 32) - biggest;
      return { ...b, popped: true, poppedAt: when, poppedRise: start - at };
    });
    liveRef.current = next;
    setBubbles(next);

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
    <GameSurface>
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
      <div className={styles.tank} ref={tankRef}>
        {bubbles.map(b => (
          // the slot rises (the frame loop moves it); the bubble inside keeps
          // its own pop and wobble
          <span
            key={b.id}
            className={styles.slot}
            style={{ '--size': b.size, opacity: 0 } as React.CSSProperties}
            ref={el => {
              if (el) slots.current.set(b.id, el);
              else slots.current.delete(b.id);
            }}
          >
            <button
              className={styles.bubble}
              // a game piece in the one answer language (components.md)
              data-state={b.popped ? (b.isTarget ? 'right' : 'wrong') : shown && b.isTarget ? 'revealed' : undefined}
              onClick={e => pop(b, e.timeStamp)}
              aria-label={`bubble ${b.char}`}
            >
              <span className={styles.char}>{b.char}</span>
            </button>
          </span>
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
        speed: tier === 1 ? 0.55 : tier === 2 ? 0.75 : 0.95,
        bag: ANSWER_BAG[tier]
      });
    }
    return rounds;
  },
  Play
};
