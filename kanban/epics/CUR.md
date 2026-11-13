# CUR — Curriculum: the teacher's try-out

**Goal:** the lessons feel right to the teacher in class. Back from her
try-out (2026-11-12): each skill's lessons go 1, 2, 3, a play is about 20
questions, a lesson is practiced at least 20 different things, and the child
reads first, with Luna helping after. (The first CUR epic, 19 lessons in
order, the library by skill and the cheat sheet, closed on 2026-11-11.)

### CUR-11 · Each skill's lessons in order: 1, 2, 3
Story · P0 · M · needs: —
- **Blocked:** built under (a), waits for Alex's OK (`screenshots/review/cur11-lessons-in-order.png`).
- **Why:** the teacher (2026-11-12): "the lessons should be in order… per area it should go from 1, 2, 3, instead of like 1, 3, 8, 10", and "other lessons won't show, it jumps around to Magic E". The path weaves the skills together (`thenOn` in `readingCurriculum.ts`, CUR-4), so a skill's lessons carry path numbers like 1st grade's Letter teams: 1, 4, 6, 7, 9 and 11. After its Lesson 1, the lesson that opens is Magic E's. The weave also hides how much a skill holds: 2nd grade has 7 vowel-team lessons, but she saw one, then Compound words ("maybe a few lessons on different vowel teams").
- **How:**
  - **Alex's call first:** (a, recommended) every skill opens on its own, with its lessons in order inside it: the teacher picks the skill for her group, and in it Lesson 1 opens Lesson 2; or (b) one path, skill by skill: all of Letter teams before Magic E opens. **Decided (2026-11-12): (a), at the recommendation**, since it had to be ready for her next try and Alex hadn't picked; (b) is a small change to `lessonStates` if he'd rather.
  - Lessons are numbered inside their skill (`bucketsFor`, `engine/buckets.ts`): "Lesson 1, 2, 3" on the lesson cards, the done screen and the cheat sheet. Inside a skill, the lessons keep the order the curriculum gives them now.
  - Under (a), `lessonStates` (`engine/lessons.ts`) works per skill: in each skill the done lessons and the first one not done are open, the rest locked. A locked tap names the lesson up next in that skill ("Let's finish Lesson 2 first!", `FINISH_FIRST`, already rendered). The library opens on the first skill with a lesson not done, as CUR-7 does, and "Next lesson" on the done screen is the next one in the same skill.
  - An old save keeps every lesson it finished, since they're saved by id.
  - `lesson-order-check.mjs`, `library-fit-check.mjs` and `cheatsheet-check.mjs` learn the new order.
- **Complete when:**
  - at every grade, each skill's lesson cards read Lesson 1, 2, 3… in order, and so do the cheat sheet and the done screen;
  - finishing a skill's Lesson 1 opens its Lesson 2; under (b), the next skill opens only once this skill's last lesson is done;
  - 2nd grade's Vowel teams shows its 7 lessons together;
  - an old save with lessons done keeps them done;
  - those three checks, build and lint pass; before and after shots; Alex (and the teacher) OK.

### CUR-12 · About 20 questions a play, about 20 seconds each
Story · P0 · M · needs: —
- **Blocked:** built, waits for Alex's OK (`screenshots/review/cur12-twenty-rounds.png`). Its commit goes with CUR-11's: three files carry both. Found on the way: K's Rhyme Matcher had two questions with one id (`q-k-rh-sun`); one is `q-k-rh-sun-run` now, and `deck-check.mjs` fails on a shared id.
- **Why:** the teacher (2026-11-12): "maybe more than 5 practice questions would be useful. I do like that you have to do a lesson like 3 times to pass." Alex: about 20 questions a lesson instead of 5, timed at about 20 seconds a question instead of a minute. Today a play deals 5 (`ROUNDS_PER_PLAY`, `engine/practice.ts`) and the estimate counts 60 s a question (`ROUND_SECONDS.lesson`, `engine/times.ts`).
- **How:**
  - `ROUNDS_PER_PLAY` becomes 20 and `ROUND_SECONDS.lesson` 20, so a lesson card says "about 7 min" until 3 timed plays take over (PRG-6). Learned stays 3 good plays (`LEARN_RULE`), and a good play stays 80% right the first time: 16 of 20.
  - Most lessons hold 10 to 16 questions; only 3 hold 20. Until CUR-13 grows them, a play that runs out deals the lesson's questions again (`dealMissedFirst`, `engine/deck.ts`): missed ones first, never the same one twice in a row. `lessonGame` stops capping a play at its lesson's size.
  - Story lessons (a whole story and its question each round) keep 2 a play and get a story's own time (90 s, as Story Corner has), so they say "about 3 min". **Alex's call:** 2 a play, or 5. **Decided (2026-11-12): 2, at the recommendation.** Times are averaged per round now, so the 5-round plays timed before don't shorten a 20-round estimate.
  - The round counter in the play's header has to read at 20 (it was drawn for 5). If it doesn't fit, the luna-design skill decides its shape (the kit `ProgressBar`, or "7 of 20").
  - Stopping partway already resumes a lesson (`partway`); check it still does at 20.
  - Games keep their own rounds and times: the teacher asked about lessons.
  - `practice-check.mjs`, `partway-check.mjs` and `deck-check.mjs` learn the new count where they count 5.
- **Complete when:**
  - a play of every lesson but the stories deals 20 rounds, never the same question twice in a row (a check deals each lesson 20 times);
  - a lesson card not timed yet says "about 7 min", and a story lesson "about 3 min";
  - the round counter reads at 20 at the four iPad sizes, in light and dark;
  - a lesson left at round 12 resumes at round 13, and 16 of 20 right the first time is a good play while 15 isn't;
  - those checks, build and lint pass; before and after shots; Alex OKs.

### CUR-13 · Every lesson holds at least 20 of its own
Story · P1 · L · needs: CUR-12 · split by grade before starting
- **Why:** at 20 a play (CUR-12), a lesson of 10 deals each question twice a play, and 6 times over its 3 good plays. Practice should keep dealing new things (Alex: practice until learned; content is a baseline).
- **How:**
  - Grow every lesson below 20 questions to at least 20: 47 of the 55, the 5 story lessons aside. Content follows CNT's rules: words come from the word bank, the picture matches the word, look-alikes stay apart (`LOOK_ALIKE`), and a lesson only uses what it teaches (a Magic E lesson, only Magic E words).
  - Split into one ticket per grade (CUR-13a Kindergarten, CUR-13b 1st grade, CUR-13c 2nd grade), each written for Alex to review at once, as CUR-4b was, smallest lessons first.
  - Render the new words and lines (`npm run voice:render`, `npm run voice:audit`).
- **Complete when:** every lesson but the stories holds 20 questions or more; the content checks pass, covering the new items; `voice:audit`, build and lint pass; Alex has OKed each grade's list.

### CUR-14 · The child reads first, then Luna helps
Story · P1 · M · needs: —
- **Blocked:** built, waits for Alex's OK (`screenshots/review/cur14-read-first.png`); its new line "Try reading it first!" is rendered.
- **Why:** the teacher (2026-11-12): "some lessons are too easy with Ms. Luna reading it all the time; some lessons might be better with them trying to do it first and then her helping later on." Likely, from the code: in Sentences, Little stories and Storybooks, every word can be tapped to hear it before the child has tried (`SentenceReader.tsx`, `StoryReader.tsx`), so a sentence can be heard whole, a word at a time. Only "Hear the sentence" and "Read me the whole story" wait for a first try today. Luna also says each round's whole instruction as it starts (`usePrompt`), which after CUR-12 is 20 times a play.
- **How:**
  - **Alex's call first** (ask the teacher which lessons she meant). Recommended: the reading lessons, so Sentences, Little stories, Storybooks and the Read and Match lessons (Magic E, Vowel teams, Vowels with R, Compound words). **Decided (2026-11-12): those, at the recommendation**, for her next try; the teacher's answer can widen or narrow it.
  - In those, Luna's reading help waits for a first try, as "Hear the sentence" already does: a word tapped before the first answer gets a spoken nudge (one rendered line, e.g. "Try reading it first!") instead of the word. After a wrong answer, every word can be heard. The hint after a wrong try stays.
  - Luna says the instruction on a play's first round; later rounds start quiet, and the speaker button still says it.
  - Letter sounds, Letter shapes, Sight words and Rhymes stay as they are: listening is their task (heard, never shown).
- **Complete when:** in the chosen lessons, a word tapped before a first answer isn't read and Luna says her nudge, and after a wrong answer it is read; the instruction plays on round 1 only; `voice:audit`, build and lint pass; Alex (and the teacher) OK.
