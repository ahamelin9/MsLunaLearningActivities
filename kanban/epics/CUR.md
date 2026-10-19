# CUR — Curriculum (Phase 6)

### CUR-1 · Fix lesson/title/copy mismatches
Task · P1 · S
- "Rainbow, Cupcake & Starfish" has no starfish question.
- The 2nd-grade story lesson has 1 question but pays 5 stars.
- The grade cards promise 1st-grade decodable stories, "igh", and chapter stories, none of which exist yet.
- **Complete when:** every lesson title matches its questions, every grade card describes only lessons that exist, and the story lesson's stars follow the PRG-1 rule.
- **Blocked (2026-10-19): built; waits for Alex's OK, and his call on the stars point.** "Rainbow, Cupcake & Starfish" is "Rainbow & Cupcake" (no emoji draws a starfish, so the title lost it; its clip rendered). Every lesson's title now matches its questions (all 12 listed against their words). The grade cards show only K, 1 and 2 since DES-9c, so they promise nothing. The story lesson paid 5 stars for one question and pays 3 now, as every lesson; PRG-1, not built yet, makes every lesson's stars follow how it was played, this one with them. Proposal: close CUR-1 with that point left to PRG-1. `voice:audit`, lint and build pass; the 2nd-grade library shot before and after is in `screenshots/cur1/`.

### CUR-3 · Real sight words
Story · P1 · S
- **Why:** "big" and "can" can be sounded out, so they aren't sight words. The skill description also promises "the" and "like", which aren't taught.
- **Fix:** teach the, see, like, I, a.
- **Complete when:** the sight-word lesson teaches the, see, like, I and a, with look-alike real words as wrong answers, and the skill description matches.
- **Blocked (2026-10-19): built and checked; waits for Alex's OK on the words and sentences.** Five rounds: the (she, then), see (sun, she, as before), like (lake, bike), I (it, in), a (at, an); no wrong answer sounds like its word. Example sentences shown once found: "The moon is up! 🌙", "I see a smiling star! ⭐", "I like red apples! 🍎", "I can hop! 🐰", "I see a bug! 🐞". The prompt "Find the word Ms. Luna says!" put "the" on screen before it was found, so it's "Which word does Ms. Luna say?"; Luna's opening line said "see", so it's "Some words we just know by heart." Every line phonemized first ("a" alone is "ay", in a sentence "uh"), then rendered. Nothing promises other words: the skill's description ("Recognize common words instantly by sight") fits. `sight-check.mjs` (know-how) passes and fails on the commit before; `voice:audit`, lint and build pass. Her random reactions can still name "a" or "I" on the perch: BUG-27. Sheet: `screenshots/review/cur3-sight-words.png`.

### CUR-4 · Expand the curriculum per grade
Story · P1 · L · needs: CNT-2 · split per grade before starting
- **Why:** today K has 6 lessons and 1st and 2nd grade have 3 each.
- **Target:**
  - K: more letter sounds and letter hunts.
  - 1st: ch/th/wh digraph lessons and decodable stories.
  - 2nd: "igh" and more vowel teams, plus multi-page stories.

- **Complete when:** each grade has every lesson from its split tickets, each passes the CNT-4 checks, and the grade cards describe them accurately.

### CUR-5 · Merge the two K blending lessons
Story · P2 · S
- **Why:** "Pet & Animal Words" and "Everyday Words (Sun, Bed, Cup)" play exactly the same way, three CVC words each (Alex, 2026-10-09).
- **How:** proposal to confirm with Alex: one blending lesson, or keep two but make the second a step up (for example four pictures, or no sound under each tile). Keep one existing lesson ID so a child's done tick survives.
- **Complete when:** the K hub shows no two lessons that play the same way, and a child who finished either old lesson still sees it done.
