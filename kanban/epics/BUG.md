# BUG — Bugs

### BUG-25 · The milestone moon never shows in Alex's app
P1 · S · needs: — · likely, from Alex's shots (2026-10-18), not yet reproduced
- **What Alex saw:** on his 5173, no moon on the done screen after Lesson 5 (5 of 6 done), nor after replaying Lesson 1.
- **Likely cause:** working as DES-17 built it, which may be the wrong rule. She comes only when a lesson *crosses* a milestone (the first lesson ever, half the grade's lessons, all of them), and each is claimed once in the save. His save had passed "first" and "half" before the moon existed, and a replay crosses nothing, so her only visit left is finishing Lesson 6. `moon-check.mjs` passes on a fresh save, so check that first; if the moon doesn't come on a fresh save in his browser either, it's a real bug (a stale tab, or the visit itself).
- **Alex (2026-10-19):** "I do see moon", so she does visit; but he'd like a rule that's more consistent and easier to test ("comes in certain games, comes in lessons…"). So this is now about the rule, step 2 below: proposal in `screenshots/review/HANDOVER.md`, his pick first.
- **How:**
  1. In Alex's browser: reset progress, finish Lesson 1, and see whether she visits. Then Lesson 3 (half) and Lesson 6 (all).
  2. If she does: decide with Alex whether a save already past a milestone should still get its visit (for example, the next lesson finished brings the biggest milestone not yet claimed), and change `milestoneReached` in `engine/milestones.ts`.
  3. If she doesn't: find out why with `moon-check.mjs`'s frame sampling in his setup.
- **Complete when:** on Alex's iPad or browser, the moon visits at the milestones he agrees on, from a fresh save and from his current one, and `moon-check.mjs` passes.

### BUG-9 · Story Corner K warm-up plays one story twice
P2 · S
- **Cause:** tier 1 has only one story. Resolved properly by GAME-2.
- **Complete when:** no story repeats within one play of Story Corner, at any grade or difficulty.

### BUG-13 · Trophy dot never clears
P2 · S
- **Cause:** the dot shows whenever any achievement exists, not just new ones.
- **When:** fix in PRG-3.
- **Complete when:** the dot shows only for achievements not yet seen, and clears when the Trophy room opens.

### BUG-28 · A tap in a round's first half-second is cut off by its question
P2 · S · needs: —
- **Why:** found in BUG-27 (2026-10-19), and behind `answer-check.mjs` failing now and then (Letter Jar, Letter Cookies, Treasure Path). Most games ask their question on a timer once a round starts (Letter Cookies' `sayCue` after 600 ms, Treasure Path 600, Bubble Sounds 500…). A tap before it fires starts the answer's own line, and the question then cuts it off: in one run "little c" (right, round 2) was cut by "Find the little c" 400 ms in. A quick child hears Luna ask for a cookie she has just eaten.
- **How:** a round's opening question doesn't play once the round has been answered (the timer checks, or the shell owns the round's opening line and skips it while an answer is being said); look for the same timer in every game and lesson type.
- **Complete when:** a check that taps the right answer within 300 ms of each round starting, in every game, sees the answer's line end by itself and no question after it; `answer-check.mjs` passes 10 runs in a row.
