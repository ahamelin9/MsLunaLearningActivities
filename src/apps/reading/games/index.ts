import type { AnyGameDef } from '../engine/types';
import { soundDetective } from './SoundDetective';
import { letterHunt } from './LetterHunt';
import { bubbleSounds } from './BubbleSounds';
import { feedLuna } from './FeedLuna';
import { memoryMatch } from './MemoryMatch';
import { buildSentence } from './BuildSentence';
import { whatsMissing } from './WhatsMissing';
import { lunaSays } from './LunaSays';
import { treasureRead } from './TreasureRead';
import { sortingBaskets } from './SortingBaskets';
import { storyTime } from './StoryTime';
import './games.scss';

/**
 * Every mini-game in Luna's library. Adding a game is one import plus one
 * entry here — the hub, the shell and Surprise Me all read from this list.
 */
export const GAMES: AnyGameDef[] = [
  soundDetective,
  letterHunt,
  bubbleSounds,
  feedLuna,
  memoryMatch,
  buildSentence,
  whatsMissing,
  lunaSays,
  treasureRead,
  sortingBaskets,
  storyTime
];

export function getGame(id: string): AnyGameDef | undefined {
  return GAMES.find(g => g.id === id);
}

/**
 * Luna's own pick: never the game you just played, and she leans towards
 * games you have played least.
 */
export function surprisePick(gamePlays: Record<string, number>, excludeId?: string): AnyGameDef {
  const candidates = GAMES.filter(g => g.id !== excludeId);
  const fewest = Math.min(...candidates.map(g => gamePlays[g.id] ?? 0));
  const freshest = candidates.filter(g => (gamePlays[g.id] ?? 0) === fewest);
  const pool = freshest.length > 0 ? freshest : candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}
