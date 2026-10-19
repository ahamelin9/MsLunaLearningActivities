# GAME — Games to standard (Phase 5)

Verdicts from the 2026-10-08 review:

| Verdict | Games |
|---|---|
| Good | Letter Jar, Words Off the Page |
| OK | Muddled Cards |
| Needs work | Bubble Sounds, Feed Luna |
| Below standard | Treasure Path, What's Missing, Story Corner |

### GAME-1c · Treasure Path screen for passages
Story · P1 · M · needs: — (its checks are on `data-shot` since OPS-9, 2026-10-18)
- **Why:** GAME-1 split (Alex, 2026-10-10). The screen changes with the passages, and FB-1 changes how every game answers, so this waits for it.
- **How:** draw the passage on the stone and both question types, on the DES-2 design. GAME-1b left a stopgap in the old style (Alex, 2026-10-10: "it will get ripped out or restyled"): the `TreasurePassage` component in `games/TreasureRead/TreasureRead.tsx` and the `.has-passage` / `.treasure-passage` block in `TreasureRead.module.scss`. Replace both. A 2nd-grade passage runs to 50 words, so check that the stones and the choices stay on screen at 1024×768 for every 2nd-grade passage (`treasure-fit.mjs` in the know-how folder). `passage-check.mjs` and `treasure-check.cjs` there already prove the rounds and "Read it to me". Keep the read-along rules from BUG-15 (Kindergarten reads along; 1st and 2nd read first) and "Read it to me" saying "what?" in a blank.
- **Blocked (2026-10-19): built and checked; waits for Alex's OK on the look.** The stone is a `PaperCard` with the picture and "Read it to me" down the left and the passage on the right (as Story Corner's book sets its cover beside the story), and the question on a flat `PaperCard` under it; the scroll, its rods and the `TreasurePassage` stopgap are gone (the `.has-passage` block went with DES-22c). No board shows this screen. `treasure-fit.mjs` passes at K, 1st and 2nd, 1180×820, 1024×768 and 744×1133, light and dark (2nd grade's 32–50 words). `treasure-check.cjs` at K/1st/2nd: each play has both kinds, K 2 sentences, 1st 3, 2nd 4–5; nothing on screen or said gives a gap away; "Read it to me" open at K, locked at 1st and 2nd until a miss; every line a clip. `passage-check.mjs`, reveal and answer checks, lint and build pass; `ui:shots` changes only Treasure Path's screen. Sheet: `screenshots/review/game1c-treasure-stone.png`.
- **Complete when:** at every grade each round shows a passage of that grade's length; both question types come up in one play; no round can be answered by matching strings or by tapping "Read it to me" (checked with clip logging); before/after `ui:shots`.

### GAME-2 · Story Corner: the child reads first
Story · P1 · M · needs: —
- **How:**
  - At least 3 stories per tier.
  - Questions can't be answered by copying a line from the story.
  - Resolves BUG-9.
  - (Lines no longer reading themselves aloud: done in BUG-15, 2026-10-10.)
- **Complete when:** each tier has at least 3 stories, no answer is copied word for word from a line, and BUG-9 is closed.
- **Blocked (2026-10-19): waits for Alex to OK one sample per tier** (his rule for new reading content). Each tier has one story today, and every right answer copies its line ("Under the bed" from "It was under the bed!"). In `screenshots/review/HANDOVER.md`: new questions for the three stories, one new story per tier, and the rule to check by script (a right answer never repeats three words in a row from a line). Once OKed: one more story per tier, the rule in the content checks, `voice:render`, play at every grade.

### GAME-7 · Bubble Sounds: fewer answer bubbles, fewer still at higher grades
Story · P1 · S
- **Why:** the tank is mostly the answer, so the child can pop without listening (Alex, 2026-10-10, screenshot: five F bubbles and one J). In `games/BubbleSounds/BubbleSounds.tsx` a new bubble is the answer 38% of the time, and the game tops it up to two answer bubbles whenever fewer are left. A simulation of that code puts the answer at about 47% of bubbles at every grade and dial, and more while the child is popping.
- **How:** set the answer's share by tier, and keep only one answer bubble on screen as the minimum, not two. Proposed shares, to confirm with Alex: tier 1 about 1 in 3, tier 2 about 1 in 4, tier 3 about 1 in 5. Best done in the same sitting as BUG-21, which fixes which letters a play asks for, in the same file.
- **Complete when:** a simulation of the spawn code (like the one above) shows each tier's agreed share within a few points, with at least one answer bubble on screen at all times; a play at each grade shows clearly fewer answer bubbles than before; Alex has watched it in play and OKed the shares (2026-10-10: the proposed numbers sound about right, but he wants to see them in action before settling).
- **Blocked (2026-10-18): built and checked; waits for Alex to watch the shares in play.** Each bubble on the regular rhythm is dealt from a shuffled bag by tier (2 answers in 7, 1 in 6, 1 in 10), and when no answer is left the next bubble is the answer, at once if it isn't time for one, as an extra outside the rhythm, so popping fast never fills the water with answers. A bag rather than a coin flip: a per-bubble chance hit the aim over an hour but gave 27–66% in a 20 s kindergarten play. `bubble-share-sim.mjs` (know-how) puts the answer at 32/24/20% on screen at tiers 1/2/3, 23/19/19% while popping, at most 42/31/25% in any 20 s stretch, and never none on screen; it fails with `--before` (48% at every tier, 100% while popping at tier 1) and `--chance`. `bubble-check.mjs` now measures it in the game: 29–38% at K and 18–26% at 2nd over three runs, against 51–55% (33% at 2nd in portrait) on the committed code. Reveal, answer and letter checks pass. Sheet: `screenshots/review/game7-shares.png`.

### GAME-4 · Muddled Cards: reading required at tier 2+
Story · P2 · S
- **Why:** flipping a word card reads it aloud, so pairs can be matched by sound alone.
- **Fix:** read the word only after the pair is matched.
- **Complete when:** at tier 2+, flipping a word card makes no speech until its pair is matched.
- **Blocked (2026-10-19): built and checked; waits for Alex's OK.** At tier 2+ a word card is silent until its pair is found, then the word is read; a picture card still says its word (the vocabulary help, and the child still has to read to find its partner); Kindergarten's letters are named as before. The repeat hint named the card just tried, which could read a word card out, so it names the picture now, or says one new line, "Turn over a picture first, then find its word." (rendered), when both were word cards. `muddled-check.mjs` (know-how) passes at 1st and 2nd grade and K, and fails on the commit before; reveal and answer checks pass for Muddled Cards; `voice:audit` passes; no screen changed (`ui:shots --diff` 0 of 104).

### GAME-6 · Rename "Feed Luna the Letter"
Story · P2 · S · needs: —
- **Why:** the teacher would like the cookie game called something else (2026-10-09). The cookies stay. **Decided (Alex, 2026-10-10):** "Letter Cookies", the round 2 prototype's name.
- **How:** change `title` in `games/FeedLuna/FeedLuna.tsx` to "Letter Cookies", and reword any spoken line that says "Feed Luna" or "feed me" if she wants (the `mission` line). Keep the id `feed-luna` so saved progress carries over. Re-render the changed lines with `npm run voice:render`.
- **Complete when:** the Play Shelf and the game's start screen show the new name, no screen or spoken line says "Feed Luna", saved progress for the game still shows, and `voice:audit` passes.
- **Blocked (2026-10-19): built and checked; waits for Alex's OK.** The title is "Letter Cookies" (the Play Shelf, the start screen's header, the done screen, Settings' "What they learn"), and so is the Kit page's sample tile; the id stays `feed-luna`, so saves carry over (`difficulty-memory-check.mjs` reads the game's saved dial by it). No voice line ever said "Feed Luna" (none in the voice index); her lines that say "Feed me…" stay, as the cookies do, unless the teacher wants them changed. The know-how checks and design docs that opened or named the game by its old name use the new one; cookie, feed, perch, reveal, answer and difficulty-memory checks all pass with it. `ui:shots`: only the shelf tile and the game's header changed. `voice:audit` passes. Sheet: `screenshots/review/game6-letter-cookies.png`.

### GAME-5 · Words Off the Page: bigger sentence pool
Story · P2 · S · needs: CNT-2
- **Why:** there are only 5–6 sentences per tier, so they repeat quickly.
- **Target:** at least 10 sentences per tier.

- **Complete when:** each tier has at least 10 sentences, all passing the CNT-4 checks, with their voice rendered.
