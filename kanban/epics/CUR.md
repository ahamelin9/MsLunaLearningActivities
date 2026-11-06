# CUR — Curriculum (Phase 6)

### CUR-6 · A lesson is practiced until it's learned
Story · P1 · M · needs: CNT-2
- **Why:** Alex (2026-11-06): "it shows you do one lesson and finish it but it really should be like they should do it a number of times to ensure they have actually learned it." Today one play, however it went, marks a lesson done and opens the next.
- **How:**
  - A lesson's questions become a pool; each play deals a fixed number of them from a deck (GAME-8), so a replay asks new things, and anything missed in the last play comes back first.
  - **The rule (Claude's pick, one constant to change, `LEARN_RULE` in `engine/practice.ts`, since saving can't import the lessons):** a lesson is learned after 3 good plays. A good play has at least 4 of 5 rounds right the first time (80%, the usual classroom mastery line). So no child is ever stuck, 6 plays of any kind also move the path on. Learned is what `completedLessons` means from now on, so the path, the moon, the trophies and old saves keep working: a lesson an old save finished stays done.
  - The library's card shows how far along the practice is, and the done screen says what happened and leads back in to practice, with "Next lesson" only once the next is open. Every new line is a whole rendered clip.
- **Complete when:**
  - a browser check plays a lesson from a fresh save: 2 good plays leave the next locked, the 3rd opens it; a weak play doesn't count as good; 6 plays of any kind open it; an old save's finished lessons stay done;
  - a replay's rounds differ from the play before it, and a round missed comes back in the next play;
  - the card and done screen show the practice in light and dark at the four sizes; `lesson-order-check`, `moon-check`, `partway-check`, `voice:audit`, build and lint pass;
  - Alex has played it and OKed the rule.
- **Built (2026-11-06), waits for Alex's OK:** see `screenshots/review/HANDOVER.md`, and `practice-check.mjs`. The library's up-next card now scrolls into view if it falls below the fold.

### CUR-4a · Kindergarten's lessons: 6 become 19
Story · P1 · M · needs: CNT-2, CNT-5
- **Why:** Alex (2026-11-06) wants much more to learn. Kindergarten had 6 lessons, with 15 of its 26 letters never taught.
- **How:** `data/lessons/kindergarten.ts`: more rounds for the first six, then 13 new lessons in path order: letter sounds (all 26), letter hunts (capital and little), short vowels, sight words and rhymes. Rounds are one line of data each (`data/lessonRounds.ts`), their words and pictures from the bank.
- **Decided (Alex, 2026-11-06):** Claude writes the full set in the approved style and he reviews it all at once, instead of one sample first.
- **Complete when:** the path has the 19 lessons and each deals at least 2 plays' worth of rounds (the stories' lessons at least 2 stories a play); `distractor-check`, `read-tense-check`, `voice:audit`, build and lint pass; the review page lists every new round for Alex to strike anything; Luna's lines for later lessons exist (`lesson-order-check`).
- **Built (2026-11-06), waits for Alex's OK:** the review page is <https://claude.ai/artifact/XKeifMgCASqZ3B3mp7SV1M>; his notes come back by each row's code.

### CUR-4b · 1st grade's lessons: 3 become 18
Story · P1 · M · needs: CNT-2, CNT-5
- **Why:** 1st grade had 3 lessons. Alex (2026-11-06) wants much more to learn.
- **How:** `data/lessons/grade1.ts`: more rounds for the first three, then 15 new lessons: SH, CH, TH and WH, L, R and S blends, magic E, rhymes, sight words, sentences and little decodable stories.
- **Complete when:** the path has the 18 lessons and each deals at least 2 plays' worth of rounds; the same checks and review page as CUR-4a pass.
- **Built (2026-11-06), waits for Alex's OK:** the review page is <https://claude.ai/artifact/XKeifMgCASqZ3B3mp7SV1M>; his notes come back by each row's code.

### CUR-4c · 2nd grade's lessons: 3 become 18
Story · P1 · M · needs: CNT-2, CNT-5
- **Why:** 2nd grade had 3 lessons. Alex (2026-11-06) wants much more to learn.
- **How:** `data/lessons/grade2.ts`: more rounds for the first three, then 15 new lessons: vowel teams (AI/AY, EE/EA, OA/OW, IGH, OO, OU/OW), vowels with R (AR, OR, ER/IR/UR), compounds, sight words and stories. Words with OU/OW's sound, which has no sound clip yet, are read and matched rather than tapped sound by sound.
- **Complete when:** the path has the 18 lessons and each deals at least 2 plays' worth of rounds; the same checks and review page as CUR-4a pass.
- **Built (2026-11-06), waits for Alex's OK:** the review page is <https://claude.ai/artifact/XKeifMgCASqZ3B3mp7SV1M>; his notes come back by each row's code.

### CUR-7 · The library stays short with 19 lessons
Story · P2 · S · needs: CUR-4a, CUR-4b, CUR-4c
- **Why:** seen while building CUR-4 (2026-11-06): with 18 or 19 lesson cards, the Play Shelf sits far below the fold, so a child scrolls past every lesson to reach a game. CUR-6 already scrolls the up-next card into view if it falls below the fold, which takes the games further away still. Confirmed in the shots at 1180 and 744.
- **How (Claude's pick, for Alex before building):** the path shows the up-next lesson with a few around it, and the finished ones fold behind one "Lessons done" control that opens them, so replaying stays one tap away and the Play Shelf stays near. No new primitive if the kit's disclosure fits. The other way, the shelf above the path, would reorder a screen the teacher approved, so it needs her say.
- **Complete when:** at the four sizes, at the start, middle and end of each grade's path, the up-next lesson and the top of the Play Shelf are reachable with at most one screen of scrolling; every finished lesson can still be opened; `layout-audit`, `lesson-order-check`, build and lint pass; Alex has OKed the look.

