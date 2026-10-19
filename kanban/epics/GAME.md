# GAME — Games to standard (Phase 5)

Verdicts from the 2026-10-08 review:

| Verdict | Games |
|---|---|
| Good | Letter Jar, Words Off the Page |
| OK | Muddled Cards |
| Needs work | Bubble Sounds, Feed Luna |
| Below standard | Treasure Path, What's Missing, Story Corner |

### GAME-2 · Story Corner: the child reads first
Story · P1 · M · needs: —
- **How:**
  - At least 3 stories per tier.
  - Questions can't be answered by copying a line from the story.
  - Resolves BUG-9.
  - (Lines no longer reading themselves aloud: done in BUG-15, 2026-10-10.)
- **Complete when:** each tier has at least 3 stories, no answer is copied word for word from a line, and BUG-9 is closed.
- **Blocked (2026-10-19): waits for Alex to OK one sample per tier** (his rule for new reading content). Each tier has one story today, and every right answer copies its line ("Under the bed" from "It was under the bed!"). In `screenshots/review/HANDOVER.md`: new questions for the three stories, one new story per tier, and the rule to check by script (a right answer never repeats three words in a row from a line). Once OKed: one more story per tier, the rule in the content checks, `voice:render`, play at every grade.

### GAME-5 · Words Off the Page: bigger sentence pool
Story · P2 · S · needs: CNT-2
- **Why:** there are only 5–6 sentences per tier, so they repeat quickly.
- **Target:** at least 10 sentences per tier.

- **Complete when:** each tier has at least 10 sentences, all passing the CNT-4 checks, with their voice rendered.
