# LVL — Difficulty (Phase 4)

### LVL-1 · Explicit grade × dial difficulty table
Story · P0 · S
- **Why:** `tierFor` (`engine/content.ts:449`) rounds `(grade + dial) / 2`. That makes Kindergarten "Just right" use tier 2 (1st-grade content), and in every grade two of the three buttons give the same tier.
- **How:** replace the formula with a table. The proposal below is to confirm with Alex. Then make the button notes ("Short words, fewer choices") true.

  | | Warm up | Just right | Tricky |
  |---|---|---|---|
  | K | 1 | 1 | 2 |
  | 1st | 1 | 2 | 3 |
  | 2nd | 2 | 3 | 3 |

- **Complete when:** the table lives in one place, and Luna's Pick and Word of the day read from it too.

### LVL-2 · Remember the chosen difficulty per game
Story · P2 · S
- **How:** store the last difficulty chosen for each game and pre-select it on the start screen.
- **Complete when:** reopening a game pre-selects the last difficulty chosen for it, including after a page reload.

### LVL-3 · Adaptive difficulty from skill mastery
Story · P2 · L · needs: PRG-1
- **Why:** `skillMastery` is recorded but never read.
- **How:** track accuracy per skill, then nudge the starting tier up or down. If this doesn't happen, remove `skillMastery`.

- **Complete when:** the starting tier moves after a run of strong or weak results in a skill, never by more than one tier at a time. If dropped instead, `skillMastery` is deleted and the Changelog says why.
