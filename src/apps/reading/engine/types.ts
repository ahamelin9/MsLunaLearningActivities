import type React from 'react';
import type { GradeLevel } from '../../../types/reading';
import type { Difficulty } from './content';
import type { LunaMood } from './luna';

export interface GameContext {
  grade: GradeLevel;
  difficulty: Difficulty;
  roundIndex: number;
  totalRounds: number;
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
  /** the round is over; ignore further input */
  locked: boolean;
  /** round solved */
  win: (opts?: { lunaLine?: string; delay?: number }) => void;
  /** wrong attempt — never a failure, always another go */
  miss: (opts?: { lunaLine?: string; hint?: string }) => void;
  /** a small good beat inside a round, e.g. 2 of 4 letters found */
  tick: (opts?: { lunaLine?: string }) => void;
  /** let Luna speak out of turn */
  say: (text: string, mood?: LunaMood) => void;
}

/** How the game's entry looks in Luna's library — deliberately not all cards. */
export type GameShape =
  | 'scene'
  | 'jar'
  | 'bubbles'
  | 'plate'
  | 'cards'
  | 'book'
  | 'page'
  | 'desk'
  | 'radio'
  | 'map'
  | 'baskets';

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
  shape: GameShape;
  /** signature sticker unlocked the first time this game is finished */
  sticker: string;
  /** built once per play so rounds never repeat within a session */
  makeRounds: (opts: { grade: GradeLevel; difficulty: Difficulty; count: number }) => TRound[];
  Play: React.FC<{ round: TRound; api: GameApi }>;
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
  pointsEarned: number;
}
