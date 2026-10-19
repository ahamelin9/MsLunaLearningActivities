// Stars for a play (PRG-1): one rule for every game and lesson, from how many
// of its rounds were answered right the first time ("clean"). Finishing is
// always worth a star; a replay only adds stars above the best so far
// (`utils/storage.ts`).

/** The share of clean rounds each star needs: proposed to Alex 2026-10-19. */
export const STAR_RULE = {
  /** every round right the first time */
  three: 1,
  /** at least half of them */
  two: 0.5
} as const;

export function starsFor(cleanRounds: number, rounds: number): 1 | 2 | 3 {
  const share = rounds > 0 ? cleanRounds / rounds : 0;
  if (share >= STAR_RULE.three) return 3;
  if (share >= STAR_RULE.two) return 2;
  return 1;
}
