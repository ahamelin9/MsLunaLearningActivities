import React, { useEffect, useRef, useState } from 'react';
import type { GameApi, GameDef } from '../../engine/types';
import { lettersFor, pick, shuffle, tierFor } from '../../engine/content';
import { pickWrong, textChoice } from '../../engine/distractors';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { ChunkyButton } from '@/components/kit';
import { afterMotion } from '@/utils/motion';
import { GameSurface } from '../shared/GameSurface/GameSurface';
import { StagePrompt } from '../shared/StagePrompt/StagePrompt';
import { dataState } from '@/utils/cx';
import styles from './LetterHunt.module.scss';

interface Bug {
  id: string;
  char: string;
  /** a little off the middle of its grid cell, as a share of the cell (0.45 to 0.55) */
  jx: number;
  jy: number;
  tilt: number;
  /** which of the five picture tints it wears (never a rainbow) */
  tint: number;
  isTarget: boolean;
}

interface Round {
  target: string;
  /** at tier 2+ the lowercase twin counts too */
  alsoAccept: string | null;
  bugs: Bug[];
  targetCount: number;
}

/** Letters that genuinely fool young readers, so decoys are never random noise. */
const LOOKALIKES: Record<string, string[]> = {
  B: ['D', 'P', 'R'],
  D: ['B', 'O', 'P'],
  P: ['B', 'D', 'R'],
  M: ['N', 'W', 'H'],
  N: ['M', 'U', 'H'],
  W: ['M', 'V', 'N'],
  S: ['Z', 'C', 'G'],
  C: ['G', 'O', 'S'],
  O: ['Q', 'C', 'D'],
  T: ['I', 'F', 'L'],
  F: ['E', 'T', 'P'],
  A: ['H', 'R', 'V']
};

function buildRound(tier: 1 | 2 | 3): Round {
  const letters = lettersFor(tier).filter(l => l.letter.length === 1);
  const target = pick(letters).letter;
  const alsoAccept = tier >= 2 ? target.toLowerCase() : null;

  const targetCount = tier === 1 ? 3 : tier === 2 ? 4 : 5;
  const decoyCount = tier === 1 ? 9 : tier === 2 ? 13 : 17;

  // wrong bugs: the target's look-alikes and the other letters, never the target itself
  const wrongFrom = (pool: string[]) => pickWrong(target, pool, pool.length, { as: textChoice, letterBy: 'name' });
  const lookalikes = wrongFrom(LOOKALIKES[target] ?? []);
  const others = wrongFrom(letters.map(l => l.letter));

  // Where each bug sits is worked out on the screen, on a grid shaped like the
  // field (gridFor), so answer-sized bugs never touch at any size (DES-22b).
  // The round only fixes their order and how far off the middle each one sits.
  const bugs: Bug[] = [];
  const place = (char: string, isTarget: boolean, i: number) => {
    bugs.push({
      id: `bug-${i}-${char}`,
      char,
      jx: 0.45 + Math.random() * 0.1,
      jy: 0.45 + Math.random() * 0.1,
      // a playful lean, small enough that a leaning I still reads as an I (DES-22b; was ±25°)
      tilt: Math.random() * 24 - 12,
      tint: 1 + Math.floor(Math.random() * 5),
      isTarget
    });
  };

  for (let i = 0; i < targetCount; i++) {
    const char = alsoAccept && i % 2 === 1 ? alsoAccept : target;
    place(char, true, i);
  }
  for (let i = 0; i < decoyCount; i++) {
    const useLookalike = lookalikes.length > 0 && Math.random() < 0.55;
    const raw = useLookalike ? pick(lookalikes) : pick(others);
    const char = tier >= 2 && Math.random() < 0.4 ? raw.toLowerCase() : raw;
    place(char, false, targetCount + i);
  }

  return { target, alsoAccept, bugs: shuffle(bugs), targetCount };
}

/**
 * The bugs' grid for a field of this shape: about square cells, so a short,
 * wide field (the 1024×768 iPad) gets more columns and fewer rows. The empty
 * cells are spread through it, and each bug sits near the middle of its cell.
 */
function gridFor(bugs: Bug[], width: number, height: number) {
  const total = bugs.length;
  const cols = Math.max(3, Math.min(total, Math.ceil(Math.sqrt((total * width) / Math.max(1, height)))));
  const rows = Math.ceil(total / cols);
  const cells = cols * rows;
  return bugs.map((bug, i) => {
    const cell = Math.floor((i * cells) / total);
    return {
      left: `${((cell % cols) + bug.jx) * (100 / cols)}%`,
      top: `${(Math.floor(cell / cols) + bug.jy) * (100 / rows)}%`
    };
  });
}

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [caught, setCaught] = useState<string[]>([]);
  const [missId, setMissId] = useState<string | null>(null);
  // "show me" (FB-2): the letters still to catch are pointed at from the third miss
  const [shown, setShown] = useState(false);
  // the field's shape, measured, so the grid fits it (and follows a turn of the iPad)
  const crawlRef = useRef<HTMLDivElement | null>(null);
  const [field, setField] = useState({ width: 5, height: 2 });
  useEffect(() => {
    const el = crawlRef.current;
    if (!el) return;
    const measure = () => setField({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    return () => watch.disconnect();
  }, []);
  const spots = gridFor(round.bugs, field.width, field.height);

  const announce = () => {
    soundManager.playLetterTap();
    pronunciation.speakSequence([
      { text: 'Find every letter' },
      { name: round.target },
      ...(round.alsoAccept ? [{ text: 'Big ones and little ones!' }] : [])
    ]);
  };

  useEffect(() => {
    // not once the round has an answer: it would cut it off (BUG-28)
    const t = window.setTimeout(() => !api.answered() && announce(), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grab = (bug: Bug) => {
    if (api.locked || caught.includes(bug.id)) return;

    if (bug.isTarget) {
      const next = [...caught, bug.id];
      setCaught(next);

      if (next.length >= round.targetCount) {
        // its name, whole, then Luna's cheer (FB-1)
        api.answer({ correct: true, say: [{ name: bug.char }], delay: 1600 });
      } else {
        pronunciation.speakLetterName(bug.char);
        api.tick();
      }
    } else {
      // a wrong letter wobbles, and clears when its wobble ends (components.md)
      setMissId(bug.id);
      afterMotion('emphasis', () => setMissId(null));
      // "That is G", whole, before Luna's line (FB-1, BUG-1)
      api.answer({
        correct: false,
        say: [{ text: 'That is' }, { name: bug.char }],
        reveal: () => setShown(true),
        hint: [
          { text: 'That one is a tricky twin!' },
          { text: 'Find every letter' },
          { name: round.target },
          ...(round.alsoAccept ? [{ text: 'Big ones and little ones!' }] : [])
        ]
      });
    }
  };

  const remaining = round.targetCount - caught.length;

  return (
    <GameSurface>
      {/* the letter is only ever heard: shown here, the hunt is just matching shapes */}
      <div className={styles.header}>
        <StagePrompt>Catch every letter I say</StagePrompt>
        <ChunkyButton variant="prompt" icon="speaker" onClick={announce}>
          Say it again
        </ChunkyButton>
      </div>

      <div className={styles.field}>
        {/* the bugs are placed in here, a bug's half-width in from the edge, so none is cut off */}
        <div className={styles.crawl} ref={crawlRef}>
          {round.bugs.map((bug, i) => {
            const isCaught = caught.includes(bug.id);
            return (
              <button
                key={bug.id}
                className={styles.bug}
                // a game piece in the one answer language (components.md)
                data-state={dataState(
                  isCaught ? 'right' : false,
                  missId === bug.id ? 'wrong' : false,
                  shown && bug.isTarget && !isCaught ? 'revealed' : false
                )}
                data-tint={bug.tint}
                style={{ ...spots[i], '--tilt': `${bug.tilt}deg` } as React.CSSProperties}
                onClick={() => grab(bug)}
                aria-label={`letter ${bug.char}`}
                disabled={isCaught}
              >
                <span className={styles.body}>{bug.char}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.jar}>
        <div className={styles.pot}>
          <span className={styles.lid} aria-hidden="true" />
          <div className={styles.glass}>
            <div className={styles.fill} style={{ height: `${(caught.length / round.targetCount) * 100}%` }} />
            <span className={styles.count}>
              {caught.length}/{round.targetCount}
            </span>
          </div>
        </div>
        <p className={styles.note}>
          {remaining > 0 ? `${remaining} still loose!` : 'All safe in the jar!'}
        </p>
      </div>
    </GameSurface>
  );
};

export const letterHunt: GameDef<Round> = {
  id: 'letter-hunt',
  title: 'The Letter Jar',
  emoji: '🫙',
  tagline: 'Letters escaped! Catch every single one.',
  objective: 'Letter recognition — hear a letter’s name, then find it among letters that look alike.',
  skill: 'letters',
  mission: 'They wriggled out of the jar again. Catch them all!',
  roundsPerPlay: 4,
  shape: 'jar',
  sticker: 'jar',
  makeRounds: ({ grade, difficulty, count }) => {
    const tier = tierFor(grade, difficulty);
    const rounds: Round[] = [];
    const used = new Set<string>();
    let guard = 0;
    while (rounds.length < count && guard < 40) {
      guard++;
      const r = buildRound(tier);
      if (used.has(r.target)) continue;
      used.add(r.target);
      rounds.push(r);
    }
    while (rounds.length < count) rounds.push(buildRound(tier));
    return rounds;
  },
  Play
};
