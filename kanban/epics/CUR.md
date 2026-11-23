# CUR — Curriculum: the teacher's try-out

**Goal:** the lessons feel right to the teacher in class. Back from her
try-out (2026-11-12): each skill's lessons go 1, 2, 3, a play is about 20
questions, a lesson is practiced at least 20 different things, and the child
reads first, with Luna helping after. (The first CUR epic, 19 lessons in
order, the library by skill and the cheat sheet, closed on 2026-11-11.)

### CUR-20 · Muddled Cards' bar counts its 20 pairs
Story · P1 · S · needs: —
- **Why:** her feedback (2026-11-18): some games are "only 2, some are 4; let's stick to the 20". Since CUR-15 a play of Luna's Muddled Cards is 4 boards of 5 pairs, so a child makes 20 matches, but the bar counts boards and says "Round 1 of 4" (`twenty-check.mjs`, 2026-11-18). She reads the bar as how many questions a play has.
- **How:**
  - Keep the play as it is (4 boards of 5 pairs); the bar counts pairs found instead of boards, one step per pair, 20 a play. Find how the shell's bar is fed (`roundsPerPlay` and the round counter in the game shell) and give a game a way to count steps that aren't rounds, rather than a Muddled Cards special case.
  - The bar's words follow the count ("1 of 20"); the done screen and the save still count the play as before.
- **Found in the code (2026-11-21):** a board holds 4, 5 or 6 pairs by level, so 4 boards were 16, 20 or 24 pairs, not always 20. Built (Claude's pick, for Alex's OK): always 4 boards of 20 pairs, smallest first: first level 4+5+5+6, second 5+5+5+5, third 4+4+6+6. The first level (Kindergarten) has only 14 letters, chosen so big and little are easy to tell apart, so 6 letters come back on a later board in a play, never twice on one board (HEAD already brought 2 back). The other pick: Kindergarten uses the 24-letter set, 20 different a play, but with look-alikes such as big I and little l.
- **Blocked (2026-11-21):** built and checked in away mode; waits for Alex's OK (the picks above, `screenshots/review/cur20-muddled-twenty.png`) and his commit.
- **Decided (Alex, 2026-11-21):** Kindergarten keeps its 14 letters, 6 coming back on a later board. He looks through the build before committing.
- **Complete when:** `node .claude/skills/know-how/twenty-check.mjs` shows Muddled Cards at 20 at every grade; the bar moves one step per pair found and is full when the fourth board is cleared (checked in a browser); the done screen and stickers behave as before; build and lint pass; after shots in light and dark.

### CUR-21 · Story Corner: 10 stories a play, the bar counting its 20 answers
Story · P1 · S · needs: —
- **Why:** her feedback (2026-11-18), as CUR-20. Story Corner deals 9 stories a play, each with a word hunt and a question, so 18 answers, and the bar says "Round 1 of 9".
- **How:**
  - 10 stories a play (`roundsPerPlay` in `StoryTime.tsx`); the bar counts the answers, two per story (the word hunt, then the question), 20 a play. Use the same way of counting steps as CUR-20, whichever lands first.
  - Every grade's pool still holds two plays (CUR-17's rule, now 20 stories). Kindergarten has 18 at tier 1 or below, so it needs at least two new stories (count each grade's pool at build), written to `esl-content-writing`'s style for Alex's OK; `story-check`, `deck-check` and `fit-check` (`only=` the new stories) cover them; render their lines.
- **Blocked (2026-11-21):** built and checked in away mode; waits for Alex's OK on the two new Kindergarten stories (`screenshots/review/cur21-stories.md`) and his commit. 1st and 2nd grade already held two plays (27 and 36 stories).
- **Complete when:** `twenty-check.mjs` shows Story Corner at 20 at every grade; a play deals 10 stories and the bar moves once per answer; every grade's pool holds two plays (the deck check); the new stories pass the content checks and Alex has OKed them; `voice:audit`, build and lint pass.

### CUR-23 · Story Corner's "Hear the answers" button
Story · P1 · S · needs: —
- **Why:** her feedback (2026-11-18): "For story corner have an option to read the answers." Alex's pick: one button, at every grade.
- **How:**
  - Under the question, a kit ChunkyButton with the speaker icon, like "Hear the story": it reads the three answers in the order they're shown (`pronunciation.speakSequence`), each a whole `{ text }` line. It follows the same rule as "Hear the story" for when it can be pressed, and a new tap or an answer stops it.
  - Only Story Corner; the story lessons' questions are a new ticket if she asks.
  - Render every answer that has no clip yet (the wrong answers mostly don't); `voice:audit` passes.
- **Blocked (2026-11-21):** built and checked in away mode (`story-answers-check.mjs`, 17/17; its `--fit` mode, 152 questions fit); waits for Alex's OK on the look (`screenshots/review/cur23-hear-the-answers.png`) and his commit, one with CUR-21's.
- **Decided (Alex, 2026-11-21):** the button waits for a first try at 1st and 2nd grade, like "Read me the story".
- **Complete when:** the button shows under every Story Corner question at every grade, and a tap plays the three answers' clips in the shown order (a browser check logging the clips); no answer plays the browser voice; before and after shots in light and dark, and Alex's OK on the look; `voice:audit`, build and lint pass.

### CUR-22a · 1st grade's story lessons ask 20 a play, with more stories
Story · P1 · M · needs: —
- **Why:** CUR-22, split by grade (2026-11-21). Little Stories and More Little Stories deal 2 stories a play with one question each ("Round 1 of 2"); she asked for "more little stories and maybe 2 more questions".
- **How:**
  - The engine, for both grades: a story asks its questions one after another once it's read, the bar counting each; a story's `comprehensionQuestion` becomes a list (`StoryRow.questions`), and a story lesson's `perPlay` is 5 stories, 4 questions each: 20.
  - Content: each lesson grows from 6 stories to 10, every story with 4 questions (three answers, the right one first, and Luna's spoken "because"), in the approved style: 8 new stories and 68 new questions, one list for Alex's OK before building.
  - Content checks cover every story and question; `fit-check` (`only=Little Stories`); render the new lines.
- **Drafted (2026-11-21):** the list is `screenshots/review/cur22a-stories.md` (4 new stories a lesson, 3 new questions for each story there; `story-copy-check.py` passes); building waits for Alex's OK on it.
- **Decided (Alex, 2026-11-21):** the list is OKed as written; build it, and he looks through everything after.
- **Blocked (2026-11-21):** built in away mode with CUR-22b, one code commit; waits for Alex's look-through (`screenshots/review/cur22-story-lessons.png`) and his commit. A story asks its 4 questions in turn under the story (`StoryReader`), each right answer a step on the bar (`GameDef.steps`), 5 stories a play; `story-lesson-check.mjs` passes at 1st and 2nd grade and fails on the code before ("of 2", one question). Luna's start line now says "my questions".
- **Complete when:** `twenty-check.mjs` shows both lessons at 20; each holds 10 stories of 4 questions, asked in turn after the story; each story once before any comes again (BUG-32); the content checks pass, covering the new items; Alex has OKed the list; `voice:audit`, build and lint pass.

### CUR-22b · 2nd grade's story lessons ask 20 a play, with more stories
Story · P1 · M · needs: CUR-22a
- **Why:** as CUR-22a, for Luna's Rocket Adventure, More Storybooks and Storybook Shelf.
- **How:** CUR-22a's engine as built; each lesson grows from 6 stories to 10, every story with 4 questions: 12 new stories and 102 new questions, one list for Alex's OK before building; checks and voice as CUR-22a.
- **Drafted (2026-11-21):** the list is `screenshots/review/cur22b-stories.md` (12 new stories, 102 new questions; `story-copy-check.py` passes); building waits for Alex's OK on it, and on CUR-22a's engine.
- **Decided (Alex, 2026-11-21):** the list is OKed as written; build it after CUR-22a.
- **Blocked (2026-11-21):** built with CUR-22a; waits for Alex's look-through. One answer was shortened to fit ("The Little Lighthouse": "All boats got home"); every story question fits at the four iPad sizes.
- **Complete when:** `twenty-check.mjs` shows all three lessons at 20; each holds 10 stories of 4 questions; the content checks pass, covering the new items; Alex has OKed the list; `voice:audit`, build and lint pass.

### CUR-24 · The countdown in games only, 30 seconds a round
Story · P1 · S · needs: —
- **Why:** her feedback (2026-11-21): "timer only on games not lessons" and "timer too fast in games, make 30 seconds". Lessons run in the game shell, so they got CUR-16's pie too; a game round has 10 to 30 seconds now.
- **How:**
  - Lessons have no countdown: `lessonGame` (`engine/lessons.ts`) gives no `timer`.
  - `ANSWER_SECONDS` (`engine/timer.ts`): every game round 30 seconds at 1st and 2nd grade; Treasure Path's passages keep 45 in 1st grade (30 in 2nd). CUR-16's "less time in 2nd grade" rule goes. Decided (Alex, 2026-11-21). Kindergarten stays untimed.
  - `timer-check.mjs` follows the new table and checks that no lesson shows a pie.
- **Blocked (2026-11-21):** built and checked in away mode; waits for Alex's OK on the review sheet (`screenshots/review/cur24-timer.png`) and his commit. `timer-check` passes, and fails 8 lines on the code before.
- **Complete when:** at 1st and 2nd grade no lesson shows the pie and every game's pie starts at 30 (Treasure Path at 45 in 1st grade), checked in a browser by `timer-check.mjs`, which fails on the code before; build and lint pass; after shots of a game and a lesson.

### CUR-29 · The countdown in every game: Bubble Sounds, Muddled Cards and Story Corner too
Story · P1 · S · needs: —
- **Why:** her feedback (2026-11-21), "timer only on games not lessons", reads as every game. CUR-16 left Bubble Sounds (already a race), Luna's Muddled Cards and Story Corner untimed, and CUR-24 kept that, so Alex saw no pie in Bubble Sounds (2026-11-22). Decided (Alex, 2026-11-22): all three get the 30-second pie.
- **How:**
  - `timer` on the three games (`engine/timer.ts`'s kinds, 30 seconds at 1st and 2nd grade; Kindergarten stays untimed): Bubble Sounds `find` (a round is 3 or 4 pops, like the Letter Jar), Story Corner `read`, Muddled Cards `find`.
  - Muddled Cards and Story Corner time each step, not the round: a board is 4 to 6 pairs, a story is a word hunt and then a question. A new `GameDef.timerPerStep` gives a fresh pie after each `api.tick`, and a miss or running out takes the pie away only until the next step.
  - The lines are the ones every game has ("Time's up! You can still answer it."): no new voice.
  - `timer-check.mjs` checks the three games' pies (and the fresh pie after a step), and fails on the code before.
- **Found in the code (2026-11-22):** Story Corner's first step is reading the whole story and then the hunt, so its pie starts with the hunt (`waitsToAsk`, `api.asking()` as the hunt opens), like What's Missing: the story itself is read untimed (Claude's pick, for Alex's OK).
- **Blocked (2026-11-22):** built; waits for Alex's OK on `screenshots/review/cur29-every-game-timed.png` and his commit. `timer-check` passes and fails 6 lines on the code before (no pie in the three games).
- **Decided (Alex, 2026-11-22):** "great! push this out please": the look and the story read untimed are OKed; pushed so the teacher can test it, and it stays Blocked with run 10's tickets until she has.
- **Complete when:** at 1st and 2nd grade, Bubble Sounds, Muddled Cards and Story Corner show the pie at 30; in Muddled Cards and Story Corner a step done brings a fresh 30; in Kindergarten none; checked in a browser by `timer-check.mjs`, which fails on the code before; the other games and lessons behave as before (`timer-check`'s other lines); build and lint pass; after shots of the three games with the pie.

### CUR-25 · Blend sounds said closer together
Story · P1 · S · needs: —
- **Why:** her feedback (2026-11-21): "blends is too far apart, make sounds closer". Luna waits 260 ms between one sound and the next when she sounds a word out (/b/ … /a/ … /t/), so it doesn't sound like one word being blended.
- **How:** the wait between two sounds goes from 260 ms to about 100 ms, in both places that set it (`soundOutWord` and `playSequence` in `utils/pronunciation.ts`), as one named value. The clips themselves don't change.
- **Blocked (2026-11-21):** built and checked in away mode; waits for Alex's ear on `screenshots/review/cur25-blends-before-then-after.wav` (260 ms, then 100 ms) and his commit. `blend-gap-check` passes (102 ms) and fails on the code before (262 ms).
- **Complete when:** a browser check of a blend round logs the sounds starting about 100 ms after the one before ends (260 ms on the code before); no clip plays the browser voice; build and lint pass; Alex has listened and OKs the spacing.

### CUR-26 · Sentences spaced like a book
Story · P1 · S · needs: —
- **Why:** her feedback (2026-11-21): "weird sentence spacing for sentences". Every tappable word in a sentence is at least 48 px wide (DES-23), so a short word like "a" or "on" sits in a wide box: "Pip  has   a   black hat." It shows in the sentence and story lessons.
- **How:** in `lessons/shared/LessonKit.module.scss`, a word is only as wide as itself, with about a space between words; its 48 px tap area stays, reaching past the word on each side without moving it (an invisible area around the word), from the tokens.
- **Blocked (2026-11-21):** built and checked in away mode; waits for Alex's OK on `screenshots/review/cur26-word-spacing.png` and his commit. `word-space-check` passes (8px between every pair of words) and fails on the code before (8–27px); `layout-audit` now reads a word's invisible tap area.
- **Complete when:** in the sentence and story lessons the gap between any two words is the same, about one space (measured in a browser); every word still has a tap area of at least 48 px and a tap says the word it's on; before and after shots in light and dark, and Alex's OK on the look; build and lint (the design check) pass.

### CUR-27a · Kindergarten's sight words: Dolch 1–50
Story · P1 · M · needs: —
- **Why:** her feedback (2026-11-21): "more lessons in sight words to match Dolch sight words: K (1–50), 1st (1–100), 2nd (100–250)". Kindergarten has 23 sight words in 4 lessons now.
- **How:**
  - The Dolch words in their usual order (pre-primer, then primer): Kindergarten's are 1–50. 10 words a lesson, each in 2 sentences with a matching emoji and 2 look-alikes: 20 questions, one play. So 5 lessons, in order, replacing today's 4; keep the old lesson IDs for the first lessons so a saved device keeps its progress.
  - Written in the approved style for Alex's OK before building; a sight word is heard, never shown (BUG-27); `library-fit-check` passes with the longer list; render the new lines.
- **Drafted (2026-11-21):** the list is `screenshots/review/cur27a-dolch-k.md` (5 lessons; `sight-list-check.py` passes). Claude's pick: he, like, no, on and she (Dolch past 50) move to 1st grade. Building waits for Alex's OK.
- **Decided (Alex, 2026-11-21):** the list and the pick are OKed; build it.
- **Blocked (2026-11-21):** built in away mode with CUR-27b and CUR-27c, one code commit (`src/data/lessons/dolch.ts`); waits for Alex's look-through (`screenshots/review/cur27-sight-lessons.png`). `distractor-check` found 21 words whose look-alikes all started with another letter (the first sound gave it away); each got one look-alike that starts like it, and `sight-list-check.py` now fails such a row. The library check fails with the longer sight skills: logged as CUR-28.
- **Complete when:** Kindergarten's sight lessons hold Dolch 1–50, 10 a lesson, each at 20 on the bar (`twenty-check.mjs`); the content checks pass, covering every new sentence; Alex has OKed the list; `voice:audit`, build and lint pass.

### CUR-27b · 1st grade's sight words: Dolch 1–100
Story · P1 · M · needs: —
- **Why:** as CUR-27a. 1st grade has 18 sight words in 3 lessons now.
- **How:** as CUR-27a, for Dolch 1–100: 10 lessons of 10 words. Words 1–50 may reuse Kindergarten's sentences or get new ones (Alex's call on the list).
- **Drafted (2026-11-21):** the list is `screenshots/review/cur27b-dolch-1st.md` (lessons 6–10 new; `sight-list-check.py` passes). Claude's picks: lessons 1–5 reuse Kindergarten's words and sentences; his, her, of, when and some (Dolch past 100) move to 2nd grade; after, again and could (Dolch 93–100) come down from 2nd grade with their sentences. Building waits for Alex's OK.
- **Decided (Alex, 2026-11-21):** the list and all three picks are OKed; build it.
- **Blocked (2026-11-21):** built with CUR-27a; waits for Alex's look-through. A sight lesson follows each other lesson on 1st grade's path.
- **Complete when:** 1st grade's sight lessons hold Dolch 1–100, 10 a lesson, each at 20 on the bar; the content checks pass, covering every new sentence; Alex has OKed the list; `voice:audit`, build and lint pass.

### CUR-27c · 2nd grade's sight words: Dolch 101–220
Story · P1 · M · needs: —
- **Why:** as CUR-27a. 2nd grade has 18 sight words in 3 lessons now. She asked for 100–250, but the Dolch list ends at 220 (315 with its 95 nouns).
- **How:** as CUR-27a, for Dolch 101–220: 12 lessons of 10 words. Ask her which list goes on to 250; words past 220 are a new ticket once she says.
- **Drafted (2026-11-21):** the list is `screenshots/review/cur27c-dolch-2nd.md` (12 lessons; `sight-list-check.py` passes). Claude's pick: today's 5 non-Dolch words (friend, people, should, thought, through) stay as a 13th lesson until the teacher says which list goes on to 250. Building waits for Alex's OK, and the question to her.
- **Decided (Alex, 2026-11-21):** the list and the 13th lesson are OKed; build it. He asks her which list goes on to 250 (Fry's is the usual one); words past 220 are a new ticket once she says.
- **Blocked (2026-11-21):** built with CUR-27a; waits for Alex's look-through. A sight lesson follows each other lesson on 2nd grade's path; the 13-lesson skill is what CUR-28 is about.
- **Complete when:** 2nd grade's sight lessons hold Dolch 101–220, 10 a lesson, each at 20 on the bar; the content checks pass, covering every new sentence; Alex has OKed the list; `voice:audit`, build and lint pass.

### CUR-28 · The library stays short with a skill of 10 lessons or more
Story · P1 · M · needs: CUR-27c
- **Why:** found in CUR-27's checks (2026-11-21). The sight words skill now has 10 lessons in 1st grade and 13 in 2nd, and its tray of lesson cards is 2 to 5 rows tall. When the lesson up next is in its last row, the library opens scrolled down and the Play Shelf is far below, breaking CUR-7's rule (`library-fit-check.mjs`: 2nd grade, one lesson from the end, fails at 1180×820, 820×1180 and 744×1133; also at the middle of the path at 1180×820). It isn't the 13th lesson: with 12, three sizes still fail. Before, the biggest skill had 7 lessons.
- **How (for Alex's call first):**
  - **Claude's pick:** in a tray, a done lesson is a small round chip with its number and a check, all in one row, and only the lesson up next keeps its full card; a chip still opens its lesson to play again. 13 lessons stay one short row.
  - Or: the tray is one row of cards that scrolls sideways, opening on the card up next.
  - From the kit and the roles; `library-fit-check` passes at every grade, size and point on the path; light and dark shots for his OK.
- **Decided (Alex, 2026-11-21):** Claude's pick: done lessons become number chips in one row, the lesson up next keeps its full card.
- **Blocked (2026-11-21):** built in away mode (LessonCard's `compact` form, the library's chip row); waits for Alex's OK on `screenshots/review/cur28-library-chips.png` and his commit. `library-fit-check` passes (4 failed before), `kit-check`'s chip lines fail with its size off. A done lesson's "took N min" is now said in its label only: his look.
- **Complete when:** `library-fit-check.mjs` passes at all three grades and four iPad sizes with the 10- and 13-lesson skills, and fails on the code before; every lesson in a tray still opens on a tap (done ones to play again); before and after shots, light and dark; Alex OKs the look; build and lint pass.

### CUR-13 · Every lesson holds at least 20 of its own
Story · P1 · L · needs: — · split by grade before starting
- **Why:** at 20 a play (CUR-12), a lesson of 10 deals each question twice a play, and 6 times over its 3 good plays. Practice should keep dealing new things (Alex: practice until learned; content is a baseline).
- **How:**
  - Grow every lesson below 20 questions to at least 20: 47 of the 55, the 5 story lessons (CUR-22a/b) and the sight lessons (CUR-27a–c) aside. Content follows CNT's rules: words come from the word bank, the picture matches the word, look-alikes stay apart (`LOOK_ALIKE`), and a lesson only uses what it teaches (a Magic E lesson, only Magic E words).
  - Split into one ticket per grade (CUR-13a Kindergarten, CUR-13b 1st grade, CUR-13c 2nd grade), each written for Alex to review at once, as CUR-4b was, smallest lessons first.
  - Render the new words and lines (`npm run voice:render`, `npm run voice:audit`).
- **Complete when:** every lesson but the stories holds 20 questions or more; the content checks pass, covering the new items; `voice:audit`, build and lint pass; Alex has OKed each grade's list.