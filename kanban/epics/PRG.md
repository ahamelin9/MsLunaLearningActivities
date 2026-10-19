# PRG — Progress & rewards (Phase 7)

### PRG-2 · Points: remove or give them a meaning
Story · P2 · S
- **Why:** points are shown next to stars but mean nothing to a child.
- **Complete when:** points are either gone from every screen and from storage, or every place they appear says what they mean in kid words.

### PRG-3 · Achievements worked out in one place
Task · P2 · S
- **Why:** two of the six achievements are only checked inside `TrophyModal`, not when progress is saved. "First Word Wonder" says "lesson" but unlocks from a game.
- **How:** check every achievement when progress is saved, and add a "new" state that clears the trophy dot (BUG-13).

- **Complete when:** achievements are checked only in `utils/storage.ts`, `TrophyModal` only reads them, and BUG-13 is closed.
- **Blocked (2026-10-19): built and checked; waits for Alex's OK, and his call on BUG-13.** `withEarned` in `utils/storage.ts` adds every achievement whose rule in `data/achievements.ts` is met, on every save and on load; the hard-coded list is gone, and with it two slips: "First Word Wonder" unlocked from a game, and Super Star still at 50 after PRG-1 moved it to 30. The Trophy room only reads `unlockedAchievements`. `achievements-check.mjs` (know-how) passes, and fails on the commit before (5 of 7). No screen changed (`ui:shots --diff` 0). BUG-13's dot no longer exists (the Trophy room opens from the library's "My trophies" since DES-21, with no dot), so it's Alex's call: close BUG-13, or add a "new" dot to "My trophies".

### PRG-4 · Secret platinum trophy for a full squishy shelf
Story · P2 · S · needs: PRG-3, PRG-5
- **Why:** collecting every squishy should feel like a big moment (Alex, 2026-10-09).
- **How:**
  - A hidden achievement, checked with the others in `utils/storage.ts` (PRG-3), unlocks when every squishy (PRG-5) is on the shelf in at least one colour. It counts the whole set, so adding a squishy later raises the bar. Rare colours aren't needed (proposal, to confirm with Alex).
  - **The last squishy (Alex, 2026-10-09):** unlocking it also brings home one extra, one-of-a-kind squishy, "Pearl Moon", which sits at the top of the shelf's arch.
  - Until then the trophy appears nowhere. The round 2 shelf shows the top spot as a shimmering "?". To confirm with Alex: keep that tease, or leave the spot empty so it stays a complete secret like the trophy.
  - When it unlocks, Luna celebrates with a pre-rendered line, and the trophy shows in the Trophy room from then on.
  - **The milestone moon visits** (DES-17's last milestone, moved here 2026-10-10): the full shelf brings her once, through DES-17's visit, with her own pre-rendered line.
- **Complete when:** with one squishy missing, no screen hints at the trophy; collecting the last one unlocks it, Luna says her line, the milestone moon visits once, and it stays in the Trophy room after a reload.

### PRG-5 · Squishies instead of the sticker tin
Story · P1 · M · needs: —
- **Why:** the teacher wants the collectible to be squishies rather than emoji stickers (2026-10-09): squish balls, mochi animals, butter blocks and the like, with rare colours too. Today's tin is 18 emoji (`engine/stickers.ts`).
- **How:**
  - Replace the emoji with drawn squishies in the DES-2 style, generic shapes with no brand names or logos (round squish ball, mochi cat, bunny and bear, butter block, dumpling, peach, cloud, a little moon, and so on).
  - Each squishy comes in a usual colour from the palette. Some awards come in a **rare** colour (a soft tint) or a **super rare** one (swirl, shimmer, or glow). Proposal to confirm: 1 in 8 rare, 1 in 40 super rare. Odds live in one place.
  - The shelf shows each squishy once, with its rarest colour. Under it, a row of colour dots: a found colour is filled in, a usual colour still to find is grey, and a rare one still to find is a "?" (Alex, 2026-10-09).
  - Squishies not found yet: easier ones show as a greyed shape, harder ones as a "?" slot. Tapping either has Luna say a hint, never the answer to a round.
  - A new rare or super-rare squishy on the reward screen gets a shimmering, sparkling tag.
  - **Ways in to the shelf (Alex, 2026-10-09):** a Squishy Shelf card on the library (the last three found, on a little plank, with the count) and "See my shelf" on the lesson-done screen. The small header pill goes. (The home-screen bunny went with the "a little more" home screen, which the teacher passed on, 2026-10-10.)
  - **Keep the Trophy room's way in (DES-9b, 2026-10-12):** today the library's sticker tin has a "My trophies" kit button (`data-shot="open-trophies"`), the only way into the Trophy room. When the Squishy Shelf card replaces the tin, it keeps a way in, and `ui:shots` keeps finding it.
  - **Since DES-21 (2026-10-12):** the Sticker Tin is a card in the welcome row, in the Squishy Shelf's place (`pages/Hub/Hub.tsx`, `data-shot="hub-tin"`): "Sticker Tin", the count, the last three stickers on a plank, and "My trophies". The Squishy Shelf card takes that spot: squishies on the plank, the card leading to the shelf. The old 18-slot tin is gone, so until then a child sees only their last three stickers.
  - Tapping a squishy on the shelf squishes it and Luna says its line (pre-rendered). With reduced motion it gives a small press instead.
  - Old saves keep their count: each sticker id maps to a squishy, so no child loses anything. The saved field can stay `stickers`.
  - Lessons and games keep their signature reward (`SIGNATURE_STICKER` in `engine/lessons.ts`, `nextSticker` in `engine/stickers.ts`).
  - **Built from the kit (DES-7c):** `Squishy`, `SquishyDots` and the Chip's `rare`/`super-rare` tags with `shimmer`. The kit draws eight kinds in the seven palette colours that have outlines (oat, caramel, toffee, cream; blush, butter; honey). Still to add here: outline colours for cocoa, sage, sky and lilac (Alex OKs them on the Kit page), the super-rare swirl, more kinds (dumpling…), and the small press under reduced motion, where the kit's squish is simply off.
- **Blocked (2026-10-19): read against the code and the boards; waits for Alex on a split and four calls before it's built.** It's bigger than M, and a few of its choices are his (and the teacher's). Proposal, a recommendation each:
  1. **Split:** PRG-5a now, the collection, the shelf page (R2Squishies), the library's Squishy Shelf card (R2Library), the done screen, the odds and old saves, with the 8 kinds and 7 colours the kit draws today; PRG-5b later, the board's other 10 kinds, the 4 colours still without outlines (cocoa, sage, sky, lilac) and the super-rare swirl, as artwork for him and the teacher to OK first.
  2. **Colours per kind:** each kind comes in 3, like the board's 3 dots: its own usual colour, one rare tint and the super-rare one (honey, until 5b's swirl). 24 to collect at first.
  3. **The count:** kinds found out of all kinds ("5 of 8" now, "of 18" after 5b), as on the board's pill and the library card.
  4. **Old stickers:** each of the 18 becomes a squishy, the usual colours first, then rare ones, so a child's count doesn't drop. Odds as the ticket proposes: 1 in 8 rare, 1 in 40 super rare.
- **Complete when:**
  - no emoji appears on the shelf, the reward screen or the home screen;
  - finishing a lesson or game puts a squishy on the shelf;
  - over 1,000 seeded awards, rare and super-rare colours come up within 2 points of the set odds;
  - a save with old stickers loads with the same number of squishies;
  - every squishy's line has a clip, and `voice:audit` passes.

### PRG-9 · A game's done screen shows the squishy shelf
Story · P1 · S · needs: PRG-5
- **Why:** a lesson's done screen shows its lessons bar on the right, but a game's shows nothing there unless it gave a new sticker, so the right half is empty (Alex, 2026-10-18, from his shots of Feed Luna). He liked the squishy shelf for it.
- **How:** on a game's done screen, the right side shows the child's squishy shelf (PRG-5's), with the squishy just won picked out when there is one; a lesson keeps its bar above it. Until PRG-5 lands nothing changes here.
- **Complete when:** a game's done screen shows the shelf on the right at all four sizes, light and dark, with no empty half; a lesson's still shows its bar; checked in `ui:shots` and against the Done board.

### PRG-10 · Time counts toward stars
Story · P2 · S · needs: PRG-6
- **Why:** Alex (2026-10-19): on top of PRG-1's first-try rule, "maybe also we introduce some kind of timing", based on the time tags each lesson shows (PRG-6), and the Play Shelf's too, adjusted as plays come in.
- **How:** once PRG-6 shows an estimate on each lesson and game, let a play's time count toward its stars, in `engine/stars.ts` with the first-try rule. Proposal to confirm with Alex: time never costs a child a star they earned by reading well (slow, careful reading is the goal for ESL K–2), so it lifts instead: a play well inside its estimate can earn the next star up, or a 3-star play needs to finish within about twice the estimate. Use real averages once a few plays are saved, as PRG-6 does.
- **Complete when:** the rule Alex picks is in `engine/stars.ts`, a check plays fast and slow runs and gets the stars it says, and the done screen says what earned them in kid words.

### PRG-6 · Time per lesson: know it before, see it after
Story · P1 · M · needs: —
- **Why:** the teacher wants to know how long a lesson takes before starting, and to see how much time and progress a child took (2026-10-09).
- **How:**
  - **Before:** each lesson card on the hub shows an estimate, e.g. "about 5 min", with a small clock. It starts as rounds × a typical round time, then uses the real average once a few plays are saved.
  - **During:** time only counts while the app is open and on screen (paused when the tab is hidden or the iPad sleeps).
  - **After:** the lesson-done screen shows the time taken next to the estimate, and the lessons bar moving on (built by DES-22a, as on the Done board).
  - **The cards (from DES-13, 2026-10-12):** the library's LessonCards ship with no time, since nothing measured one (the kit's `minutes` is optional). This ticket passes them: "took N min" on a done lesson, "about N min" on the rest.
  - **On the hub:** a "Today" line: minutes read today and lessons done (e.g. "12 min today · 3 of 6 done"). The Library board shows it as a "Today" panel in the welcome row, between the Squishy Shelf card and Luna's Pick; since DES-21 the Sticker Tin card stretches over that space until this panel comes.
  - Saved per lesson: last time, best time and number of plays, in `utils/storage.ts`.
  - **The Play Shelf too (Alex, 2026-10-19):** each game's tile shows its estimate the same way ("about N min"), so PRG-10 can count time for games as well as lessons.
- **Complete when:**
  - every lesson card shows an estimate in minutes;
  - after a lesson, the done screen shows the minutes it took, and the hub's "Today" total goes up by the same amount;
  - hiding the tab for a minute mid-lesson doesn't add that minute;
  - the times survive a reload, and older saves load without errors.
- **Blocked (2026-10-19): built and checked; waits for Alex's OK on the look.** The shell times each play while the app is on screen (it pauses on `visibilitychange`); the save keeps each lesson's and game's last, best, total and plays (`times`) and today's minutes (`today`, the iPad's own day). `engine/times.ts` estimates "about N min": rounds × a typical round (60 s a lesson round, 40 s a game's, or a game's own `roundSeconds`: Story Corner 90, Muddled Cards 75, Treasure Path 60), then the average of its plays once there are 3. The library: "took N min" on a done lesson, "about N min" on the rest and, as Alex asked, on every game tile (kit Tile's new `minutes`, on its Kit page, with a `kit-check.mjs` line); a Today panel between the Sticker Tin and Luna's Pick ("0 min reading · 0 of 6 lessons done"; on a portrait iPad a slim row of its own). The done screen: "You took N minutes" beside "this lesson is about M min", as on the Done board; today adds the same rounded minutes, so they always agree. `time-check.mjs` (know-how) moves the page's clock and hides the tab: all its points pass; with the pause switched off the hidden minute counts, and on the commit before there are no times at all.

### PRG-8 · Pick up a lesson where you left off
Story · P1 · M · needs: —
- **Why:** split from DES-13 (Alex, 2026-10-12). The Library and Progress boards show a thin rounds bar on the up-next lesson once it's started ("One bar"), but nothing saves a lesson part-way: leaving it restarts it from round 1, so the bar would show progress the child then loses.
- **How:**
  - Save the rounds done in the lesson up next as each round is won (per lesson, in `utils/storage.ts`), and clear them when it's finished.
  - Opening that lesson again starts at the next round, not round 1. Lessons have fixed questions (`makeRounds` in `engine/lessons.ts`), so it starts that far into them. Games still start fresh.
  - The up-next LessonCard passes those rounds to the kit's `rounds` (its thin bar, from DES-7c).
  - "Play again" on a done lesson starts it from round 1.
  - Old saves load with nothing part-way.
- **Complete when:**
  - leaving a lesson after winning 2 rounds shows "2 of N" on its card's bar, and opening it again starts on round 3;
  - finishing it clears the bar and marks it done;
  - games and done lessons always start at round 1;
  - it survives a reload, and older saves load without errors.
- **Blocked (2026-10-19): built and checked; waits for Alex's OK.** The save keeps `partway` per lesson (rounds won and how many first time, so a resumed lesson can still earn 3 stars), set as each round of the lesson up next is won and cleared when it's finished. The shell's first start of that lesson picks up after them (`resume`, used once: "Again" and "Play again" start on round 1); the up-next LessonCard shows the kit's thin rounds bar. `partway-check.mjs` (know-how): leave after 2 rounds, the bar shows 2 and it reopens on round 3, after a reload too; finishing gives 3 stars and clears it; "Play again", the done lesson and a game start on round 1; an older save loads clean. On the commit before, leaving restarted the lesson. Stars, time and lesson-order checks still pass; lint; `ui:shots --diff` 0 (a fresh save has nothing part-way). Note for Alex: a lesson left part-way doesn't add its minutes to Today; PRG-6 saves time when a play finishes. Sheet: `screenshots/review/prg8-partway.png`.

