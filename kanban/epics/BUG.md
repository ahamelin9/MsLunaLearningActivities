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

### BUG-26 · Bubble Sounds' shine is a grey smudge in dark mode
P2 · S · needs: —
- **Why:** seen in the GAME-7 shots (2026-10-18), and in GAME-3's before it: in dark mode each bubble's highlight shows as a grey blob on the top left of its letter. In light mode it can't be seen at all.
- **Cause:** `.shine` in `games/BubbleSounds/BubbleSounds.module.scss` paints `--illo-shine`, the drawings' white that is the same in both modes, at 0.7 over the bubble's `--card`: white on the light card, grey on the dark one.
- **How:** paint it with the `--shine` role (`tokens/_roles.scss`, softer at night), or drop it if a bubble reads better plain; ask Alex which with both shots side by side. Keep it clear of the letter.
- **Complete when:** in dark mode no bubble shows a grey patch on its letter, light mode is unchanged or OKed by Alex, the design check passes, and before/after `ui:shots` in both modes.

