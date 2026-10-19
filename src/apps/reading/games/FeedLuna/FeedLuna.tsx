import React, { useEffect, useRef, useState } from 'react';
import type { GameApi, GameDef } from '../../engine/types';
import { lettersFor, pick, shuffle, tierFor, wordsUpTo, type LetterItem, type WordItem } from '../../engine/content';
import { pickWrong, textChoice } from '../../engine/distractors';
import { Icon, ListenCue, Luna } from '@/components/kit';
import { soundManager } from '@/utils/audio';
import { pronunciation, type SpeechPart } from '@/utils/pronunciation';
import { afterMotion } from '@/utils/motion';
import { GameSurface } from '../shared/GameSurface/GameSurface';
import { cx, dataState } from '@/utils/cx';
import styles from './FeedLuna.module.scss';

type Mode = 'toLower' | 'toUpper' | 'bySound' | 'byWord';

interface Round {
  mode: Mode;
  /**
   * What Luna's sign says. Never the letter, its sound or the word: the child
   * knows their letters, so any of those would be the answer in writing.
   */
  ask: string;
  cueEmoji?: string;
  /** spoken as a sequence so a phoneme stays a phoneme */
  cueParts: SpeechPart[];
  /** said after a second wrong cookie */
  hint: SpeechPart[];
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
  const decoyCount = tier === 1 ? 2 : 3;
  /** wrong cookies: never the same letter, nor one that makes the same sound when sounds are asked for */
  const wrongCookies = (answer: string, cased: (letter: string) => string, letterBy: 'sound' | 'name') =>
    pickWrong(answer, letters.map(l => cased(l.letter)), decoyCount, { as: textChoice, letterBy });
  const lower = (l: string) => l.toLowerCase();
  const upper = (l: string) => l;

  if (mode === 'byWord') {
    const word: WordItem = pick(
      wordsUpTo(tier).filter(w => w.initial.length === 1 && letters.some(l => l.letter.toLowerCase() === w.initial))
    );
    const answer = word.initial.toLowerCase();
    // "cat" starts with the sound k makes too, so k can't be a wrong cookie
    const decoys = wrongCookies(answer, lower, 'sound');
    return {
      mode,
      ask: 'first letter?',
      cueEmoji: word.emoji,
      cueParts: [{ text: 'I want the first letter of' }, { word: word.word }],
      hint: [{ text: 'Stretch the word.' }, { word: word.word }, { text: 'What is the very first sound?' }],
      answer,
      options: shuffle([answer, ...decoys])
    };
  }

  if (mode === 'bySound') {
    const cased = tier === 1 ? upper : lower;
    const answer = cased(letter.letter);
    const decoys = wrongCookies(answer, cased, 'sound');
    return {
      mode,
      ask: 'the letter for this sound',
      cueParts: [{ text: 'I am hungry for the letter that says' }, { sound: letter.letter }],
      hint: [{ text: 'Listen again.' }, { sound: letter.letter }, { text: 'Which letter makes that sound?' }],
      answer,
      options: shuffle([answer, ...decoys])
    };
  }

  // Luna names the letter and says which size she wants; the sign does not
  // show its partner, or the round is just matching two shapes
  const toLower = mode === 'toLower';
  const answer = toLower ? letter.letter.toLowerCase() : letter.letter;
  const cueParts: SpeechPart[] = toLower
    ? [{ text: 'Find the little' }, { name: letter.letter }]
    : [{ text: 'Find the big' }, { name: letter.letter }];
  const decoys = wrongCookies(answer, toLower ? lower : upper, 'name');

  return {
    mode,
    ask: toLower ? 'a little letter' : 'a BIG letter',
    cueParts,
    hint: [{ text: 'Listen carefully.' }, ...cueParts],
    answer,
    options: shuffle([answer, ...decoys])
  };
}

/** Where a cookie's chocolate chips sit (DES-14): four layouts, drawn in FeedLuna.module.scss by `data-chips`. */
const CHIP_LAYOUTS = 4;

/**
 * Which chips each letter's cookie has: neighbours on the plate always
 * differ, and where the layouts start moves with the round's answer, so the
 * rounds don't all look alike.
 */
const chipsOf = (round: Round, char: string) =>
  ((round.options.indexOf(char) + round.answer.charCodeAt(0)) % CHIP_LAYOUTS) + 1;

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [eaten, setEaten] = useState<string[]>([]);
  const [spat, setSpat] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ char: string; x: number; y: number } | null>(null);
  const [chewing, setChewing] = useState(false);
  // "show me" (FB-2): the right cookie is pointed at from the third miss
  const [shown, setShown] = useState(false);

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

      // She names what she ate (no "Mmm!", Alex), and only then cheers: the
      // shell's one answer path says it whole first (FB-1; BUG-19 did this
      // here alone before)
      api.answer({
        correct: true,
        say: [char === char.toLowerCase() ? { text: 'little' } : { text: 'big' }, { name: char }],
        delay: 1900
      });
    } else {
      // a wrong cookie wobbles, and clears when its wobble ends (components.md)
      setSpat(char);
      afterMotion('emphasis', () => setSpat(null));
      api.answer({ correct: false, hint: round.hint, reveal: () => setShown(true) });
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
    <GameSurface
      className={styles.feed}
      ref={surfaceRef}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setDragging(null)}
    >
      <div className={styles.top}>
        <div className={styles.luna}>
          <Luna mood={chewing ? 'cheer' : spat ? 'oops' : 'happy'} size={152} />
          <div ref={beakRef} className={styles.beakZone}
            data-state={dataState(dragging ? 'armed' : false, chewing ? 'chewing' : false)}>
            {chewing ? <Icon name="check" /> : <span aria-hidden="true">drop here</span>}
          </div>
        </div>

        {/* what she wants, heard and never shown: the kit's "?" (a word's
            picture for "the first letter of…"), which shows the letter only
            once she has eaten it */}
        <ListenCue
          state={eaten.includes(round.answer) ? 'found' : 'waiting'}
          answer={round.answer}
          picture={round.cueEmoji}
          listenText={round.ask}
          label="Hear what Luna wants"
          onClick={sayCue}
        />
      </div>

      <div className={styles.tray}>
        {round.options.map(char => {
          const isEaten = eaten.includes(char);
          const isSpat = spat === char;
          const isDragged = dragging?.char === char;
          return (
            <button
              key={char}
              className={styles.cookie}
              data-shot="cookie"
              data-chips={chipsOf(round, char)}
              // a game piece in the one answer language (components.md)
              data-state={dataState(
                isEaten ? 'right' : false,
                isSpat ? 'wrong' : false,
                isDragged ? 'dragged' : false,
                shown && !isEaten && char === round.answer ? 'revealed' : false
              )}
              onPointerDown={e => onPointerDown(e, char)}
              onClick={e => {
                // only a keyboard or assistive click (detail 0) feeds here: a
                // tap already fed her on pointer-up, and its click would feed
                // her again, two misses for one wrong tap (BUG-2)
                if (e.detail === 0) feed(char);
              }}
              disabled={isEaten}
              aria-label={`letter ${char}`}
            >
              <span className={styles.cookieChar}>{char}</span>
            </button>
          );
        })}
      </div>

      {dragging && (
        <span
          className={cx(styles.cookie, styles.floating)}
          data-chips={chipsOf(round, dragging.char)}
          style={{ left: dragging.x, top: dragging.y }}
          aria-hidden="true"
        >
          <span className={styles.cookieChar}>{dragging.char}</span>
        </span>
      )}

      <p className={styles.note}>Drag a cookie to Luna — or just tap it.</p>
    </GameSurface>
  );
};

export const feedLuna: GameDef<Round> = {
  id: 'feed-luna',
  title: 'Feed Luna the Letter',
  emoji: '🍪',
  tagline: 'She only eats the letter she asked for.',
  objective: 'Hear a letter’s name, its sound or a word, then find that letter — big or little.',
  skill: 'letters',
  mission: 'I am SO hungry. Feed me the right letter cookie!',
  roundsPerPlay: 5,
  shape: 'plate',
  ownLuna: true,
  sticker: 'cookie',
  makeRounds: ({ grade, difficulty, count }) => {
    const tier = tierFor(grade, difficulty);
    return Array.from({ length: count }, () => buildRound(tier));
  },
  Play
};
