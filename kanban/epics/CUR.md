# CUR — Curriculum: the teacher's try-out

**Goal:** the lessons feel right to the teacher in class. Back from her
try-out (2026-11-12): each skill's lessons go 1, 2, 3, a play is about 20
questions, a lesson is practiced at least 20 different things, and the child
reads first, with Luna helping after. (The first CUR epic, 19 lessons in
order, the library by skill and the cheat sheet, closed on 2026-11-11.)

### CUR-13 · Every lesson holds at least 20 of its own
Story · P1 · L · needs: — · split by grade before starting
- **Why:** at 20 a play (CUR-12), a lesson of 10 deals each question twice a play, and 6 times over its 3 good plays. Practice should keep dealing new things (Alex: practice until learned; content is a baseline).
- **How:**
  - Grow every lesson below 20 questions to at least 20: 47 of the 55, the 5 story lessons aside. Content follows CNT's rules: words come from the word bank, the picture matches the word, look-alikes stay apart (`LOOK_ALIKE`), and a lesson only uses what it teaches (a Magic E lesson, only Magic E words).
  - Split into one ticket per grade (CUR-13a Kindergarten, CUR-13b 1st grade, CUR-13c 2nd grade), each written for Alex to review at once, as CUR-4b was, smallest lessons first.
  - Render the new words and lines (`npm run voice:render`, `npm run voice:audit`).
- **Complete when:** every lesson but the stories holds 20 questions or more; the content checks pass, covering the new items; `voice:audit`, build and lint pass; Alex has OKed each grade's list.