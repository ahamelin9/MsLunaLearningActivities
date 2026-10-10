# CNT — One content model (Phase 4)

### CNT-1b · Fill-in-the-blank: no wrong word that also fits
Story · P1 · M
- **Why:** CNT-1 split (Alex, 2026-10-10). Code can't tell on its own whether a word fits a sentence ("My **cat** is new", "reads a book on the **bench**"), and Treasure Path's passages (GAME-1a) rewrite every fill-in-the-blank anyway, so the rule comes first and GAME-1a writes its items in this format.
- **How:** each fill-in-the-blank item records the words that would also make it true (Alex, 2026-10-10: recorded per item, so same-type wrong words like hot / cold stay). `engine/distractors.ts` never offers one of those as wrong, and `.claude/skills/know-how/distractor-check.mjs` fails when an item's list is missing or a wrong choice is on it. Covers Treasure Path's blanks and the extra tile in Words Off the Page. Fold in CNT-3's ambiguous four (frog/fish, hat/cat, beach/bench, under/behind).
- **Complete when:** every fill-in-the-blank item has its list; the check fails on a planted wrong choice that's on an item's list, and on an item with no list, and passes on the real content.

### CNT-2 · Lessons generated from the content bank
Story · P1 · L · split before starting
- **Why:** lessons are hand-written in `data/readingCurriculum.ts`, separately from the word bank in `engine/content.ts`, and use different emojis and capitalisation for the same words.
- **How:** make each lesson a short spec, for example `{ type: 'blend-and-read', words: ['cat', 'pig', 'dog'] }`, and generate the choices from the bank using `engine/distractors.ts`.
- **Complete when:** each word has one entry and one picture, and the voice inventory still covers everything.

### CNT-3 · Content QA pass
Task · P1 · S
- **Ambiguous fill-in-the-blanks:** frog/fish, hat/cat, beach/bench, under/behind.
- **Mismatched pictures:** 😴 for "the little cat", 🛋️ for "table", 🧹 for "mop", 🏃 for "run".
- **True/false:** some claims copy the sentence word for word.
- **Complete when:** every listed item is fixed, and a fresh read-through of `content.ts` and `readingCurriculum.ts` finds no ambiguous item or mismatched picture.

### CNT-4 · Automated content checks in `voice:audit`
Task · P2 · S
- **How:** make the audit fail on the wrong-answer rules (run `distractor-check.mjs` from it), the CNT-1b list and the CNT-3 problems, so they can't come back.

- **Complete when:** the audit fails on a deliberately planted bad item for each rule, and passes again once the item is removed.
