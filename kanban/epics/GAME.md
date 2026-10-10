# GAME — Games to standard (Phase 5)

Verdicts from the 2026-10-08 review:

| Verdict | Games |
|---|---|
| Good | Letter Jar, Words Off the Page |
| OK | Muddled Cards |
| Needs work | Bubble Sounds, Feed Luna |
| Below standard | Treasure Path, What's Missing, Story Corner |

### GAME-1a · Treasure Path passages and questions
Story · P1 · M · needs: CNT-1b
- **Why:** GAME-1 split (Alex, 2026-10-10). Each stone becomes a short passage the child reads, not one sentence (Alex, 2026-10-10: passages instead of single sentences).
- **How:**
  - 6 passages per grade (Alex, 2026-10-10), longer by grade: about 2 sentences at Kindergarten, 3 at 1st grade, 4–5 at 2nd grade. Written as data in `engine/content.ts`, beside the current `SENTENCES` (GAME-1b switches the game over).
  - Each passage has true/false statements and fill-in-the-blank statements (fill in the blank to make the statement true). Statements paraphrase the passage instead of copying it, and some need more than one sentence.
  - Every fill-in-the-blank carries CNT-1b's list of words that would also make it true. Fold in CNT-3's ambiguous four (frog/fish, hat/cat, beach/bench, under/behind) by not repeating them.
  - Render the voice clips (`npm run voice:render`, then `npm run voice:audit`). A blank is read with `readWithGap`, never saying the missing word (BUG-6).
- **Complete when:** each grade has 6 passages of its length; each passage has at least one true/false and one fill-in-the-blank statement; a check finds no statement that copies 4 or more words in a row from its passage, and no fill-in-the-blank without its list; `distractor-check.mjs` and `voice:audit` pass.

### GAME-1b · Treasure Path rounds from passages
Story · P1 · S · needs: GAME-1a
- **Why:** GAME-1 split (Alex, 2026-10-10).
- **How:** `makeRounds` picks passages for the grade and mixes both question types in every play. Wrong choices come through `engine/distractors.ts`. The game's adapter in `distractor-check.mjs` reads the new round shape.
- **Complete when:** over many plays at every grade and dial, every play has both question types and no repeated passage; `distractor-check.mjs` passes; a check confirms no answer can be found by matching the statement's text against the passage, or from what "Read it to me" says before the child answers.

### GAME-1c · Treasure Path screen for passages
Story · P1 · M · needs: FB-1, GAME-1b
- **Why:** GAME-1 split (Alex, 2026-10-10). The screen changes with the passages, and FB-1 changes how every game answers, so this waits for it.
- **How:** draw the passage on the stone and both question types; keep the read-along rules from BUG-15 (Kindergarten reads along; 1st and 2nd read first) and "Read it to me" saying "what?" in a blank.
- **Complete when:** at every grade each round shows a passage of that grade's length; both question types come up in one play; no round can be answered by matching strings or by tapping "Read it to me" (checked with clip logging); before/after `ui:shots`.

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

### GAME-7 · Bubble Sounds: fewer answer bubbles, fewer still at higher grades
Story · P1 · S
- **Why:** the tank is mostly the answer, so the child can pop without listening (Alex, 2026-10-10, screenshot: five F bubbles and one J). In `games/BubbleSounds.tsx` a new bubble is the answer 38% of the time, and the game tops it up to two answer bubbles whenever fewer are left. A simulation of that code puts the answer at about 47% of bubbles at every grade and dial, and more while the child is popping.
- **How:** set the answer's share by tier, and keep only one answer bubble on screen as the minimum, not two. Proposed shares, to confirm with Alex: tier 1 about 1 in 3, tier 2 about 1 in 4, tier 3 about 1 in 5. Best done in the same sitting as BUG-21, which fixes which letters a play asks for, in the same file.
- **Complete when:** a simulation of the spawn code (like the one above) shows each tier's agreed share within a few points, with at least one answer bubble on screen at all times; a play at each grade shows clearly fewer answer bubbles than before; Alex has watched it in play and OKed the shares (2026-10-10: the proposed numbers sound about right, but he wants to see them in action before settling).

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
