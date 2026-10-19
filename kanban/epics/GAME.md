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
- **OKed (Alex, 2026-10-19):** the new questions and the three sample stories, with every story's emoji double-checked against it. He'd like way more content later: these are a baseline, a foundation to build on (CNT-2, CUR-4), so the stories live where more can be added without changing the game.
- **Blocked (2026-10-19): built and checked; waits for Alex's OK on the full set.** Nine stories, three per tier (`MINI_STORIES` in `engine/content.ts`): the three there were, with new questions; his three samples, with two picture fixes ("Pip's Blue Cap": 🧢 is blue; "Luna lost one sock": 🧦 is a pair, not red); and one more per tier: "The Frog on the Log" 🐸, "The Paper Kite" 🪁, "The Snowy Morning" ⛄. Every line phonemized, then rendered (282 clips). `story-check.mjs` (know-how, now run by `voice:audit`) holds them to the rules: three per tier, no right answer repeating 3 words in a row from a line, and 300 plays per grade and dial with no story twice in a play (BUG-9) and none above its tier; it fails on the commit before (two copying answers, the K story twice). Story Corner's answer, reveal and story-speed checks pass at every grade; lint, build; `ui:shots`: Story Corner's story, and the shared random stream moved the next two screens' content. Sheet: `screenshots/review/game2-stories.png`.
- **Was blocked (2026-10-19): waited for Alex to OK one sample per tier** (his rule for new reading content). Each tier has one story today, and every right answer copies its line ("Under the bed" from "It was under the bed!"). In `screenshots/review/HANDOVER.md`: new questions for the three stories, one new story per tier, and the rule to check by script (a right answer never repeats three words in a row from a line). Once OKed: one more story per tier, the rule in the content checks, `voice:render`, play at every grade.

### GAME-5 · Words Off the Page: bigger sentence pool
Story · P2 · S · needs: CNT-2
- **Why:** there are only 5–6 sentences per tier, so they repeat quickly.
- **Target:** at least 10 sentences per tier.

- **Complete when:** each tier has at least 10 sentences, all passing the CNT-4 checks, with their voice rendered.
