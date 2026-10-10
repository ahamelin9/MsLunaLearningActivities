# GAME — Games to standard (Phase 5)

Verdicts from the 2026-10-08 review:

| Verdict | Games |
|---|---|
| Good | Letter Jar, Words Off the Page |
| OK | Muddled Cards |
| Needs work | Bubble Sounds, Feed Luna |
| Below standard | Treasure Path, What's Missing, Story Corner |

### GAME-1 · Treasure Path: real comprehension
Story · P1 · L · needs: FB-1, CNT-1
- **Why:** each stone is one sentence and one question, which is quick to solve and never asks the child to read a passage (Alex, 2026-10-10).
- **How:**
  - Each stone is a short passage, longer by grade: about 2 sentences at Kindergarten, 3 at 1st grade, 4–5 at 2nd grade.
  - Two question types about the passage: true or false, and fill in the blank to make a statement true.
  - Statements paraphrase the passage instead of copying it, so they can't be solved by matching text, and some need more than one sentence.
  - Fix the ambiguous fill-in-the-blanks (more than one choice fits). A blank keeps the rule from BUG-6: "Read it to me" never says the missing word (reuse `readWithGap` in `engine/content.ts`).
  - Passages need writing and their voice clips rendering.
  - Size L: split before starting (passages, question types, the screen).
- **Complete when:** at every grade each round shows a passage of that grade's length; both question types come up in one play; no round can be answered by matching strings or by tapping "Read it to me".

### GAME-2 · Story Corner: the child reads first
Story · P1 · M · needs: FB-1
- **How:**
  - At least 3 stories per tier.
  - Questions can't be answered by copying a line from the story.
  - Resolves BUG-9.
  - (Lines no longer reading themselves aloud: done in BUG-15, 2026-10-10.)
- **Complete when:** each tier has at least 3 stories, no answer is copied word for word from a line, and BUG-9 is closed.

### GAME-3 · Bubble Sounds: smooth, fair bubbles
Story · P1 · S · needs: DES-5, DES-6
- **Why:** bubbles move by a `setState` every 60ms, and they can overlap and hide the right bubble.
- **How:** move the bubbles with CSS transforms or `requestAnimationFrame`, add simple spacing so they don't overlap, and keep a target visible at all times.
- **Complete when:** bubbles move without a state update per frame, never overlap, and at least one target is always on screen.

### GAME-4 · Muddled Cards: reading required at tier 2+
Story · P2 · S
- **Why:** flipping a word card reads it aloud, so pairs can be matched by sound alone.
- **Fix:** read the word only after the pair is matched.
- **Complete when:** at tier 2+, flipping a word card makes no speech until its pair is matched.

### GAME-6 · Rename "Feed Luna the Letter"
Story · P2 · S · needs: DES-2
- **Why:** the teacher would like the cookie game called something else (2026-10-09). The cookies stay. The round 2 prototype uses "Letter Cookies" as a placeholder until she picks a name.
- **How:** change `title` in `games/FeedLuna.tsx` to her name, and reword any spoken line that says "Feed Luna" or "feed me" if she wants (the `mission` line). Keep the id `feed-luna` so saved progress carries over. Re-render the changed lines with `npm run voice:render`.
- **Complete when:** the Play Shelf and the game's start screen show the new name, no screen or spoken line says "Feed Luna", saved progress for the game still shows, and `voice:audit` passes.

### GAME-5 · Words Off the Page: bigger sentence pool
Story · P2 · S · needs: CNT-2
- **Why:** there are only 5–6 sentences per tier, so they repeat quickly.
- **Target:** at least 10 sentences per tier.

- **Complete when:** each tier has at least 10 sentences, all passing the CNT-4 checks, with their voice rendered.
