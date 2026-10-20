# PRG — Progress & rewards (Phase 7)

### PRG-2 · Points: remove or give them a meaning
Story · P2 · S
- **Why:** points are shown next to stars but mean nothing to a child.
- **Decided (Alex, 2026-10-19):** remove them. Stars carry the meaning since PRG-1.
- **How:** take points off every screen, out of the save (`totalPoints`, a game's and lesson's `points`) and out of any achievement that counts them ("Phonics Explorer" needs a new rule, or goes); an older save loads with its points simply ignored.
- **Complete when:** points are either gone from every screen and from storage, or every place they appear says what they mean in kid words.
- **Where it stands (2026-10-19):** built; **Blocked: waits for Alex's OK.** No screen showed points any more, so nothing on screen changes (0 of 27 shots). They're gone from the save (`totalPoints`; an older save's is dropped on load), from a lesson's definition, the shell's reward and both `record…Completion` calls. **His call:** "Phonics Explorer" counted 100 points; it now unlocks for finishing a lesson that sounds out words (a blend-and-read lesson), as its words already say ("Practiced sounding out words with Ms. Luna!"). A child who has it keeps it. `achievements-check.mjs` covers both (fails with the old rule and with old points kept).

### PRG-4 · Secret platinum trophy for a full squishy shelf
Story · P2 · S · needs: PRG-5a
- **Why:** collecting every squishy should feel like a big moment (Alex, 2026-10-09).
- **Decided (Alex, 2026-10-19):** rare colours aren't needed for the full set, and the top of the shelf keeps the board's shimmering "?" as a tease.
- **How:**
  - A hidden achievement, checked with the others in `utils/storage.ts` (`withEarned`, PRG-3), unlocks when every squishy kind (PRG-5a, more with PRG-5b) is on the shelf in at least one colour. It counts the whole set, so adding a squishy later raises the bar.
  - **The last squishy (Alex, 2026-10-09):** unlocking it also brings home one extra, one-of-a-kind squishy, "Pearl Moon", which sits at the top of the shelf's arch, where the "?" was.
  - Until then the trophy appears nowhere but the "?" at the top.
  - When it unlocks, Luna celebrates with a pre-rendered line, and the trophy shows in the Trophy room from then on.
  - **The milestone moon visits** (DES-17's last milestone, moved here 2026-10-10): the full shelf brings her once, through the done screen's visit (`engine/milestones.ts`), with her own pre-rendered line.
- **Complete when:** with one squishy missing, no screen hints at the trophy beyond the "?"; collecting the last one unlocks it, Luna says her line, the milestone moon visits once, and it stays in the Trophy room after a reload.
- **Where it stands (2026-10-19):** built except Pearl Moon; **Blocked: waits for Alex's OK.** "Squishy Champion" 🏆 is a hidden achievement (every kind on the shelf, in any colour); the Trophy room shows a secret badge only once won. The play that fills the shelf brings the moon first ("fullShelf", once: `moon-full-shelf`) and then Luna's "You found every squishy! There is a secret trophy waiting for you." (pre-rendered, with the moon's three new lines). An old save whose 18 stickers became a full shelf gets the trophy quietly on load, with no visit. `trophy-check.mjs` covers the Complete when (fails with it off); `moon-check.mjs` now starts from a full shelf so its own plays can't fill it. **Not built: Pearl Moon**, the one-of-a-kind squishy in the arch's "?" spot: new art in a new pearl colour, so it waits for a look Alex OKs in an artifact first (his rule for new squishy art) — with PRG-5b's looks, or on its own.

### PRG-5a · Squishies instead of the sticker tin: the shelf
Story · P1 · M · needs: —
- **Why:** the teacher wants the collectible to be squishies rather than emoji stickers (2026-10-09): squish balls, mochi animals, butter blocks and the like, with rare colours too. Today's tin is 18 emoji (`engine/stickers.ts`).
- **Decided (Alex, 2026-10-19), all four of the proposal:**
  1. This part now, with the 8 kinds and 7 colours the kit draws today; more kinds and colours are PRG-5b.
  2. Each kind comes in 3 colours, like the board's 3 dots: its own usual colour, one rare tint, and the super-rare one (honey, until PRG-5b's looks). 24 to collect at first.
  3. The count is kinds found ("5 of 8"; "of 18" after PRG-5b), on the shelf's pill and the library card.
  4. Old stickers become squishies, the usual colours first, then rare ones, so a child's count doesn't drop. Odds: 1 in 8 rare, 1 in 40 super rare, in one place.
- **How:**
  - **The shelf (R2Squishies board):** an arched cabinet with planks; each kind once, in its rarest colour found, its 3 colour dots under it (found filled, a usual one still to find grey, a rare one "?"); a kind not found yet is a greyed shape if easy and a "?" slot if hard; a new one wears the "New" tag; Luna beside it ("Tap a squishy to give it a squeeze!") with the colours legend; the count pill in the header. Tapping a found squishy squishes it and Luna says its line (pre-rendered); with reduced motion a small press. Tapping one not found has Luna say a hint, never the answer to a round.
  - **The library (R2Library):** the Squishy Shelf card replaces the Sticker Tin: the last three found on the plank, the count, and the card opens the shelf; the Trophy room keeps its way in ("My trophies", `data-shot="open-trophies"`).
  - **The done screen (R2Done):** "New squishy for your shelf" in the reward panel, the squishy drawn, its name, and a rare or super-rare tag that shimmers; "See my shelf" beside "Play again". The small header pill goes.
  - Lessons and games keep their signature reward (`SIGNATURE_STICKER` in `engine/lessons.ts`, a game's `sticker`), mapped to a kind.
  - **From the kit (DES-7c):** `Squishy`, `SquishyDots` and the Chip's `rare`/`super-rare` tags with `shimmer`.
- **Complete when:**
  - no emoji appears on the shelf, the reward screen or the home screen;
  - finishing a lesson or game puts a squishy on the shelf;
  - over 1,000 seeded awards, rare and super-rare colours come up within 2 points of the set odds;
  - a save with old stickers loads with the same number of squishies;
  - every squishy's line has a clip, and `voice:audit` passes.
- **Where it stands (2026-10-19):** built; **Blocked: waits for Alex's OK** (review sheet `screenshots/review/prg5a-squishies.png`). Data and rules in `engine/squishies.ts`; the shelf is `pages/Shelf`; the done screen shows "New squishy for your shelf" with a shimmering rarity tag and "See my shelf"; the library card shows the count, the latest squishies (as many as fit, newest first) and an arrow. A play that rolls a squishy already on the shelf brings nothing new. **His call:** the board's card had no room for "My trophies" (the squishies slid under it), so the Trophy room now opens from the header's stars, a button like the grade beside the title. Luna's finish line "Sticker time." became "I’m so proud of you." `stickers.ts` is unused, for Alex to `git rm`. Checks: `squishy-check.mjs`, `shelf-check.mjs` (fails on the commit before), `hub-card-shot.mjs`.

### PRG-5b · More squishies: kinds, colours and super-rare looks
Story · P2 · M · needs: PRG-5a
- **Why:** the Squishies board shows 18 kinds; the kit draws 8 (ball, cat, bunny, bear, butter, peach, cloud, moon). Four palette colours have no outlines yet (cocoa, sage, sky, lilac), and the super-rare looks (swirl, shimmer, glow) aren't drawn.
- **How:**
  - Draw the other 10 kinds in the kit's style, generic shapes with no brand names (dumpling, frog, donut, mushroom, heart and the rest of the board's), and the 4 outlines.
  - The super-rare looks: swirl, shimmer and glow. **Alex (2026-10-19): a select few kinds also get a super-rare animated version** (a gentle loop; still under reduced motion).
  - First a sample sheet for Alex and the teacher (an artifact, as DES-27 does), then the kit.
- **Complete when:** the shelf holds the board's 18 kinds; every colour has its outline; the super-rare looks, animated ones included, are on the Kit page in light and dark (still under reduced motion); the teacher has OKed the look.

### PRG-9 · A game's done screen shows the squishy shelf
Story · P1 · S · needs: PRG-5a
- **Why:** a lesson's done screen shows its lessons bar on the right, but a game's shows nothing there unless it gave a new sticker, so the right half is empty (Alex, 2026-10-18, from his shots of Feed Luna). He liked the squishy shelf for it.
- **How:** on a game's done screen, the right side shows the child's squishy shelf (PRG-5a's), with the squishy just won picked out when there is one; a lesson keeps its bar above it.
- **Complete when:** a game's done screen shows the shelf on the right at all four sizes, light and dark, with no empty half; a lesson's still shows its bar; checked in `ui:shots` and against the Done board.
- **Where it stands (2026-10-19):** built on PRG-5a; **Blocked: waits for Alex's OK** (review sheet `screenshots/review/prg9-game-done-shelf.png`). The shelf's planks are now one shared piece (`engine/ShelfRows`, the shelf page unchanged: 0 changed shots). A game's done screen shows "Your squishy shelf · N of 8" under the reward, the planks small, the one just won wearing "New"; tapping one says its line or clue. On a portrait iPad the two planks sit side by side so the buttons still fit. A lesson's done screen keeps its bar and no shelf (the "above it" reading of the How would not fit a lesson at 1024 × 768). `ui:shots` doesn't reach a game's done screen, so `game-done-shot.mjs` shoots it at all four sizes and fails if anything runs off screen; `shelf-check.mjs` has the PRG-9 lines (fails with the shelf off).

### PRG-10 · Time counts toward stars
Story · P2 · S · needs: —
- **Why:** Alex (2026-10-19): on top of PRG-1's first-try rule, "maybe also we introduce some kind of timing", based on the time each lesson and game shows (PRG-6).
- **Decided (Alex, 2026-10-19):** time mostly lifts, but "if someone takes a crazy amount of time maybe they should get a star taken". Proposal for the numbers (his OK in the review sheet): a play inside its "about N min" lifts 2 stars to 3; a play over 3 times its estimate loses one star, never below 1; anything between changes nothing. The estimate is the average of real plays once there are 3 (PRG-6), so it fits each class.
- **How:** in `engine/stars.ts` beside the first-try rule; the done screen says why in kid words ("Quick and careful: a star!").
- **Complete when:** the rule is in `engine/stars.ts`, a check plays fast, normal and very slow runs and gets the stars it says, and the done screen says what earned them in kid words.
- **Where it stands (2026-10-19):** built with the proposed numbers; **Blocked: waits for Alex's OK** on them and the words (review sheet `screenshots/review/prg10-time-stars.png`). `starsWithTime` and `TIME_RULE` sit beside the first-try rule; the shell applies it to the whole time (with PRG-11's carried time). The done screen says it under the stars as a chip: "Quick and careful: a star!" or "A very long time: one star less" (on screen only, not spoken). `star-time-check.mjs`: the rule at 7 edges, then Lesson 1 fast, normal and very slow with one miss each (3, 2 and 1 stars); fails with the rule off. No other screen changes.

### PRG-11 · A lesson left part-way still counts its minutes
Story · P2 · S · needs: —
- **Why:** found in PRG-8 (2026-10-19): a lesson left part-way picks up where it was, but its minutes don't reach Today, because PRG-6 saves time when a play finishes. Proposed to Alex as a small follow-up.
- **How:** when a lesson is left part-way (the header's Library), save the time so far into Today and keep it with the part-way rounds, so the finished lesson's "took N min" is the whole time.
- **Complete when:** leaving a lesson after a timed minute raises Today by 1; finishing it later shows the whole time on the done screen and the card; a check proves both (`time-check.mjs`).
- **Where it stands (2026-10-19):** built; **Blocked: waits for Alex's OK.** Leaving a lesson mid-play by the header's Library adds its minutes so far to Today (`storageService.leaveLesson`); the lesson up next, once a round is won, keeps its seconds and the minutes already counted with its rounds (`PartWay.seconds`, `.counted`), so the finished lesson's "took N min" is the whole time and Today gets the rest, never a minute twice. A lesson already done, replayed and left, still adds its minutes. No screen changes. `time-check.mjs` has four new lines (all fail with the fix off). Not covered, as the ticket is lessons only: a game left mid-play still adds nothing to Today; and "Again" mid-play starts the clock over without counting the minutes before it (as since PRG-6).
