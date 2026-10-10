# FB — Shell feedback & hints (Phase 2)

### FB-1 · One answer-feedback path in GameShell
Story · P0 · M · needs: DES-8/DES-10 layout settled · fixes BUG-1
- **Why:** a game that speaks and then calls `api.win()` or `api.miss()` gets cut off, because the shell's speech interrupts it. This was confirmed in the browser for Letter Jar and Treasure Path. The same thing happens in Bubble Sounds, What's Missing, Story Corner, Words Off the Page and Feed Luna. Lessons avoid it only because `useAnswer` in `components/lessonHooks.ts` waits for the speech to finish.
- **How:**
  - Add `api.answer({ correct, say?: SpeechPart[], hint?, reveal? })` to `GameApi`. The shell says `say`, waits for it to end (with a watchdog timer), then reacts.
  - Move all 8 games over to it.
  - Make `useAnswer` a thin wrapper around it.
- **Complete when:** with clip logging on, every game's choice line plays in full before Luna reacts.

### FB-2 · "Show me" after repeated misses
Story · P0 · S · needs: FB-1, DES-11
- **Why:** `hintLevel` 2 exists but nothing uses it, and the `reveal` lines in `engine/luna.ts` are never said. A stuck kindergartner just hears the same hint on a loop.
- **How:** games pass a `reveal()` callback. On the third miss the shell calls it: the answer glows and Luna says a reveal line. The round can then be finished but isn't counted as clean.
- **Complete when:** every game and lesson reveals the answer on the third miss.
