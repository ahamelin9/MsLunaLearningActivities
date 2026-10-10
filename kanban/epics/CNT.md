# CNT — One content model (Phase 4)

### CNT-2 · Lessons generated from the content bank
Story · P1 · L · split before starting
- **Why:** lessons are hand-written in `data/readingCurriculum.ts`, separately from the word bank in `engine/content.ts`, and use different emojis and capitalisation for the same words.
- **How:** make each lesson a short spec, for example `{ type: 'blend-and-read', words: ['cat', 'pig', 'dog'] }`, and generate the choices from the bank using `engine/distractors.ts`.
- **Complete when:** each word has one entry and one picture, and the voice inventory still covers everything.

### CNT-3 · Content QA pass
Task · P1 · S
- **Mismatched pictures:** 😴 for "the little cat", 🛋️ for "table", 🧹 for "mop", 🏃 for "run".
- **True/false:** some claims copy the sentence word for word.
- **Complete when:** every listed item is fixed, and a fresh read-through of `content.ts` and `readingCurriculum.ts` finds no ambiguous item or mismatched picture.

### CNT-4 · Automated content checks in `voice:audit`
Task · P2 · S
- **How:** make the audit fail on the wrong-answer rules (run `distractor-check.mjs` from it), the also-fits lists (`alsoFits`) and the CNT-3 problems, so they can't come back.

- **Complete when:** the audit fails on a deliberately planted bad item for each rule, and passes again once the item is removed.
