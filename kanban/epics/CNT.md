# CNT — One content model (Phase 4)

### CNT-5 · The word bank grows
Story · P1 · M · needs: CNT-2
- **Why:** Alex (2026-11-06) wants much more content and variety. Every game and, after CNT-2, every lesson deals from the bank, so more words there means more of everything.
- **How:** add words children this age know, each with a picture that really shows it (one picture per word, `voice:audit`), tiered by spelling pattern, with the rime on rhyming ones. American English. New look-alike pairs go in `LOOK_ALIKE`.
- **Complete when:** the bank has at least 200 words, at least 70 at tier 1 and 60 at each of tiers 2 and 3; `distractor-check`, `voice:audit`, build and lint pass; a review sheet shows every new word with its picture for Alex to strike anything.
- **Built (2026-11-06), waits for Alex's OK:** 99 words became 256 (81, 80 and 95 at tiers 1, 2 and 3). The review page is <https://claude.ai/artifact/XKeifMgCASqZ3B3mp7SV1M>.

### CNT-2 · Lessons draw their words from the content bank
Story · P1 · M · needs: —
- **Why:** lessons are hand-written in `data/readingCurriculum.ts`, separately from the word bank in `engine/content.ts`, and use different emojis and capitalisation for the same words (a truck is 🚚 in lessons and 🚛 in the bank).
- **Decided (Alex, 2026-10-19):** the split's first half only. Every word a lesson shows takes its spelling and picture from `WORDS` (missing ones added there), so each word has one entry and one picture; the lessons' hand-written choices stay as written. The second half, generating wrong answers from `engine/distractors.ts`, is dropped: the hand-written ones are approved, and `distractor-check.mjs` already holds them to the rules (in `voice:audit` since CNT-4). It also makes adding lots of content later easier (Alex's plan): new lessons name their words, the bank draws them.
- **How:** a lesson option names its word (`word: 'truck'`) and its text and picture come from the bank; `voice:audit`'s picture rule then covers the lessons too.
- **Complete when:** each word has one entry and one picture, every lesson word comes from the bank, and the voice inventory still covers everything.
- **Read against the code (2026-10-19), for Alex before building:** "missing ones added there" puts 12 lesson words into the bank, and every game deals from the bank, so they'd start showing up in games too. Calls, with a pick each:
  1. The 12 (ball, balloon, bear, bird, bowl, car, cloud, cookie, donut, fish, forest, run) join the bank with their lesson pictures. **Pick: yes, except "run":** it's an action (🏃) and the games' desks and cards hold things. It joins as a lesson-only word (a flag the games skip).
  2. Two new look-alike pairs come with them: forest 🌲 / tree 🌳 and ball ⚽ / football 🏈. **Pick: add both to `LOOK_ALIKE`** (CNT-3's rule).
  3. Truck: lessons 🚚, bank 🚛. **Pick: 🚚**, the everyday truck.
  4. Spelling: lessons say "Cat", the bank "cat". **Pick: the bank's lower case everywhere**, as the games already show; a lesson's caption appears only once solved.
  5. Sentence answers ("Green frog hopping 🐸") are phrases, not words. **Pick: keep the phrase, take the picture from the bank** (`word: 'frog'`).
  6. Sight-word choices (she, then, lake…) have no picture. **Pick: they stay plain text**, not bank words.
- **Built (2026-11-06), waits for Alex's OK:** went with the six picks, as he said to. See `screenshots/review/HANDOVER.md`.
