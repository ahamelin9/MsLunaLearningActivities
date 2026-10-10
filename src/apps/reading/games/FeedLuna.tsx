import React, { useEffect, useRef, useState } from 'react';
import type { GameApi, GameDef } from '../engine/types';
import { lettersFor, pick, shuffle, tierFor, wordsUpTo, type LetterItem, type WordItem } from '../engine/content';
import { pickWrong, textChoice } from '../engine/distractors';
import { LunaOwl } from '../engine/LunaOwl';
import { soundManager } from '../../../utils/audio';
import { pronunciation, type SpeechPart } from '../../../utils/pronunciation';

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

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [eaten, setEaten] = useState<string[]>([]);
  const [spat, setSpat] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ char: string; x: number; y: number } | null>(null);
  const [chewing, setChewing] = useState(false);

  const beakRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  /** she is naming the cookie she ate: taps wait until she has cheered */
  const naming = useRef(false);
  const cheerTimer = useRef<number | undefined>(undefined);

  // a timer must not cheer for a round the child has left
  useEffect(() => () => window.clearTimeout(cheerTimer.current), []);

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
    if (api.locked || naming.current || eaten.includes(char)) return;

    if (char === round.answer) {
      naming.current = true;
      setEaten([...eaten, char]);
      setChewing(true);
      soundManager.playLetterSnap();

      // She names what she ate (no "Mmm!", Alex), and only then cheers. Both
      // at once, the cheer was cut off a quarter-second in and the two
      // sounded like one jumble. A watchdog cheers anyway if the name's end
      // is never reported.
      let cheered = false;
      const cheer = () => {
        if (cheered) return;
        cheered = true;
        window.clearTimeout(cheerTimer.current);
        api.win({ delay: 1900 });
      };
      cheerTimer.current = window.setTimeout(cheer, 2500);
      pronunciation.speakSequence(
        [char === char.toLowerCase() ? { text: 'little' } : { text: 'big' }, { name: char }],
        { onEnd: cheer }
      );
    } else {
      setSpat(char);
      window.setTimeout(() => setSpat(null), 800);
      api.miss({ hint: round.hint });
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
              <span className="sign-hint">{round.ask}</span>
            </span>
          ) : (
            <>
              <span className="sign-char" aria-hidden="true">?</span>
              <span className="sign-hint">{round.ask}</span>
            </>
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
  objective: 'Hear a letter’s name, its sound or a word, then find that letter — big or little.',
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
