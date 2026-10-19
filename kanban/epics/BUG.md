# BUG — Bugs

### BUG-1 · Game speech is cut off by Luna's reaction — confirmed
P0 · fixed by FB-1. Examples:
- Letter Jar: "That is G" never plays.
- Treasure Path and Words Off the Page: the sentence read-back after a right answer never plays.
- (Feed Luna's cheer was fixed on its own in BUG-19, 2026-10-09.)
- **Complete when:** with clip logging on, the Letter Jar wrong-tap line and the Treasure Path and Words Off the Page read-backs all play in full. Closes with FB-1.

### BUG-2 · Feed Luna: one wrong tap counts as two misses — confirmed
P0 · S
- **Cause:** a tap feeds the cookie on pointer-up (`onPointerUp` in `games/FeedLuna/FeedLuna.tsx`), and then the button's `onClick` feeds it again.
- **Effect:** the hint plays after the first mistake.
- **Complete when:** one wrong tap counts as one miss, and drag, tap and keyboard each still work.
- **Blocked (2026-10-18): fixed and checked; waits for Alex's OK.** Reproduced first (`feed-check.mjs`: 2 misses for one wrong tap). Also found: with pointer capture, a drag let go anywhere fired a click and fed her. Fix: `onClick` feeds only for a keyboard or assistive click (`e.detail === 0`). `feed-check.mjs` passes all six (tap, Enter, right tap, drag to the beak, no miss on a drag, a stray drag feeds nothing) and fails two with the old handler; answer and perch checks pass (perch-check now picks wrong cookies from the round's answer); no screen changed.

### BUG-8 · Story lessons ignore the Beginner speed
P1 · S
- **Cause:** `lessons/StoryReader/StoryReader.tsx` (its line and word readers) hard-code `rate: 0.9` and `0.85`, which always lands on Normal.
- **Fix:** remove the overrides, or scale them relative to the user's speed setting.
- **Complete when:** with Beginner selected, story lines and words play the slow clips (checked with clip logging).
- **Blocked (2026-10-18): fixed and checked; waits for Alex's OK.** Reproduced first with `story-speed-check.mjs` (know-how): Beginner and Quick both played Normal clips. The two rate overrides are gone, so the story follows Settings; now Beginner plays slow, Normal normal and Quick quick, for a tapped word and a line. `voice:audit` passes at all three speeds; no screen changed.

### BUG-21 · Bubble Sounds only ever asks for the first 12 letters — confirmed
P1 · S
- **Cause:** `games/BubbleSounds/BubbleSounds.tsx` picks round *i*'s letter from pool slots `i*3` to `i*3+2`, and a play has 4 rounds, so only the first 12 letters of the pool can come up. At tier 1 (Kindergarten on the easiest dial) T and W never come up; at tiers 2 and 3, M to Z and the digraphs (SH, CH, TH, WH) never do. Found while building the wrong-answer rules (2026-10-10): over 300 plays at every grade and dial, the distractor check never saw W or WH as the target.
- **Fix:** spread the rounds over the whole pool (for example, shuffle the pool and take the first 4), keeping no repeats within a play.
- **Complete when:** over many plays at each grade and dial, every letter in that tier's pool is asked for at least once (counted with a scan like `.claude/skills/know-how/distractor-check.mjs`), and no play asks the same letter twice.
- **Blocked (2026-10-18): fixed and checked; waits for Alex's OK.** `bubble-letters-check.mjs` (know-how; 400 plays per grade × dial) failed everywhere before (12 of 14 to 28 letters; never T W at K, never M–Z or the digraphs higher up); now each play samples distinct letters from the whole pool, and every letter comes up at all 9 grade × dial pairs with no repeats. `voice:audit` and `distractor-check.mjs` pass. Shots: only game content changed (the shots run's seeded random stream now runs differently), no layout.

### BUG-22 · Story Corner says "she reed three books" — likely
P1 · S · likely, from the phonemizer, not yet heard in play
- **Cause:** Kokoro reads past-tense "read" as "reed" (`ɹˈiːd`): espeak can't tell the tense. Found while writing GAME-1a's passages (2026-10-10). The 2nd-grade story "The Rainy Day Plan" in `engine/content.ts` says "so she read three books instead", and its answer "She read three books" does too.
- **Fix:** reword the line and answer (for example "so she spent the day with three books"), or respell past-tense "read" as "red" in `speakable()` in `scripts/voice/lexicon.mjs`, only where it is past tense. Then `npm run voice:render`.
- **Complete when:** no rendered line says "reed" where it means the past ("red"), checked by running every story line and answer through the phonemizer (know-how: "A new line says 'ay' for 'a'"), and `voice:audit` passes.
- **Blocked (2026-10-18): fixed and checked; waits for Alex's OK on the wording.** Confirmed with the phonemizer (`ɹˈiːd` for "she read"). Reworded rather than respelled, so a tapped "read" can't say "reed" either: "…so she spent the morning reading three books." and the answers "She was reading books" / "She was flying to the beach" / "She was painting the window" (all in one form, as the approved style asks). Rendered (15 clips), `voice:audit` and `distractor-check.mjs` pass. `read-tense-check.mjs` (know-how) lists all 34 spoken lines with "read" and their sounds, and flags past tense: none left (it flags the old two).

### BUG-25 · The milestone moon never shows in Alex's app
P1 · S · needs: DES-17 · likely, from Alex's shots (2026-10-18), not yet reproduced
- **What Alex saw:** on his 5173, no moon on the done screen after Lesson 5 (5 of 6 done), nor after replaying Lesson 1.
- **Likely cause:** working as DES-17 built it, which may be the wrong rule. She comes only when a lesson *crosses* a milestone (the first lesson ever, half the grade's lessons, all of them), and each is claimed once in the save. His save had passed "first" and "half" before the moon existed, and a replay crosses nothing, so her only visit left is finishing Lesson 6. `moon-check.mjs` passes on a fresh save, so check that first; if the moon doesn't come on a fresh save in his browser either, it's a real bug (a stale tab, or the visit itself).
- **How:**
  1. In Alex's browser: reset progress, finish Lesson 1, and see whether she visits. Then Lesson 3 (half) and Lesson 6 (all).
  2. If she does: decide with Alex whether a save already past a milestone should still get its visit (for example, the next lesson finished brings the biggest milestone not yet claimed), and change `milestoneReached` in `engine/milestones.ts`.
  3. If she doesn't: find out why with `moon-check.mjs`'s frame sampling in his setup.
- **Complete when:** on Alex's iPad or browser, the moon visits at the milestones he agrees on, from a fresh save and from his current one, and `moon-check.mjs` passes.

### BUG-9 · Story Corner K warm-up plays one story twice
P2 · S
- **Cause:** tier 1 has only one story. Resolved properly by GAME-2.
- **Complete when:** no story repeats within one play of Story Corner, at any grade or difficulty.

### BUG-10 · Settings may loop saving when the voice index fails
P2 · S · likely, not yet reproduced
- **Cause:** if the voice index fails to load (for example offline), `components/os/VoicePicker.tsx:58` keeps re-saving settings on every render.
- **Fix:** run the correction once per open of Settings.
- **Verify:** reproduce it with the network off before fixing.
- **Complete when:** with the voice index blocked (offline), opening Settings saves at most once and the page stays responsive.

### BUG-12 · Day streak rolls over at 7 pm
P2 · S
- **Cause:** `computeStreak` in `utils/storage.ts` uses the UTC date.
- **Fix:** use the local date.
- **Complete when:** playing at 8 pm and again at 9 am the next morning counts as two days in a row, and two sessions on the same local day count once.

### BUG-13 · Trophy dot never clears
P2 · S
- **Cause:** the dot shows whenever any achievement exists, not just new ones.
- **When:** fix in PRG-3.
- **Complete when:** the dot shows only for achievements not yet seen, and clears when the Trophy room opens.

