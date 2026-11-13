import type React from 'react';
import type { GradeLevel } from '../../../types/reading';
import type { Difficulty } from './content';
import type { LunaMood } from './luna';
import type { SpeechPart } from '../../../utils/pronunciation';
import type { TimerKind } from './timer';

export interface GameContext {
  grade: GradeLevel;
  difficulty: Difficulty;
  roundIndex: number;
  totalRounds: number;
  /** the round this play began on: 0, or where a lesson left part-way picks up (PRG-8) */
  firstRound: number;
}

/**
 * The contract every mini-game plays against. The shell owns the loop
 * (start, feedback, reward, next); a game only says what happened.
 */
export interface GameApi {
  ctx: GameContext;
  /** misses so far in this round */
  attempts: number;
  /** 0 = no help yet, 1 = nudge, 2 = show me */
  hintLevel: 0 | 1 | 2;
  /** the round is over, or an answer is being said; ignore further input */
  locked: boolean;
  /**
   * Whether this round has had an answer yet (BUG-28). A round's opening
   * question, said on a timer, doesn't play once it has, so it never cuts off
   * a quick child's answer.
   */
  answered: () => boolean;
  /**
   * The one way to answer (FB-1): the shell says `say` (the choice, a
   * read-back), waits for it to end, then reacts, so Luna never cuts the
   * game's own line off. A watchdog settles it if the speech never reports
   * its end. Input is locked meanwhile.
   * - correct: the round is solved; `delay` is how long the win shows
   *   before the next round.
   * - not correct: never a failure, always another go. The hint is spoken
   *   from the second miss on, never shown: written on screen it would hand
   *   a child who knows their letters the answer. Build it from parts so a
   *   phoneme stays a phoneme and every piece is a clip that was rendered.
   * `lunaLine` replaces Luna's usual line.
   * - `reveal` (FB-2): from the third miss in a round the shell calls it, so
   *   the game points at the answer (its piece in the `revealed` state), and
   *   Luna says a reveal line instead of another "try again". The round can
   *   still be finished; it just isn't clean.
   */
  answer: (opts: {
    correct: boolean;
    say?: SpeechPart[];
    hint?: SpeechPart[];
    lunaLine?: string;
    delay?: number;
    reveal?: () => void;
  }) => void;
  /** a small good beat inside a round, e.g. 2 of 4 letters found; `say` is said whole before Luna's line */
  tick: (opts?: { lunaLine?: string; say?: SpeechPart[] }) => void;
  /** let Luna speak out of turn */
  say: (text: string, mood?: LunaMood) => void;
  /**
   * The round starts asking now (CUR-16), for a game whose `waitsToAsk`: its
   * countdown waits for this (What's Missing, once the desk is hidden).
   */
  asking: () => void;
}

/** How the game's entry looks in Luna's library — deliberately not all cards. */
export type GameShape =
  | 'jar'
  | 'bubbles'
  | 'plate'
  | 'cards'
  | 'book'
  | 'page'
  | 'desk'
  | 'map'
  | 'lesson';

export type SkillArea = 'phonics' | 'letters' | 'vocabulary' | 'reading' | 'listening';

export interface GameDef<TRound = never> {
  id: string;
  title: string;
  emoji: string;
  /** what the child does, in child words */
  tagline: string;
  /** the learning objective, stated plainly for grown-ups */
  objective: string;
  skill: SkillArea;
  /** Luna's line on the start screen */
  mission: string;
  roundsPerPlay: number;
  /**
   * A first guess at one round in seconds, for "about N min" before real
   * plays are timed (PRG-6), when this game's rounds run long; else
   * `engine/times.ts`' typical round
   */
  roundSeconds?: number;
  shape: GameShape;
  /**
   * The game draws Luna on its own stage (Feed Luna), so the shell's perch
   * shows her line without its owl: one Luna per screen (DES-12).
   */
  ownLuna?: boolean;
  /**
   * What a round asks, for its countdown at 1st and 2nd grade (CUR-16,
   * engine/timer.ts). Left out, or undefined for a round, it isn't timed: a
   * round that is long by nature, or already a race (Bubble Sounds).
   */
  timer?: (round: TRound) => TimerKind | undefined;
  /** the countdown waits until the round calls `api.asking()` (CUR-16) */
  waitsToAsk?: boolean;
  /** its signature reward: the squishy kind it brings first (SIGNATURE_KIND in squishies.ts, PRG-5a) */
  sticker: string;
  /** built once per play so rounds never repeat within a session */
  makeRounds: (opts: { grade: GradeLevel; difficulty: Difficulty; count: number }) => TRound[];
  Play: React.FC<{ round: TRound; api: GameApi }>;
  /**
   * The word a round is about, when it is heard and never shown (a sight
   * word). Luna's lines on the perch never contain it while it is unsolved,
   * nor the next round's after a win, as her line stays into it (BUG-27).
   */
  hiddenWord?: (round: TRound) => string | undefined;
  /**
   * Set when this is one of the curriculum's guided lessons rather than a
   * game (see engine/lessons.ts). Its rounds are dealt from the lesson's
   * questions, so there is no difficulty to choose; it earns stars by the same
   * rule as a game (PRG-1), and practicing it until it's learned marks the
   * lesson done (CUR-6). `missed` notes a round missed, to bring it back.
   */
  lesson?: { id: string; skillId: string; missed?: (round: TRound) => void };
}

/** Registry entry with the round type erased. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyGameDef = GameDef<any>;

export interface GameResult {
  gameId: string;
  roundsWon: number;
  totalRounds: number;
  perfect: boolean;
  starsEarned: number;
}
