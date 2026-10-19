# BUG — Bugs

### BUG-25 · The milestone moon never shows in Alex's app
P1 · S · needs: — · likely, from Alex's shots (2026-10-18), not yet reproduced
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
- **Blocked (2026-10-19): reproduced, fixed and checked; waits for Alex's OK.** Reproduced first: with the index blocked, opening Settings saved 4,132 times in 3 s (the page stayed responsive, so nobody saw it). An index that didn't load reads as no voices at all, so even Luna's own voice looked gone, and the correction saved, re-rendered Settings with a new `onChange`, and saved again. Now the correction runs at most once per open, and no voices found means "don't know", not "gone", so going offline never resets a picked voice. `settings-offline-check.mjs` (know-how): 0 saves with the fix, 1 with only the once-per-open guard, 4,132 on the commit before. `voice-section-check` and `gate-check` pass; lint, build, `ui:shots --diff` 0 of 104.

### BUG-12 · Day streak rolls over at 7 pm
P2 · S
- **Cause:** `computeStreak` in `utils/storage.ts` uses the UTC date.
- **Fix:** use the local date.
- **Complete when:** playing at 8 pm and again at 9 am the next morning counts as two days in a row, and two sessions on the same local day count once.
- **Blocked (2026-10-19): built and checked; waits for Alex's OK.** `computeStreak` dates a play by the iPad's own day (`localDay` in `utils/storage.ts`). `streak-check.mjs` (know-how) runs the app's storage on a New York clock: 8 pm then 9 am counts 2, 6 pm and 11 pm count 1, a skipped day resets to 1; on the commit before, the first two fail (1 and 2). A save from before keeps its last UTC date, so its first evening after the update can count a day early or late once. Lint, build, `ui:shots --diff` 0 of 104.

### BUG-13 · Trophy dot never clears
P2 · S
- **Cause:** the dot shows whenever any achievement exists, not just new ones.
- **When:** fix in PRG-3.
- **Complete when:** the dot shows only for achievements not yet seen, and clears when the Trophy room opens.

### BUG-27 · Luna's perch can show a sight word before it's found
P1 · S · needs: —
- **Why:** found in CUR-3 (2026-10-19). The sight-word lesson now teaches the, see, like, I and a, and Luna's reaction lines are full of them ("Three in a row! Are you a wizard?", "I can barely keep up with you!", "YES! That’s the one!"). Her line stays on the perch into the next round, and her try-again lines show while a round is unsolved, so the word can be on screen before it's found, against "heard, never shown". CUR-3 reworded her opening line and the prompt; the reactions are picked at random in `engine/luna.ts` through GameShell.
- **How:** let a game or lesson tell the shell the round's target word (a lesson question's `word`), and have the shell skip any reaction line that contains it as a word while that round is unsolved, and for the next round's word when a line carries over. Keep the lines themselves.
- **Complete when:** `sight-check.mjs` (know-how) passes 20 runs in a row, with the perch read at each round's start and after each miss, and no other game's reactions change.
- **Blocked (2026-10-19): built and checked; waits for Alex's OK.** A game or lesson can name a round's heard-only word (`hiddenWord` on its GameDef; the sight-word lesson does), and the shell picks Luna's line without it: the round's word after a miss or the reveal, the next round's after a win, since her line stays up into it (`lunaSay(kind, id, avoid)`, matching whole words). Every kind of line keeps at least two for each of the five words. `sight-check.mjs --runs 20`: 20 of 20 pass; with the shell's filter off, 14 of 20 fail ("That's it! Write it in the big book!" up in the "the" round, "Okay, okay, I'll help a little" in the "a" round…). Other games pass no word, so their lines and random draws are unchanged: `ui:shots --diff` 0 of 104; reveal check passes. The answer check's occasional cut line is a separate race, BUG-28.

### BUG-28 · A tap in a round's first half-second is cut off by its question
P2 · S · needs: —
- **Why:** found in BUG-27 (2026-10-19), and behind `answer-check.mjs` failing now and then (Letter Jar, Letter Cookies, Treasure Path). Most games ask their question on a timer once a round starts (Letter Cookies' `sayCue` after 600 ms, Treasure Path 600, Bubble Sounds 500…). A tap before it fires starts the answer's own line, and the question then cuts it off: in one run "little c" (right, round 2) was cut by "Find the little c" 400 ms in. A quick child hears Luna ask for a cookie she has just eaten.
- **How:** a round's opening question doesn't play once the round has been answered (the timer checks, or the shell owns the round's opening line and skips it while an answer is being said); look for the same timer in every game and lesson type.
- **Complete when:** a check that taps the right answer within 300 ms of each round starting, in every game, sees the answer's line end by itself and no question after it; `answer-check.mjs` passes 10 runs in a row.

### BUG-26 · Bubble Sounds' shine is a grey smudge in dark mode
P2 · S · needs: —
- **Why:** seen in the GAME-7 shots (2026-10-18), and in GAME-3's before it: in dark mode each bubble's highlight shows as a grey blob on the top left of its letter. In light mode it can't be seen at all.
- **Cause:** `.shine` in `games/BubbleSounds/BubbleSounds.module.scss` paints `--illo-shine`, the drawings' white that is the same in both modes, at 0.7 over the bubble's `--card`: white on the light card, grey on the dark one.
- **How:** paint it with the `--shine` role (`tokens/_roles.scss`, softer at night), or drop it if a bubble reads better plain; ask Alex which with both shots side by side. Keep it clear of the letter. **Alex (2026-10-18), on the shots:** "I'm not sure that highlight actually fits right", so lead with dropping it.
- **Complete when:** in dark mode no bubble shows a grey patch on its letter, light mode is unchanged or OKed by Alex, the design check passes, and before/after `ui:shots` in both modes.
- **Blocked (2026-10-19): built; waits for Alex's OK on plain bubbles.** Dropped, as he leaned: the `.shine` span and its style are gone. Dark: no dot on any letter (`ui:shots` dark, only the bubbles changed); light: 0 of 104 screens changed (it was white on white). Design check and `bubble-check.mjs` pass. If he OKs, a line goes in `decisions.md`. Sheet: `screenshots/review/bug26-plain-bubbles.png`.

