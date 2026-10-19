# CNT — One content model (Phase 4)

### CNT-2 · Lessons generated from the content bank
Story · P1 · L · split before starting
- **Why:** lessons are hand-written in `data/readingCurriculum.ts`, separately from the word bank in `engine/content.ts`, and use different emojis and capitalisation for the same words.
- **How:** make each lesson a short spec, for example `{ type: 'blend-and-read', words: ['cat', 'pig', 'dog'] }`, and generate the choices from the bank using `engine/distractors.ts`.
- **Complete when:** each word has one entry and one picture, and the voice inventory still covers everything.
- **Blocked (2026-10-18): a split to OK before it starts (size L).** Claude's proposal:
  - **CNT-2a · Lessons draw their words from the bank:** every word a lesson shows takes its spelling and picture from `WORDS` (missing ones added there), so each word has one entry and one picture (the Complete when above); the lessons' choices stay as written. Today, for example, a truck is 🚚 in lessons and 🚛 in the bank.
  - **CNT-2b · Generated choices:** lessons become short specs whose wrong answers come from `engine/distractors.ts`.
  - Recommendation: do 2a; drop 2b unless Alex wants it, since the lessons' hand-written choices are approved, and `distractor-check.mjs` already holds them to the rules (in `voice:audit` since CNT-4).

### CNT-3 · Content QA pass
Task · P1 · S
- **Mismatched pictures:** 😴 for "the little cat", 🛋️ for "table", 🧹 for "mop", 🏃 for "run".
- **True/false:** some claims copy the sentence word for word.
- **Complete when:** every listed item is fixed, and a fresh read-through of `content.ts` and `readingCurriculum.ts` finds no ambiguous item or mismatched picture.
- **Blocked (2026-10-18): the listed pictures are fixed; the rest is Alex's call.** "The little cat is sleeping" and "…under the table" now show the cat (🐱) instead of a sleepy face and a couch; "mop" (no emoji draws one; it was a broom) became **monkey 🐒**, rendered. "RUN 🏃" is a running figure, which does say "run", so it stays. The true/false copies are all in the old sentence bank no game reads any more (OPS-7 removes it); none of Treasure Path's 18 passages copies its passage. The read-through found more words no emoji draws, each with a stand-in, for Alex to keep or swap (a swap changes rhyme families and letter sets): igloo 🛖 (a hut), bun 🍞 (bread), jam 🍓 (a strawberry), ham 🍖 (meat on a bone), mug ☕ ("coffee"), jet 🛩️ beside plane ✈️, pup 🐕 beside dog 🐶; and the curriculum's truck 🚚 differs from the bank's 🚛 (CNT-2 merges them). Checks: `voice:audit`, `distractor-check.mjs`, `passage-check.mjs`, lint, build; no screen changed.

