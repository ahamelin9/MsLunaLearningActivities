// Something new every play (GAME-8; Alex, 2026-11-06: "not see the same things
// over and over"). A game or lesson asks its deck for items from a pool, and it
// deals what hasn't been seen yet. Only when the pool runs out does it begin
// again, and then what was played last comes back last.
//
// The memory has its own saved key rather than a place in UserProgress: a deal
// happens as a play is set up, and saving progress there would re-render every
// screen listening to it. The deck runs without a browser too (the voice audit
// and the content checks play every game in Node), keeping its memory in hand.

import { shuffle } from './content';

const STORAGE_KEY = 'ms_luna_seen_v1';

/** Each deck's keys in the order they were dealt, oldest first. */
type Seen = Record<string, string[]>;

let memory: Seen | null = null;

function seen(): Seen {
  if (memory) return memory;
  memory = {};
  try {
    const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === 'object') memory = parsed as Seen;
  } catch {
    // a save we can't read starts afresh: a deck only ever costs a repeat
  }
  return memory;
}

function remember(all: Seen) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // no room to save: this session still remembers
  }
}

/**
 * Items about something new first, keeping their order: a lesson asks each of its
 * letters once before asking one again (CUR-6).
 */
function spreadOut<T>(items: T[], aboutOf: ((item: T) => string) | undefined, taken: string[]): T[] {
  if (!aboutOf) return items;
  const asked = new Set(taken);
  const first: T[] = [];
  const later: T[] = [];
  for (const item of items) {
    const about = aboutOf(item);
    if (asked.has(about)) later.push(item);
    else {
      asked.add(about);
      first.push(item);
    }
  }
  return [...first, ...later];
}

/**
 * `count` items of `pool`, none twice while there are enough. Those not seen
 * yet come first; once the pool runs out a new cycle begins from what was seen
 * longest ago, never opening on the last deal if it can help it. A pool smaller
 * than `count` repeats, as there is nothing else to deal. `aboutOf` says what an
 * item asks, and `taken` what this deal has asked already.
 */
export function deal<T>(deck: string, pool: T[], count: number, keyOf: (item: T) => string, aboutOf?: (item: T) => string, taken: string[] = []): T[] {
  if (pool.length === 0 || count <= 0) return [];
  const all = seen();
  const before = all[deck] ?? [];
  const had = new Set(before);
  const fresh = spreadOut(shuffle(pool.filter(item => !had.has(keyOf(item)))), aboutOf, taken);
  let dealt = fresh.slice(0, count);
  let kept = before;

  if (dealt.length < count) {
    const inPool = new Map(pool.map(item => [keyOf(item), item]));
    const order = before.filter(key => inPool.has(key));
    // the last deal's worth waits at the back of the new cycle
    const recent = order.slice(-count);
    const older = shuffle(order.slice(0, Math.max(0, order.length - count)));
    const again = [...older, ...shuffle(recent)].map(key => inPool.get(key) as T);
    dealt = spreadOut([...dealt, ...again], aboutOf, taken).slice(0, count);
    // only this pool starts over; what another tier's pool has seen stays seen
    kept = before.filter(key => !inPool.has(key));
  }

  all[deck] = [...kept, ...dealt.map(keyOf)];
  remember(all);
  return Array.from({ length: count }, (_, i) => dealt[i % dealt.length]);
}

/**
 * This week's words first (CUR-9): the items that use one of the words the
 * teacher picked (weekWords.ts) open the play, as many as it has room for,
 * taking turns among themselves when there are more; the deck deals the rest
 * as usual. They come every play while they're picked, and once cleared they
 * have been seen, so they wait their turn like anything else. With nothing
 * picked, or nothing in the pool using a picked word, it is `deal`.
 */
export function dealWeekFirst<T>(deck: string, pool: T[], count: number, keyOf: (item: T) => string, usesWeekWord: (item: T) => boolean): T[] {
  const week = pool.filter(usesWeekWord);
  if (week.length === 0) return deal(deck, pool, count, keyOf);
  const first = deal(deck, week, Math.min(count, week.length), keyOf);
  const rest = deal(deck, pool.filter(item => !week.includes(item)), count - first.length, keyOf);
  return [...first, ...rest];
}

const missedIn = (deck: string) => `missed:${deck}`;

/**
 * A lesson's deal (CUR-6): what was missed last time comes back first, once,
 * and the deck fills the rest. A round missed again is noted again.
 */
export function dealMissedFirst<T>(deck: string, pool: T[], count: number, keyOf: (item: T) => string, aboutOf?: (item: T) => string): T[] {
  const all = seen();
  const missed = new Set(all[missedIn(deck)] ?? []);
  const back = spreadOut(shuffle(pool.filter(item => missed.has(keyOf(item)))), aboutOf, []).slice(0, count);
  const rest = deal(deck, pool.filter(item => !back.includes(item)), count - back.length, keyOf, aboutOf, aboutOf ? back.map(aboutOf) : []);
  // what was missed but didn't fit this play waits for the next
  all[missedIn(deck)] = [...missed].filter(key => !back.some(item => keyOf(item) === key));
  remember(all);
  return shuffle([...back, ...rest]);
}

/** Notes a round missed, so it comes back next play (dealMissedFirst). */
export function noteMissed(deck: string, key: string) {
  const all = seen();
  const missed = all[missedIn(deck)] ?? [];
  if (missed.includes(key)) return;
  all[missedIn(deck)] = [...missed, key];
  remember(all);
}

/** Forgets everything dealt: Settings' reset. */
export function forgetDecks() {
  memory = {};
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing saved to forget
  }
}
