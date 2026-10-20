# CNT — One content model (Phase 4)

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

### CNT-3 · Content QA pass
Task · P1 · S
- **Mismatched pictures:** 😴 for "the little cat", 🛋️ for "table", 🧹 for "mop", 🏃 for "run".
- **True/false:** some claims copy the sentence word for word.
- **Complete when:** every listed item is fixed, and a fresh read-through of `content.ts` and `readingCurriculum.ts` finds no ambiguous item or mismatched picture.
- **Decided (Alex, 2026-10-19):** drop "ham" from the bank (the "am" family keeps jam), and add a distractor rule that "jet" and "plane", and "pup" and "dog", never share a screen. The other stand-ins (igloo 🛖, bun 🍞, jam 🍓, mug ☕) stay until DES-27 draws our own pictures; the truck goes with CNT-2.
- **Done before (2026-10-18):** "The little cat is sleeping" and "…under the table" show the cat 🐱; "mop" became monkey 🐒; "RUN 🏃" stays; the true/false copies are only in the old sentence bank no game reads (OPS-7 removes it).
- **Where it stands (2026-10-19):** built; **Blocked: waits for Alex's OK.** "ham" is out of the bank (99 words). `LOOK_ALIKE` in `engine/distractors.ts` (jet/plane, pup/dog) is a rule in `ruleBreaks`, and `distinctByEmoji` skips a look-alike, so Memory Match and What's Missing never deal both. `distractor-check.mjs` found 84 such screens before the fix and none after, and has two planted cases. The fresh read-through found one mismatch, fixed: "football" was ⚽ (a soccer ball in American English), now 🏈. Two more weak pictures join the stand-ins for DES-27: seed 🌱 (a sprout) and doll 🪆 (a nesting doll); no emoji draws either better.
