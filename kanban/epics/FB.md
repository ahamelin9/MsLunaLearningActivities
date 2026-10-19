# FB — Shell feedback & hints (Phase 2)

### FB-1 · One answer-feedback path in GameShell
Story · P0 · M · needs: — · fixes BUG-1
- **Blocked (2026-10-18): built and checked; waits for Alex's OK on how it sounds.** `api.answer` and `api.tick({ say })` are in, all 8 games and `useAnswer` use them, and `win`/`miss` are off `GameApi`. The shell ignores a second answer while one is being said (a ref, since `api.locked` reaches the game a render later: Feed Luna's tap-and-click answered twice and cut its own line). `answer-check.mjs` (know-how) passes for all 8 games at K, and fails 0 of 14 with the fix off; it caught a StrictMode bug (the shell never reacted in dev), now fixed. Lesson-order, perch, moon, gate and Luna-talk checks pass; lint, build; shots unchanged by it. Story Corner now asks its question 3.4s after the hunted word is found (it was 1.1s, cutting Luna's "Found it!" off). BUG-1 closes with it.
- **Why:** a game that speaks and then calls `api.win()` or `api.miss()` gets cut off, because the shell's speech interrupts it. This was confirmed in the browser for Letter Jar and Treasure Path. The same thing happens in Bubble Sounds, What's Missing, Story Corner, Words Off the Page and Feed Luna. Lessons avoid it only because `useAnswer` in `lessons/shared/lessonHooks.ts` waits for the speech to finish.
- **How:**
  - Add `api.answer({ correct, say?: SpeechPart[], hint?, reveal? })` to `GameApi`. The shell says `say`, waits for it to end (with a watchdog timer), then reacts.
  - Move all 8 games over to it.
  - Make `useAnswer` a thin wrapper around it.
- **Complete when:** with clip logging on, every game's choice line plays in full before Luna reacts.

### FB-2 · "Show me" after repeated misses
Story · P0 · S · needs: FB-1
- **Blocked (2026-10-18): built on FB-1's code and checked; waits for Alex's OK on the look.** `api.answer({ reveal })`: from the third miss the shell calls it and Luna says a reveal line. All 8 games and all lessons take `revealed` on the answer's piece (components.md). `reveal-check.mjs` passes for all 8 games and Lesson 1, and fails with the shell's reveal off. Lint, build; shots unchanged; lesson-order, perch and answer checks pass. Review sheet: `screenshots/review/fb2-show-me.png`. To Alex: on a cookie the dashed accent edge is subtle (it's close to the cookie's own brown), and a revealed bubble's soft accent is close to the water.
- **Why:** `hintLevel` 2 exists but nothing uses it, and the `reveal` lines in `engine/luna.ts` are never said. A stuck kindergartner just hears the same hint on a loop.
- **How:** games pass a `reveal()` callback. On the third miss the shell calls it: the answer glows and Luna says a reveal line. The round can then be finished but isn't counted as clean.
- **Complete when:** every game and lesson reveals the answer on the third miss.
