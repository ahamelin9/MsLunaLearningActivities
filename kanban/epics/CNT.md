# CNT — One content model (Phase 4)

### CNT-1 · Shared wrong-answer (distractor) rules
Story · P1 · M
- **How:** create `engine/distractors.ts`, used by every game and lesson, with these rules:
  - No wrong choice shares the target's sound (BUG-4).
  - No wrong choice is visible elsewhere on screen (BUG-3).
  - Pictures are never repeated.
  - No first-letter giveaways (e.g. Boat / Car / Plane).
  - In fill-in-the-blank, a wrong word must not also fit the sentence.
- **Complete when:** every game and lesson builds its wrong answers through `engine/distractors.ts`, and a check over every game × grade × difficulty finds no rule broken.

### CNT-2 · Lessons generated from the content bank
Story · P1 · L · needs: CNT-1 · split before starting
- **Why:** lessons are hand-written in `data/readingCurriculum.ts`, separately from the word bank in `engine/content.ts`, and use different emojis and capitalisation for the same words.
- **How:** make each lesson a short spec, for example `{ type: 'blend-and-read', words: ['cat', 'pig', 'dog'] }`, and generate the choices from the bank using CNT-1.
- **Complete when:** each word has one entry and one picture, and the voice inventory still covers everything.

### CNT-3 · Content QA pass
Task · P1 · S
- **Ambiguous fill-in-the-blanks:** frog/fish, hat/cat, beach/bench, under/behind.
- **Mismatched pictures:** 😴 for "the little cat", 🛋️ for "table", 🧹 for "mop", 🏃 for "run".
- **True/false:** some claims copy the sentence word for word.
- **Complete when:** every listed item is fixed, and a fresh read-through of `content.ts` and `readingCurriculum.ts` finds no ambiguous item or mismatched picture.

### CNT-4 · Automated content checks in `voice:audit`
Task · P2 · S
- **How:** make the audit fail on the CNT-1 and CNT-3 problems, so they can't come back.

- **Complete when:** the audit fails on a deliberately planted bad item for each rule, and passes again once the item is removed.
