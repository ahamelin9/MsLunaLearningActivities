# PRG — Progress & rewards (Phase 7)

### PRG-1 · Stars reflect performance
Story · P1 · M
- **Why:** today stars equal the number of rounds (Feed Luna 5–6, Muddled Cards 2–3) whatever the performance, and lessons can be replayed for the same stars.
- **How:** award 1–3 stars based on clean rounds, on the same scale for games and lessons. Replaying keeps your best result instead of adding more.
- **Complete when:** every game and lesson earns 1–3 stars by the same rule, and replaying never adds stars beyond your best.

### PRG-2 · Points: remove or give them a meaning
Story · P2 · S
- **Why:** points are shown next to stars but mean nothing to a child.
- **Complete when:** points are either gone from every screen and from storage, or every place they appear says what they mean in kid words.

### PRG-3 · Achievements worked out in one place
Task · P2 · S
- **Why:** two of the six achievements are only checked inside `TrophyModal`, not when progress is saved. "First Word Wonder" says "lesson" but unlocks from a game.
- **How:** check every achievement when progress is saved, and add a "new" state that clears the trophy dot (BUG-13).

- **Complete when:** achievements are checked only in `utils/storage.ts`, `TrophyModal` only reads them, and BUG-13 is closed.

### PRG-4 · Secret platinum trophy for a full squishy shelf
Story · P2 · S · needs: PRG-3, PRG-5
- **Why:** collecting every squishy should feel like a big moment (Alex, 2026-10-09).
- **How:**
  - A hidden achievement, checked with the others in `utils/storage.ts` (PRG-3), unlocks when every squishy (PRG-5) is on the shelf in at least one colour. It counts the whole set, so adding a squishy later raises the bar. Rare colours aren't needed (proposal, to confirm with Alex).
  - **The last squishy (Alex, 2026-10-09):** unlocking it also brings home one extra, one-of-a-kind squishy, "Pearl Moon", which sits at the top of the shelf's arch.
  - Until then the trophy appears nowhere. The round 2 shelf shows the top spot as a shimmering "?". To confirm with Alex: keep that tease, or leave the spot empty so it stays a complete secret like the trophy.
  - When it unlocks, Luna celebrates with a pre-rendered line, and the trophy shows in the Trophy room from then on.
- **Complete when:** with one squishy missing, no screen hints at the trophy; collecting the last one unlocks it, Luna says her line, and it stays in the Trophy room after a reload.

### PRG-5 · Squishies instead of the sticker tin
Story · P1 · M · needs: DES-2
- **Why:** the teacher wants the collectible to be squishies rather than emoji stickers (2026-10-09): squish balls, mochi animals, butter blocks and the like, with rare colours too. Today's tin is 18 emoji (`engine/stickers.ts`).
- **How:**
  - Replace the emoji with drawn squishies in the DES-2 style, generic shapes with no brand names or logos (round squish ball, mochi cat, bunny and bear, butter block, dumpling, peach, cloud, a little moon, and so on).
  - Each squishy comes in a usual colour from the palette. Some awards come in a **rare** colour (a soft tint) or a **super rare** one (swirl, shimmer, or glow). Proposal to confirm: 1 in 8 rare, 1 in 40 super rare. Odds live in one place.
  - The shelf shows each squishy once, with its rarest colour. Under it, a row of colour dots: a found colour is filled in, a usual colour still to find is grey, and a rare one still to find is a "?" (Alex, 2026-10-09).
  - Squishies not found yet: easier ones show as a greyed shape, harder ones as a "?" slot. Tapping either has Luna say a hint, never the answer to a round.
  - A new rare or super-rare squishy on the reward screen gets a shimmering, sparkling tag.
  - **Ways in to the shelf (Alex, 2026-10-09):** a Squishy Shelf card on the library (the last three found, on a little plank, with the count) and "See my shelf" on the lesson-done screen. The small header pill goes. (The home-screen bunny went with the "a little more" home screen, which the teacher passed on, 2026-10-10.)
  - Tapping a squishy on the shelf squishes it and Luna says its line (pre-rendered). With reduced motion it gives a small press instead.
  - Old saves keep their count: each sticker id maps to a squishy, so no child loses anything. The saved field can stay `stickers`.
  - Lessons and games keep their signature reward (`SIGNATURE_STICKER` in `engine/lessons.ts`, `nextSticker` in `engine/stickers.ts`).
- **Complete when:**
  - no emoji appears on the shelf, the reward screen or the home screen;
  - finishing a lesson or game puts a squishy on the shelf;
  - over 1,000 seeded awards, rare and super-rare colours come up within 2 points of the set odds;
  - a save with old stickers loads with the same number of squishies;
  - every squishy's line has a clip, and `voice:audit` passes.

### PRG-6 · Time per lesson: know it before, see it after
Story · P1 · M · needs: DES-13
- **Why:** the teacher wants to know how long a lesson takes before starting, and to see how much time and progress a child took (2026-10-09).
- **How:**
  - **Before:** each lesson card on the hub shows an estimate, e.g. "about 5 min", with a small clock. It starts as rounds × a typical round time, then uses the real average once a few plays are saved.
  - **During:** time only counts while the app is open and on screen (paused when the tab is hidden or the iPad sleeps).
  - **After:** the lesson-done screen shows the time taken next to the estimate, and the lessons bar moving on (DES-13).
  - **On the hub:** a "Today" line: minutes read today and lessons done (e.g. "12 min today · 3 of 6 done").
  - Saved per lesson: last time, best time and number of plays, in `utils/storage.ts`.
- **Complete when:**
  - every lesson card shows an estimate in minutes;
  - after a lesson, the done screen shows the minutes it took, and the hub's "Today" total goes up by the same amount;
  - hiding the tab for a minute mid-lesson doesn't add that minute;
  - the times survive a reload, and older saves load without errors.

### PRG-7 · Lessons open in order
Story · P1 · M
- **Why:** the teacher (2026-10-10): the lessons are linear, so a lesson opens only once the one before it is done. Games stay open to go in and out of as needed (Alex, 2026-10-10). Today every lesson is open; `completedLessons` is saved but nothing reads it to lock anything.
- **How:**
  - In each grade, Lesson 1 is open. Each next lesson opens when the one before is in `completedLessons` (`utils/storage.ts`). Done lessons stay open to play again.
  - Games on the Play Shelf are never locked.
  - Tapping a locked lesson never opens it. It gives a small wobble, and Luna says (pre-rendered) "Let's finish Lesson N first!", where N is the open one.
  - **Old saves:** lessons already done stay done and open, and the open one is the first lesson not done yet, so nobody loses anything.
  - If Luna's Pick can choose a lesson, it only picks an open one.
  - The look comes with DES-13. Until then, keep any screen change minimal, in today's style, and isolated so the restyle can replace it.
- **Complete when:** a fresh save has only Lesson 1 open in each grade; finishing it opens Lesson 2; tapping a locked lesson doesn't open it and plays Luna's line; every game opens at any time; a save with lessons done out of order loads with those still done and the first not-done lesson open; `voice:audit` passes.
