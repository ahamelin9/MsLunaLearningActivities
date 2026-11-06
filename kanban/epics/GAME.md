# GAME — Games to standard (Phase 5)

Verdicts from the 2026-10-08 review:

| Verdict | Games |
|---|---|
| Good | Letter Jar, Words Off the Page |
| OK | Muddled Cards |
| Needs work | Bubble Sounds, Feed Luna |
| Below standard | Treasure Path, What's Missing, Story Corner |

### GAME-8 · Every game deals something new until it has dealt everything
Story · P1 · S · needs: —
- **Why:** Alex (2026-11-06): "they should be able to play it many times and not see the same things over and over." Each game picks at random on every play, so nothing stops the same letters, words or passages coming straight back, and Letter Cookies, Muddled Cards and What's Missing can even repeat inside one play.
- **How:** a small deck (`engine/deck.ts`): a game asks it for N items from a pool, and it deals the ones not seen yet, reshuffling only when the pool runs out, never starting a new cycle with what was just played. Remembered between plays in its own saved key (a game's deck never makes the app re-render), and cleared by Settings' reset. Every game's `makeRounds` deals through it. The shell makes rounds once per play, so opening a start screen uses nothing up.
- **Blocked:** built and checked, waits for Alex's OK (`screenshots/review/HANDOVER.md`).
- **Complete when:** `deck-check.mjs` (no browser) plays each of the 8 games at every grade and dial and shows no target comes back until its whole pool has been dealt, and it fails when the deck is switched off; a reload keeps the memory, Settings' reset clears it; `voice:audit`, build and lint pass.

### GAME-9 · Treasure Path and Story Corner: far more to read
Story · P1 · M · needs: —
- **Why:** Treasure Path has 6 passages per grade and plays 5 in a go, so the second play is nearly all repeats. Story Corner has 3 stories per tier. Alex (2026-11-06) wants much more content, so a child can keep reading new things.
- **How:** at least 18 passages per grade and 9 stories per tier, as data in `engine/content.ts`, in the style he approved ([esl-content-writing], `passage-check.mjs`, `story-check.mjs`): simple, concrete, kind, set in Luna's world, statements paraphrase, wrong answers same type but false. Every new line through `read-tense-check.mjs` and the phonemizer.
- **Complete when:** the counts hold; `passage-check`, `story-check`, `read-tense-check`, `voice:audit`, build and lint pass; every line reads as everyday sense; a review sheet lists every new passage and story for Alex to strike anything.
- **Built (2026-11-06), waits for Alex's OK:** 18 passages per grade and 9 stories per tier. The review page is <https://claude.ai/artifact/XKeifMgCASqZ3B3mp7SV1M>.

### GAME-5 · Words Off the Page: bigger sentence pool
Story · P2 · S · needs: CNT-2
- **Why:** there are only 5–6 sentences per tier, so they repeat quickly.
- **Target:** at least 10 sentences per tier.

- **Complete when:** each tier has at least 10 sentences, all passing the CNT-4 checks, with their voice rendered.
- **Built (2026-11-06), waits for Alex's OK:** 16, 17 and 17 sentences at tiers 1, 2 and 3. The review page is <https://claude.ai/artifact/XKeifMgCASqZ3B3mp7SV1M>.
