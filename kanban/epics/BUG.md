# BUG — Bugs

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
- **Where it stands (2026-10-19, paused for Alex's check-in):** built. The shell keeps "this round has had an answer" (`api.answered()`, stable, reset each round, set by `answer` and `tick`), and every game's opening question on a timer, and the lessons' shared `usePrompt`, skip themselves once it's set. `answer-check.mjs --quick` (taps as each round's pieces appear, three rounds a game) passes in all 8 games; lint and types clean. **Left:** run `--quick` on the commit before to see it fail, `answer-check.mjs` 10 runs in a row, `ui:shots --diff` (no screen should change), then Blocked for Alex's OK. Note: Muddled Cards' single card flips aren't answers, so a flip in the first half-second can still be talked over; only matches and repeats count.
