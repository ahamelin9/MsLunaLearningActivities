import React, { useEffect, useState } from 'react';
import type { GameApi, GameDef } from '../engine/types';
import { lettersFor, pick, shuffle, tierFor } from '../engine/content';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';

interface Bug {
  id: string;
  char: string;
  x: number;
  y: number;
  tilt: number;
  size: number;
  hue: number;
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

  const lookalikes = LOOKALIKES[target] ?? [];
  const others = letters.map(l => l.letter).filter(l => l !== target);

  const total = targetCount + decoyCount;
  // Lay the letters on a jittered grid so they never sit on top of each other.
  const cols = Math.max(3, Math.ceil(Math.sqrt(total * 1.7)));
  const rows = Math.ceil(total / cols);
  const cells = shuffle(
    Array.from({ length: cols * rows }, (_, i) => ({ col: i % cols, row: Math.floor(i / cols) }))
  ).slice(0, total);

  const bugs: Bug[] = [];
  const place = (char: string, isTarget: boolean, i: number) => {
    const cell = cells[i];
    const cellW = 100 / cols;
    const cellH = 100 / rows;
    bugs.push({
      id: `bug-${i}-${char}`,
      char,
      x: cell.col * cellW + cellW * (0.3 + Math.random() * 0.4),
      y: cell.row * cellH + cellH * (0.28 + Math.random() * 0.44),
      tilt: Math.random() * 50 - 25,
      size: 0.9 + Math.random() * 0.35,
      hue: Math.floor(Math.random() * 360),
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

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [caught, setCaught] = useState<string[]>([]);
  const [missId, setMissId] = useState<string | null>(null);

  const announce = () => {
    soundManager.playLetterTap();
    pronunciation.speakSequence([
      { text: 'Find every letter' },
      { name: round.target },
      ...(round.alsoAccept ? [{ text: 'Big ones and little ones!' }] : [])
    ]);
  };

  useEffect(() => {
    const t = window.setTimeout(announce, 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grab = (bug: Bug) => {
    if (api.locked || caught.includes(bug.id)) return;

    if (bug.isTarget) {
      const next = [...caught, bug.id];
      setCaught(next);
      pronunciation.speakLetterName(bug.char);

      if (next.length >= round.targetCount) {
        api.win({ delay: 1600 });
      } else {
        api.tick();
      }
    } else {
      setMissId(bug.id);
      window.setTimeout(() => setMissId(null), 600);
      pronunciation.speakSequence([{ text: 'That is' }, { name: bug.char }]);
      api.miss({
        hint: `You want ${round.target}${round.alsoAccept ? ` or ${round.alsoAccept}` : ''}. ${bug.char} is a tricky twin!`
      });
    }
  };

  const remaining = round.targetCount - caught.length;

  return (
    <div className="game-surface hunt">
      <div className="hunt-header">
        <div className="hunt-target">
          <span className="hunt-label">Catch every</span>
          <span className="hunt-char">{round.target}</span>
          {round.alsoAccept && <span className="hunt-twin">{round.alsoAccept}</span>}
        </div>
        <button className="speak-chip" onClick={announce}>
          🔊 Say it again
        </button>
      </div>

      <div className="hunt-field">
        {round.bugs.map(bug => {
          const isCaught = caught.includes(bug.id);
          return (
            <button
              key={bug.id}
              className={`hunt-bug ${isCaught ? 'is-caught' : ''} ${missId === bug.id ? 'is-miss' : ''}`}
              style={{
                left: `${bug.x}%`,
                top: `${bug.y}%`,
                '--tilt': `${bug.tilt}deg`,
                '--size': bug.size,
                '--hue': bug.hue
              } as React.CSSProperties}
              onClick={() => grab(bug)}
              aria-label={`letter ${bug.char}`}
              disabled={isCaught}
            >
              {bug.char}
            </button>
          );
        })}
      </div>

      <div className="hunt-jar">
        <div className="jar-glass">
          <div className="jar-fill" style={{ height: `${(caught.length / round.targetCount) * 100}%` }} />
          <span className="jar-count">
            {caught.length}/{round.targetCount}
          </span>
        </div>
        <p className="jar-note">
          {remaining > 0 ? `${remaining} still loose!` : 'All safe in the jar!'}
        </p>
      </div>
    </div>
  );
};

export const letterHunt: GameDef<Round> = {
  id: 'letter-hunt',
  title: 'The Letter Jar',
  emoji: '🫙',
  tagline: 'Letters escaped! Catch every single one.',
  objective: 'Letter recognition — discriminate a target letter from visually similar letters.',
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
