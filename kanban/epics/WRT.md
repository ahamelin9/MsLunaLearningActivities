# WRT — Writing & grammar app (Phase 8)

**Goal:** a second ESL companion app next to Reading, for writing and grammar,
starting with punctuation (Alex, 2026-10-09). Proposal to confirm: it's a
separate app, not a Reading game, because placing marks is a writing skill.
The alternative is a punctuation game inside Reading, taught as fluency.

### WRT-1 · Writing app on the home screen
Story · P1 · M · needs: DES-9a
- **Why:** a home for the punctuation game and later writing and grammar games.
- **How:**
  - Register a Writing app in `apps/registry.ts`, built from the DES kit and tokens.
  - It uses the child's grade and `GameShell` the same way Reading does.
  - Its only game for now is WRT-2.
  - **Check first:** the teacher chose a home screen with just the one Reading icon (2026-10-10). Ask her before a second icon goes on it.
- **Complete when:** the home screen shows Reading and Writing, Writing opens to a hub listing the punctuation game, and build and lint pass.

### WRT-2 · Punctuation game: where does the mark go?
Story · P1 · L · needs: WRT-1, FB-1, FB-2, LVL-1 · split per grade before starting
- **Why:** children need to learn where periods, commas and other marks go. For ESL learners, punctuation also changes how a sentence sounds (a stop, a pause, a question that rises), so it can be taught by ear.
- **How:**
  - A short sentence sits on a paper card with a mark missing. Luna reads it aloud with the right pause and tone. The child taps the gap, then picks the mark from a tray (or drags it in).
  - **Heard, never shown:** the right mark isn't shown in place until the round is solved. Hints are spoken ("Listen. Does my voice go up at the end?").
  - Staggered by tier (LVL-1), following the Common Core language standard for each grade:

    | Tier | Grade | Marks |
    |---|---|---|
    | 1 | K | End of a sentence: `.` or `?` |
    | 2 | 1st | `.` `?` `!`, commas in a list ("a cat, a dog and a pig") and in dates |
    | 3 | 2nd | Commas in a letter's greeting and closing ("Dear Sam,"), apostrophes in contractions (can't) and possessives (the dog's bone) |

  - Every sentence has exactly one right answer: no sentence where `.` and `!` both work, and no gap before "and" in a list (that comma is optional).
  - Render each sentence with `scripts/voice/`. Check by ear that questions rise and list commas pause, because the game depends on it, and drop any sentence the voice gets wrong.
- **Complete when:**
  - at each tier, a round shows a sentence with a mark missing, plays Luna's reading, and accepts only the right mark in the right gap;
  - each tier has at least 10 sentences, each with one right answer, with voice rendered and `voice:audit` passing;
  - the mark never appears in place before the round is solved, and the third miss reveals it (FB-2).
