# Ms. Luna — Backlog

Epics, stories, bugs and tasks for the Learning Pad, in the order we plan to do
them. Built from the full app review on 2026-10-08. The `/backlog` skill
(`.claude/skills/backlog/`) explains how Claude picks up, finishes and adds
tickets.

**Last updated:** 2026-10-09

## How to read this

| Field | Values |
|---|---|
| **ID** | `EPIC-n`, e.g. `DES-3`, `BUG-2`. IDs never change or get reused. |
| **Type** | Story (user-visible change) · Bug (something broken) · Task (behind the scenes) |
| **Priority** | **P0** must do · **P1** should do · **P2** nice to have |
| **Size** | **S** one sitting · **M** one or two sittings · **L** several sittings, split before starting |
| **Status** | Todo · In progress · Blocked — kept **only** in the board table below. A ticket is **deleted** (board row and its section) once it passes the Completion criteria, and recorded in the Changelog. |
| **Complete when** | Each ticket's own finish line: facts someone can check, not effort spent. |

### Completion criteria

A ticket is complete, and only then deleted, when **all three** hold.

**A. Its Complete when is met.** Every point under the ticket's **Complete
when** has been checked, with evidence: command output, the clip log, or
screenshots. Nothing is assumed.

**B. The general checks pass:**
1. `npm run build` and `npm run lint` are clean.
2. Anything that changes what Luna says: `npm run voice:render`, then `npm run voice:audit` passes.
3. Anything visual: before/after screenshots at iPad landscape and portrait (`npm run ui:shots -- --label before`, then `--label after`).
4. Targets stay heard, never shown, and hints stay spoken.
5. No on-device speech or extra runtime audio work (voice stays pre-rendered).
6. Nothing was built beyond the ticket; extra ideas became new tickets.

**C. Alex signs off where it matters.** Any point that needs judgement
(a design approval, anything marked "reviewed by Alex", how something looks
or sounds) has Alex's OK. Points that can be checked objectively don't wait
for sign-off.

**Then:**
- delete the board row and the ticket's section;
- remove its ID from other tickets' `needs:`;
- add one Changelog line.

If any point fails, the ticket stays `In progress`, or goes to `Blocked` with
the reason written on the ticket.

---

## Roadmap — when

| Phase | Focus | Epics | Why this order |
|---|---|---|---|
| **1 — now** | Design foundation | DES | Agreed as the next priority. Sets the look, layout and motion that every later screen change builds on. |
| 2 | Feedback & confirmed bugs | FB, BUG P0/P1 | The biggest correctness problems. FB-1 touches GameShell, so it lands after DES-8/DES-10 settle its layout. |
| 3 | Settings & grown-up area | SET | Keeps a child from breaking play (mute, reset, grade). |
| 4 | Difficulty & content model | LVL, CNT | One content source and an honest difficulty dial, before games and lessons grow. |
| 5 | Games to standard | GAME | Reworks built on FB and CNT. |
| 6 | Curriculum | CUR | More lessons, once content is generated from one bank. |
| 7 | Progress & rewards | PRG | Stars and badges that mean something. |
| 8 | Writing companion app | WRT | A new ESL app next to Reading, starting with punctuation. Built on the restyled shell, the shared feedback path and the difficulty table, so it starts at the standard the reading games reach in Phase 5. |
| anytime | Housekeeping | OPS, BUG P2 | Small and independent. Fill gaps between bigger work. |

The P0 bugs are small and don't depend on the design work, so any of them can
be pulled into Phase 1 for a break from styling.

### Now / Next

- **Now:** BUG-6
- **Next:** BUG-15, GAME-4, BUG-3, then DES-2 once the teacher has chosen

---

## Board

| ID | Title | Type | P | Size | Status |
|---|---|---|---|---|---|
| **DES** | **Design system & layout** | Epic | **P0** | | |
| DES-2 | Write the design standards | Story | P0 | M | Blocked |
| DES-3 | One set of design tokens | Story | P0 | M | Todo |
| DES-4 | Typography and local fonts | Story | P0 | S | Todo |
| DES-5 | Motion system | Story | P0 | M | Todo |
| DES-6 | Reduced motion, wired end to end | Story | P0 | S | Todo |
| DES-7 | Shared component kit | Story | P0 | M | Todo |
| DES-8 | One set of chrome | Story | P0 | M | Todo |
| DES-9 | Restyle the tablet shell: iPad feel, boho finish | Story | P0 | L | Todo |
| DES-10 | Layout grid and breakpoints | Story | P0 | M | Todo |
| DES-11 | One right/wrong/reveal visual language | Story | P1 | S | Todo |
| DES-12 | Luna on screen: one owl, clear moods | Story | P1 | S | Todo |
| DES-13 | Lesson path on the hub | Story | P1 | S | Todo |
| DES-14 | Feed Luna's cookies look like real, different cookies | Story | P2 | S | Todo |
| **FB** | **Shell feedback & hints** | Epic | **P0** | | |
| FB-1 | One answer-feedback path in GameShell | Story | P0 | M | Todo |
| FB-2 | "Show me" after repeated misses | Story | P0 | S | Todo |
| **BUG** | **Bugs** | | | | |
| BUG-1 | Game speech is cut off by Luna's reaction | Bug | P0 | — | Todo (via FB-1) |
| BUG-2 | Feed Luna: one wrong tap counts as two misses | Bug | P0 | S | Todo |
| BUG-3 | What's Missing can be solved by elimination | Bug | P0 | S | Todo |
| BUG-4 | Same-sound letters used as wrong answers (C/K) | Bug | P0 | S | Todo |
| BUG-6 | Treasure Path "Read it to me" reads the missing word | Bug | P1 | S | Todo |
| BUG-7 | Status-bar mute needs two taps to unmute | Bug | P1 | S | Todo |
| BUG-8 | Story lessons ignore the Beginner speed | Bug | P1 | S | Todo |
| BUG-15 | Games read the text before the child tries | Bug | P1 | S | Todo |
| BUG-9 | Story Corner K warm-up plays one story twice | Bug | P2 | S | Todo |
| BUG-10 | Settings may loop saving when the voice index fails | Bug | P2 | S | Todo |
| BUG-11 | Launch and close sounds play twice | Bug | P2 | S | Todo |
| BUG-12 | Day streak rolls over at 7 pm (UTC date) | Bug | P2 | S | Todo |
| BUG-13 | Trophy dot never clears | Bug | P2 | S | Todo |
| BUG-14 | "Word of the day" changes on every visit | Bug | P2 | S | Todo |
| **SET** | **Settings & grown-up area** | Epic | **P0** | | |
| SET-1 | Grown-up gate for settings | Story | P0 | M | Todo |
| SET-2 | A child can't silence Luna by accident | Story | P0 | S | Todo |
| SET-3 | Simplify the voice section | Story | P2 | S | Todo |
| SET-4 | Settings grade list uses `GRADES` | Task | P2 | S | Todo |
| **LVL** | **Difficulty** | Epic | **P0** | | |
| LVL-1 | Explicit grade × dial difficulty table | Story | P0 | S | Todo |
| LVL-2 | Remember the chosen difficulty per game | Story | P2 | S | Todo |
| LVL-3 | Adaptive difficulty from skill mastery | Story | P2 | L | Todo |
| **CNT** | **One content model** | Epic | **P1** | | |
| CNT-1 | Shared wrong-answer (distractor) rules | Story | P1 | M | Todo |
| CNT-2 | Lessons generated from the content bank | Story | P1 | L | Todo |
| CNT-3 | Content QA pass | Task | P1 | S | Todo |
| CNT-4 | Automated content checks in `voice:audit` | Task | P2 | S | Todo |
| **GAME** | **Games to standard** | Epic | **P1** | | |
| GAME-1 | Treasure Path: real comprehension | Story | P1 | M | Todo |
| GAME-2 | Story Corner: the child reads first | Story | P1 | M | Todo |
| GAME-3 | Bubble Sounds: smooth, fair bubbles | Story | P1 | S | Todo |
| GAME-4 | Muddled Cards: reading required at tier 2+ | Story | P2 | S | Todo |
| GAME-5 | Words Off the Page: bigger sentence pool | Story | P2 | S | Todo |
| **CUR** | **Curriculum** | Epic | **P1** | | |
| CUR-1 | Fix lesson/title/copy mismatches | Task | P1 | S | Todo |
| CUR-3 | Real sight words | Story | P1 | S | Todo |
| CUR-4 | Expand the curriculum per grade | Story | P1 | L | Todo |
| CUR-5 | Merge the two K blending lessons | Story | P2 | S | Todo |
| **PRG** | **Progress & rewards** | Epic | **P1** | | |
| PRG-1 | Stars reflect performance | Story | P1 | M | Todo |
| PRG-2 | Points: remove or give them a meaning | Story | P2 | S | Todo |
| PRG-3 | Achievements worked out in one place | Task | P2 | S | Todo |
| PRG-4 | Secret platinum trophy for a full sticker tin | Story | P2 | S | Todo |
| **WRT** | **Writing & grammar app** | Epic | **P1** | | |
| WRT-1 | Writing app on the home screen | Story | P1 | M | Todo |
| WRT-2 | Punctuation game: where does the mark go? | Story | P1 | L | Todo |
| **OPS** | **Housekeeping** | Epic | **P2** | | |
| OPS-1 | Delete dead code | Task | P2 | S | Todo |
| OPS-2 | README and stale copy | Task | P2 | S | Todo |
| OPS-3 | Decide the "Coming Soon" apps | Task | P2 | S | Todo |

---

## DES — Design system & layout (Phase 1)

**Goal:** the whole app looks and moves like one product, designed by hand
rather than generic AI-made. The home screen keeps its iPad feel, and the
reading app is boho, modern and animated (see DES-2). Today there are two looks:
- the tablet shell, Settings, Trophies and Grade Select use a generic slate and
  purple style (`src/styles/_variables.scss`) with an emoji owl;
- the reading app uses warm paper, wood and ink
  (`src/apps/reading/engine/_world.scss`) with the illustrated `LunaOwl`.

On top of that:
- about 270 colours are hard-coded across the stylesheets;
- 62 `@keyframes` are spread over 11 files, with no shared timings;
- reduced motion is honoured in only 4 files.

**The epic is done when** every screen uses the shared tokens, components and
motion, and looks right at the four target sizes (DES-10).

### DES-2 · Write the design standards
Story · P0 · M · needs: —
- **Why:** one written source of truth, so every later screen is built the same way.
- **How:** write `docs/design-standards.md` covering each item below. The values are proposals, to confirm with Alex.
  - **Direction (Alex, 2026-10-08):** a full redesign. Today it reads as a generic AI-made site, and it should stop: no glassy gradients, stock pills or emoji standing in for icons.
    - **Home screen:** keeps the iPad feel (status bar, springboard, app icon, home indicator), restyled in the same family as the reading app. The purple-gradient OS look retires.
    - **Reading app:** boho and modern, and animated. Proposal to confirm: a boho-classroom palette (terracotta, sage, mustard, clay pink, cream), arches and rainbows, paper texture and hand-drawn touches, with motion from DES-5.
    - **Built from shared components** (DES-7), so later screens are quicker to make and stay consistent.
    - **ESL first (Alex, 2026-10-08):** this is an ESL teacher's app and reading is the core. No school subjects; any later apps surround ESL reading.
    - **Four options** (A Boho Classroom, B Moonlit, C Groovy Garden, D Clear, which is iPad-native) share these rules and differ in mood. Ms. Luna's look (8 candidates, plus D's geometric owl) is a separate choice. The teacher decides, picking one option or combining them, and Alex passes the decision on. The doc then records it.
  - **Theme decision:** the `theme` setting (sunset/day/cosmic) is unused. Either drop it, or design a real day/night pair. Record the choice; DES-3 implements it.
  - **Colour:** semantic tokens (surface, ink, accent, success, retry, focus, disabled) mapped onto the world palette. Text meets WCAG AA (4.5:1).
  - **Type scale:** display font for titles. Text the child reads uses a literacy font (DES-4). Minimums: kid-read text 20px, answer words 32px, answer letters 48px.
  - **Touch targets:** answer choices at least 64×64px with at least 12px between them; chrome at least 48px. Nothing a child must hit sits within 16px of the screen edge.
  - **Spacing and radius:** a 4px-based scale; the paper-card radius and the chunky-button edge from `_world.scss`.
  - **Elevation:** three levels at most (flat, card, lifted).
  - **Motion:** links to DES-5.
  - **Copy voice:** kid-facing text is short and spoken by Luna. Grown-up text (objectives, settings) is plain and lives behind the gate (SET-1).
  - **Heard, never shown:** how a hidden target looks (the "?" cue), and what may appear only after a round is solved.
- **Progress (2026-10-08):**
  - **Done:**
    - Full audit of today's styles, written up as the appendix of `docs/design-standards.md`: 185 hex colours, 62 keyframes, 56 font sizes, six answer-button styles, two looks.
    - `docs/design-standards.md` drafted, covering every item above, with option A's values filled in.
    - Style sample canvas built: <https://claude.ai/artifact/Gr1ngbrVdGS6xE4pALyWsm>. Four options, each with a direction board, iPad home screen, library and a playable round, all animated. There's a component sheet for A and a "Who is Ms. Luna?" page with 8 characters; D adds a ninth, a geometric owl.
    - Every palette checked for WCAG AA contrast.
  - **Waiting on:** the teacher's choice of option (or mix) and character, passed on by Alex. **Blocked** on this since 2026-10-09.
  - **Then:**
    - Fold the choice into sections 3–9 of the doc.
    - Settle the theme setting (proposal: drop it).
    - Copy the decisions into DES-3 to DES-7.
    - Get Alex's sign-off.
- **Complete when:** the teacher's choice of option and character is recorded in `docs/design-standards.md`, Alex approves the doc, and the decisions are copied into DES-3 to DES-7.

### DES-3 · One set of design tokens
Story · P0 · M · needs: DES-2
- **How:**
  - Create `src/styles/_tokens.scss` with SCSS variables plus CSS custom properties on `:root`.
  - Fold in `_variables.scss` and `_world.scss`, then move every stylesheet onto the tokens.
  - Delete the unused palette, and implement the theme decision from DES-2.
- **Complete when:** searching for hex colours outside `_tokens.scss` finds only illustration art (LunaOwl, scenery), with a comment marking each exception.

### DES-4 · Typography and local fonts
Story · P0 · S · needs: DES-2
- **Why:**
  - Fredoka and Nunito load from Google Fonts. On an offline classroom tablet they fall back to system fonts.
  - In Fredoka, lowercase `l` and capital `I` are both a plain stroke, so the Letter Jar can be unfair.
- **How:**
  - Self-host the fonts under `public/fonts/` (woff2, `font-display: swap`).
  - Pick a literacy font for letters and words the child must read. Andika is built for beginning readers: distinct I/l/1 and a single-storey a/g.
  - Apply the type scale from DES-2.
- **Complete when:** the app shows the right fonts with the network off, and I/l are visibly different on letter tiles.

### DES-5 · Motion system
Story · P0 · M · needs: DES-2
- **How:**
  - Create `src/styles/_motion.scss` with timing tokens: tap 120ms, enter 240ms, emphasis 400ms, celebrate 700ms.
  - Add easing tokens (standard, springy, exit) and shared keyframes (pop-in, wobble, shake, float, bounce, glow).
  - Replace the 62 scattered `@keyframes` with these.
- **Rules to write into DES-2:**
  - Motion is for feedback, celebration and drawing attention.
  - Things the child is reading never move, except in Bubble Sounds, where movement is the game.
  - Ambient loops are slow (4s or more) and pause during play.
  - Celebrations finish within 1.5s and never block input for the next round.
  - Luna's talking animation follows the audio.
- **Complete when:** every animation uses the tokens, and no stylesheet defines a keyframe that `_motion.scss` already has.

### DES-6 · Reduced motion, wired end to end
Story · P0 · S · needs: DES-5
- **Why:** the `reducedMotion` setting is saved but never read. The device setting is ignored in `games.scss`, the confetti, and the home-screen glow bubbles.
- **How:**
  - Set `data-reduced-motion` on the app root from either the setting or `prefers-reduced-motion`.
  - Have `_motion.scss` drop transforms and loops under it, and skip confetti.
  - Bubble Sounds slows its bubbles down instead of stopping them.
  - Add the toggle to Settings, behind the gate from SET-1.
- **Complete when:** with the flag on, no screen has continuous motion and every game is still playable.

### DES-7 · Shared component kit
Story · P0 · M · needs: DES-3, DES-5
- **Why:** answer buttons are styled six separate ways: `lesson-choice`, `cookie`, `treasure-option`, `missing-choice`, `story-answer` and `word-tile`. `components/ui/Button` is in the old OS style.
- **How:**
  - Build `src/components/kit/` with these components:
    - `ChunkyButton` and `PaperCard`
    - `Chip` and `Tile`
    - `Modal` and `SpeechBubble`
    - `ListenCue` (the "?" placeholder)
    - `Choice`, with idle, pressed, wrong, right, revealed and disabled states
  - Games and lessons use these components, and keep only the visuals that are specific to them.
- **Complete when:** every answer button in every game and lesson is a `Choice`, and `components/ui/Button` is gone.

### DES-8 · One set of chrome
Story · P0 · M · needs: DES-7
- **Why:** inside the app there are two header bars, stars and mute shown twice, `VoiceIndicator` shown twice, and four ways home: the status pill, the Home button, the home-indicator bar, and "Library". Together these take about 130px of an 820px-tall screen.
- **How:**
  - Inside an app: one header with Home, the title, stars, and the settings gear (gated).
  - The status bar shrinks to the clock plus the voice indicator, or disappears.
  - Keep one way home plus "Library" inside games.
  - Fix BUG-11 while you're in there.
- **Complete when:** each control appears exactly once, and the game stage gets back at least 80px of height in landscape.

### DES-9 · Restyle the tablet shell: iPad feel, boho finish
Story · P0 · L · needs: DES-7, DES-8 · split before starting
- **Scope:**
  - Home screen
  - Status bar and header
  - Settings
  - Trophy room
  - Grade Select
- **How:** the home screen keeps its iPad feel (Alex, 2026-10-08) but drops the purple gradients for the DES-2 palette. It centres on Reading: no school-subject apps (OPS-3), with room for future ESL companion apps. Use kit components and tokens throughout. Replace the emoji owl `components/ui/Mascot` with `LunaOwl`. Grade Select talks to the child, not to grown-ups: no "digraphs" and no "dashboard".
- **Complete when:** the `ui:shots` screenshots show no slate or purple-gradient screens, and `Mascot` is deleted.

### DES-10 · Layout grid and breakpoints
Story · P0 · M · needs: DES-7
- **How:**
  - Lay out the hub and game stage for the four `ui:shots` sizes (1180×820, 820×1180, 1024×768, 744×1133).
  - Hub: the next lesson and Luna's Pick are visible without scrolling.
  - Play Rug: tiles sit on a consistent grid. Titles must not overlap their scenery (they do today on Feed Luna and Muddled Cards), and Treasure Path's tile must not be oversized.
  - Game stages fit the screen with no scrolling during play.
- **Complete when:** at all four sizes, nothing overlaps, nothing scrolls mid-round, and all touch targets meet DES-2.

### DES-11 · One right/wrong/reveal visual language
Story · P1 · S · needs: DES-5, DES-7
- **How:** use the same right glow, wrong wobble, win veil and "revealed" style (for FB-2) in every game and lesson, through `Choice` and the shell's flash.
- **Complete when:** a right answer and a wrong answer look the same in all 8 games and 8 lesson types.

### DES-12 · Luna on screen: one owl, clear moods
Story · P1 · S · needs: DES-9
- **Why:** Feed Luna shows two owls at once (the one on the stage and the one on the perch).
- **How:** at most one Luna per screen; the perch owl hides when the game's stage has its own. Document what each mood is for. Make sure the talking animation always follows the audio.
- **Complete when:** no screen shows two owls.

### DES-13 · Lesson path on the hub
Story · P1 · S · needs: DES-10
- **How:** show the lessons as a path. Done lessons get a tick, the next lesson glows with an "Up next" label, and later lessons stay open but quieter. Finishing a lesson moves the glow along.
- **Complete when:** a new child sees Lesson 1 marked "Up next", and it moves forward as lessons are finished.

### DES-14 · Feed Luna's cookies look like real, different cookies
Story · P2 · S · needs: DES-7
- **Why:** every cookie is the same flat brown circle, which doesn't read as a picture (Alex, 2026-10-09).
- **How:** a few cookie designs (chocolate chip, sprinkles, jam, and so on), mixed in each round, drawn in the DES-2 style. The letter stays just as easy to read.
- **Complete when:** a round shows at least two different cookie designs, and every letter still meets the DES-2 type minimums.

---

## FB — Shell feedback & hints (Phase 2)

### FB-1 · One answer-feedback path in GameShell
Story · P0 · M · needs: DES-8/DES-10 layout settled · fixes BUG-1
- **Why:** a game that speaks and then calls `api.win()` or `api.miss()` gets cut off, because the shell's speech interrupts it. This was confirmed in the browser for Letter Jar and Treasure Path. The same thing happens in Bubble Sounds, What's Missing, Story Corner, Words Off the Page and Feed Luna. Lessons avoid it only because `useAnswer` in `components/lessonHooks.ts` waits for the speech to finish.
- **How:**
  - Add `api.answer({ correct, say?: SpeechPart[], hint?, reveal? })` to `GameApi`. The shell says `say`, waits for it to end (with a watchdog timer), then reacts.
  - Move all 8 games over to it.
  - Make `useAnswer` a thin wrapper around it.
- **Complete when:** with clip logging on, every game's choice line plays in full before Luna reacts.

### FB-2 · "Show me" after repeated misses
Story · P0 · S · needs: FB-1, DES-11
- **Why:** `hintLevel` 2 exists but nothing uses it, and the `reveal` lines in `engine/luna.ts` are never said. A stuck kindergartner just hears the same hint on a loop.
- **How:** games pass a `reveal()` callback. On the third miss the shell calls it: the answer glows and Luna says a reveal line. The round can then be finished but isn't counted as clean.
- **Complete when:** every game and lesson reveals the answer on the third miss.

---

## Bugs

### BUG-1 · Game speech is cut off by Luna's reaction — confirmed
P0 · fixed by FB-1. Examples:
- Letter Jar: "That is G" never plays.
- Treasure Path and Words Off the Page: the sentence read-back after a right answer never plays.
- (Feed Luna's cheer was fixed on its own in BUG-19, 2026-10-09.)
- **Complete when:** with clip logging on, the Letter Jar wrong-tap line and the Treasure Path and Words Off the Page read-backs all play in full. Closes with FB-1.

### BUG-2 · Feed Luna: one wrong tap counts as two misses — confirmed
P0 · S
- **Cause:** a tap feeds the cookie on pointer-up (`games/FeedLuna.tsx:187`), and then the button's `onClick` feeds it again (`:238`).
- **Effect:** the hint plays after the first mistake.
- **Complete when:** one wrong tap counts as one miss, and drag, tap and keyboard each still work.

### BUG-3 · What's Missing can be solved by elimination
P0 · S
- **Cause:** the wrong choices are items still on the desk (`games/WhatsMissing.tsx:20`), so the answer is just "the one I can't see".
- **Fix:** take the wrong choices from words that were never on the desk.
- **Complete when:** none of the wrong choices is visible on the desk.

### BUG-4 · Same-sound letters used as wrong answers
P0 · S
- **Cause:** in Bubble Sounds and Feed Luna's sound rounds, K can be a "wrong" choice when the target is C. Both use the same audio file. W and WH have the same problem at tier 3.
- **Fix:** filter out wrong choices that share the target's sound, ideally using the same rule as CNT-1.
- **Complete when:** no round ever offers two letters with the same sound.

### BUG-6 · Treasure Path "Read it to me" reads the missing word
P1 · S (`games/TreasureRead.tsx:123`)
- **Fix:** before the round is solved, read the sentence with a hum in the gap, or lock the button until after a miss, the way Words Off the Page does.
- **Complete when:** before a round is solved, "Read it to me" never says the missing word; once it's solved, it reads the whole sentence.

### BUG-7 · Status-bar mute needs two taps to unmute
P1 · S
- **Cause:** the icon treats sound as "on" only when *both* sound and narration are on, but the toggle (`utils/storage.ts:111`) treats *either* as on.
- **Fix:** use one rule for both. It may be easier to drop the button once SET-2 lands.
- **Complete when:** from any mix of the two sound settings, one tap leaves the app in the state its icon shows.

### BUG-8 · Story lessons ignore the Beginner speed
P1 · S
- **Cause:** `components/StoryReader.tsx:29` and `:35` hard-code `rate: 0.9` and `0.85`, which always lands on Normal.
- **Fix:** remove the overrides, or scale them relative to the user's speed setting.
- **Complete when:** with Beginner selected, story lines and words play the slow clips (checked with clip logging).

### BUG-15 · Games read the text before the child tries
P1 · S · confirmed (code read, 2026-10-09)
- **Cause:**
  - Treasure Path true/false rounds open by reading the sentence and the claim aloud (`games/TreasureRead.tsx:58`), so the child listens instead of reading.
  - Story Corner reads each new line aloud as it appears (`games/StoryTime.tsx:62`), and any line on tap.
- **Fix:** it depends on the grade (Alex, 2026-10-09):
  - **Kindergarten:** a read-along. Every line is read aloud as it appears, line 1 included.
  - **1st and 2nd grade:** the lessons' rule (`useAnswer`'s `tried` in `components/lessonHooks.ts`). The text stays silent until the child has answered once, and a wrong answer unlocks the read-aloud. Single words can always be tapped.
  - This is taken out of GAME-1 and GAME-2, which keep the rest of their work.
- **Complete when:** in the browser, at Kindergarten every Story Corner line (line 1 included) is read as it appears; at 1st and 2nd grade, no Treasure Path or Story Corner round reads its sentence, claim or lines before the child's first answer, and the text can be heard after a wrong one.

### BUG-9 · Story Corner K warm-up plays one story twice
P2 · S
- **Cause:** tier 1 has only one story. Resolved properly by GAME-2.
- **Complete when:** no story repeats within one play of Story Corner, at any grade or difficulty.

### BUG-10 · Settings may loop saving when the voice index fails
P2 · S · likely, not yet reproduced
- **Cause:** if the voice index fails to load (for example offline), `components/os/VoicePicker.tsx:58` keeps re-saving settings on every render.
- **Fix:** run the correction once per open of Settings.
- **Verify:** reproduce it with the network off before fixing.
- **Complete when:** with the voice index blocked (offline), opening Settings saves at most once and the page stays responsive.

### BUG-11 · Launch and close sounds play twice
P2 · S
- **Cause:** `HomeScreen.tsx:19` and `App.tsx:43` both play the launch sound. `AppWindow` and `App` both play the close pop.
- **When:** fix as part of DES-8.
- **Complete when:** opening an app plays one sound, and closing it plays one sound.

### BUG-12 · Day streak rolls over at 7 pm
P2 · S
- **Cause:** `computeStreak` in `utils/storage.ts` uses the UTC date.
- **Fix:** use the local date.
- **Complete when:** playing at 8 pm and again at 9 am the next morning counts as two days in a row, and two sessions on the same local day count once.

### BUG-13 · Trophy dot never clears
P2 · S
- **Cause:** the dot shows whenever any achievement exists, not just new ones.
- **When:** fix in PRG-3.
- **Complete when:** the dot shows only for achievements not yet seen, and clears when the Trophy room opens.

### BUG-14 · "Word of the day" changes on every visit
P2 · S
- **Cause:** `pages/ReadingHub.tsx` picks a random word each time the hub mounts.
- **Fix:** seed the pick from the date.

---
- **Complete when:** the word stays the same on every visit within a local day and changes the next day.

## SET — Settings & grown-up area (Phase 3)

### SET-1 · Grown-up gate for settings
Story · P0 · M · needs: DES-9
- **Why:** a child can open Settings, change the grade, turn off narration, or reset all progress.
- **How:** add a press-and-hold gate (about 2s) or a simple grown-up question before Settings opens. Grade, narration, speed, reduced motion and reset all go behind it.
- **Complete when:** a child tapping around can't change any setting.

### SET-2 · A child can't silence Luna by accident
Story · P0 · S · needs: SET-1
- **Why:** targets are only spoken, so with narration off every activity shows "?" and can't be played. Today the status-bar mute turns off narration in one tap.
- **How:**
  - Kid-reachable controls only touch sound effects.
  - Narration lives behind the gate.
  - If narration is off, GameShell shows a "Luna is resting — ask a grown-up" banner. The banner never shows the target.
- **Complete when:** no single kid-reachable tap can make a game unplayable.

### SET-3 · Simplify the voice section
Story · P2 · S
- **Why:** only `af_heart` is rendered, so the picker shows one voice and one "American" button.
- **How:** hide the picker until two or more voices are rendered. Work out the accent from the voice and drop the `voiceLanguage` setting.
- **Complete when:** with one rendered voice, Settings shows no picker; `voiceLanguage` is gone, and older saves still load without errors.

### SET-4 · Settings grade list uses `GRADES`
Task · P2 · S
- **Why:** `SettingsModal.tsx` has its own copy of the grade list.
- **Fix:** read it from `data/readingCurriculum.ts`.

---
- **Complete when:** the Settings grade buttons come from `GRADES`, so a grade added there appears in Settings with no other change.

## LVL — Difficulty (Phase 4)

### LVL-1 · Explicit grade × dial difficulty table
Story · P0 · S
- **Why:** `tierFor` (`engine/content.ts:449`) rounds `(grade + dial) / 2`. That makes Kindergarten "Just right" use tier 2 (1st-grade content), and in every grade two of the three buttons give the same tier.
- **How:** replace the formula with a table. The proposal below is to confirm with Alex. Then make the button notes ("Short words, fewer choices") true.

  | | Warm up | Just right | Tricky |
  |---|---|---|---|
  | K | 1 | 1 | 2 |
  | 1st | 1 | 2 | 3 |
  | 2nd | 2 | 3 | 3 |

- **Complete when:** the table lives in one place, and Luna's Pick and Word of the day read from it too.

### LVL-2 · Remember the chosen difficulty per game
Story · P2 · S
- **How:** store the last difficulty chosen for each game and pre-select it on the start screen.
- **Complete when:** reopening a game pre-selects the last difficulty chosen for it, including after a page reload.

### LVL-3 · Adaptive difficulty from skill mastery
Story · P2 · L · needs: PRG-1
- **Why:** `skillMastery` is recorded but never read.
- **How:** track accuracy per skill, then nudge the starting tier up or down. If this doesn't happen, remove `skillMastery`.

---
- **Complete when:** the starting tier moves after a run of strong or weak results in a skill, never by more than one tier at a time. If dropped instead, `skillMastery` is deleted and the Changelog says why.

## CNT — One content model (Phase 4)

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

---
- **Complete when:** the audit fails on a deliberately planted bad item for each rule, and passes again once the item is removed.

## GAME — Games to standard (Phase 5)

Verdicts from the 2026-10-08 review:

| Verdict | Games |
|---|---|
| Good | Letter Jar, Words Off the Page |
| OK | Muddled Cards |
| Needs work | Bubble Sounds, Feed Luna |
| Below standard | Treasure Path, What's Missing, Story Corner |

### GAME-1 · Treasure Path: real comprehension
Story · P1 · M · needs: FB-1, CNT-1
- **How:** true/false claims paraphrase the sentence instead of copying it, so they can't be solved by matching text. Fold in BUG-6 and the ambiguous fill-in-the-blanks.
- **Complete when:** no round can be answered by matching strings or by tapping "Read it to me".

### GAME-2 · Story Corner: the child reads first
Story · P1 · M · needs: FB-1
- **How:**
  - At least 3 stories per tier.
  - Questions can't be answered by copying a line from the story.
  - Resolves BUG-9.
  - (Lines no longer reading themselves aloud moved to BUG-15.)
- **Complete when:** each tier has at least 3 stories, no answer is copied word for word from a line, and BUG-9 is closed.

### GAME-3 · Bubble Sounds: smooth, fair bubbles
Story · P1 · S · needs: DES-5, DES-6
- **Why:** bubbles move by a `setState` every 60ms, and they can overlap and hide the right bubble.
- **How:** move the bubbles with CSS transforms or `requestAnimationFrame`, add simple spacing so they don't overlap, and keep a target visible at all times.
- **Complete when:** bubbles move without a state update per frame, never overlap, and at least one target is always on screen.

### GAME-4 · Muddled Cards: reading required at tier 2+
Story · P2 · S
- **Why:** flipping a word card reads it aloud, so pairs can be matched by sound alone.
- **Fix:** read the word only after the pair is matched.
- **Complete when:** at tier 2+, flipping a word card makes no speech until its pair is matched.

### GAME-5 · Words Off the Page: bigger sentence pool
Story · P2 · S · needs: CNT-2
- **Why:** there are only 5–6 sentences per tier, so they repeat quickly.
- **Target:** at least 10 sentences per tier.

---
- **Complete when:** each tier has at least 10 sentences, all passing the CNT-4 checks, with their voice rendered.

## CUR — Curriculum (Phase 6)

### CUR-1 · Fix lesson/title/copy mismatches
Task · P1 · S
- "Rainbow, Cupcake & Starfish" has no starfish question.
- The 2nd-grade story lesson has 1 question but pays 5 stars.
- The grade cards promise 1st-grade decodable stories, "igh", and chapter stories, none of which exist yet.
- **Complete when:** every lesson title matches its questions, every grade card describes only lessons that exist, and the story lesson's stars follow the PRG-1 rule.

### CUR-3 · Real sight words
Story · P1 · S
- **Why:** "big" and "can" can be sounded out, so they aren't sight words. The skill description also promises "the" and "like", which aren't taught.
- **Fix:** teach the, see, like, I, a.
- **Complete when:** the sight-word lesson teaches the, see, like, I and a, with look-alike real words as wrong answers, and the skill description matches.

### CUR-4 · Expand the curriculum per grade
Story · P1 · L · needs: CNT-2 · split per grade before starting
- **Why:** today K has 6 lessons and 1st and 2nd grade have 3 each.
- **Target:**
  - K: more letter sounds and letter hunts.
  - 1st: ch/th/wh digraph lessons and decodable stories.
  - 2nd: "igh" and more vowel teams, plus multi-page stories.

---
- **Complete when:** each grade has every lesson from its split tickets, each passes the CNT-4 checks, and the grade cards describe them accurately.

### CUR-5 · Merge the two K blending lessons
Story · P2 · S
- **Why:** "Pet & Animal Words" and "Everyday Words (Sun, Bed, Cup)" play exactly the same way, three CVC words each (Alex, 2026-10-09).
- **How:** proposal to confirm with Alex: one blending lesson, or keep two but make the second a step up (for example four pictures, or no sound under each tile). Keep one existing lesson ID so a child's done tick survives.
- **Complete when:** the K hub shows no two lessons that play the same way, and a child who finished either old lesson still sees it done.

## PRG — Progress & rewards (Phase 7)

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

---
- **Complete when:** achievements are checked only in `utils/storage.ts`, `TrophyModal` only reads them, and BUG-13 is closed.

### PRG-4 · Secret platinum trophy for a full sticker tin
Story · P2 · S · needs: PRG-3
- **Why:** collecting every sticker should feel like a big moment (Alex, 2026-10-09).
- **How:**
  - A hidden achievement, checked with the others in `utils/storage.ts` (PRG-3), unlocks when every sticker in `engine/stickers.ts` is in the tin. It counts `STICKERS`, so adding a sticker later raises the bar.
  - Until then it appears nowhere: no locked slot, no silhouette, no "1 to go".
  - When it unlocks, Luna celebrates with a pre-rendered line, and the trophy shows in the Trophy room from then on.
- **Complete when:** with one sticker missing, no screen hints at the trophy; collecting the last one unlocks it, Luna says her line, and it stays in the Trophy room after a reload.

## WRT — Writing & grammar app (Phase 8)

**Goal:** a second ESL companion app next to Reading, for writing and grammar,
starting with punctuation (Alex, 2026-10-09). Proposal to confirm: it's a
separate app, not a Reading game, because placing marks is a writing skill.
The alternative is a punctuation game inside Reading, taught as fluency.

### WRT-1 · Writing app on the home screen
Story · P1 · M · needs: DES-9
- **Why:** a home for the punctuation game and later writing and grammar games.
- **How:**
  - Register a Writing app in `apps/registry.ts`, built from the DES kit and tokens.
  - It uses the child's grade and `GameShell` the same way Reading does.
  - Its only game for now is WRT-2.
- **Complete when:** the home screen shows Reading and Writing, Writing opens to a hub listing the punctuation game, and build and lint pass.

### WRT-2 · Punctuation game: where does the mark go?
Story · P1 · L · needs: WRT-1, FB-1, FB-2, LVL-1 · split per grade before starting
- **Why:** children need to learn where periods, commas and other marks go. For ESL learners, punctuation also changes how a sentence sounds (a stop, a pause, a question that rises), so it can be taught by ear.
- **How:**
  - A short sentence sits on a paper card with a mark missing. Luna reads it aloud with the right pause and tone. The child taps the gap, then picks the mark from a tray (or drags it in).
  - **Heard, never shown:** the right mark isn't shown in place until the round is solved. Hints are spoken ("Listen. Does my voice go up at the end?").
  - Staggered by tier (LVL-1), following the Common Core language standard for each grade:

    | Tier | Grade | Marks |
    |---|---|---|
    | 1 | K | End of a sentence: `.` or `?` |
    | 2 | 1st | `.` `?` `!`, commas in a list ("a cat, a dog and a pig") and in dates |
    | 3 | 2nd | Commas in a letter's greeting and closing ("Dear Sam,"), apostrophes in contractions (can't) and possessives (the dog's bone) |

  - Every sentence has exactly one right answer: no sentence where `.` and `!` both work, and no gap before "and" in a list (that comma is optional).
  - Render each sentence with `scripts/voice/`. Check by ear that questions rise and list commas pause, because the game depends on it, and drop any sentence the voice gets wrong.
- **Complete when:**
  - at each tier, a round shows a sentence with a mark missing, plays Luna's reading, and accepts only the right mark in the right gap;
  - each tier has at least 10 sentences, each with one right answer, with voice rendered and `voice:audit` passing;
  - the mark never appears in place before the round is solved, and the third miss reveals it (FB-2).

## OPS — Housekeeping (anytime)

### OPS-1 · Delete dead code
Task · P2 · S
- `src/App.css` (534 lines, never imported)
- `components/os/AppDock.tsx`
- `useUserProgress`
- `getAppById`
- `AppDefinition.component`
- `WindowState`
- Luna's unused `intro` lines, unless FB-2 uses them
- **Complete when:** every listed item is deleted, and build and lint stay clean.

### OPS-2 · README and stale copy
Task · P2 · S
- The README says ~0.8 MB of audio; it's 21 MB.
- Grade Select mentions a "dashboard" that doesn't exist.
- **Complete when:** the README's audio size and layout match the repo, and no screen mentions a dashboard.

### OPS-3 · Decide the "Coming Soon" apps
Task · P2 · S
- **Why:** Math, Science and Art are registered, but the home screen only shows Reading, so `ComingSoonApp` can't be reached.
- **Decided (Alex, 2026-10-08):** remove them. This is an ESL teacher's app and reading is the core. Other subjects will never be added. Later apps will only surround ESL reading (activities that support a child's English as a whole), so the home screen leaves room for those, not for school subjects.
- **How:** delete the Math, Science and Art entries from `apps/registry.ts`, `apps/preview/ComingSoonApp.*`, and the unused icons that only they use.
- **Complete when:** the registry holds only Reading, `ComingSoonApp` is gone, and build and lint pass.

---

## Changelog

Finished and dropped tickets are deleted from the board, and this log is the
only record of them. One line each: date, ID, title, and `Done` or
`Won't do: <reason>`. Never reuse an ID that appears here.

- **2026-10-08** — Backlog created from the full app review. Design (DES) set as the next priority.
- **2026-10-08** — DES-1 Screenshot harness for design review — Done
- **2026-10-08** — Added the `focus` skill and the agenda hook (`.claude/hooks/backlog-focus.mjs`, registered in `.claude/settings.json`). Each message now carries the current agenda, and off-agenda requests get a one-line priority check.
- **2026-10-08** — Added the Completion criteria. Every ticket now has a checkable **Complete when** (the 30 that had none got one), and finished tickets are deleted from the board instead of marked Done.
- **2026-10-08** — Added the backlog guard (`.claude/hooks/backlog-guard.mjs`), which refuses any edit to this file that breaks its rules and builds and lints before a ticket is deleted as Done. Added the `luna-board` mod for Alex: `/board` opens a board pane, the status line shows the current ticket, and a toast appears when a ticket is finished.
- **2026-10-09** — Added the WRT epic (Writing & grammar app, Phase 8) with WRT-1 and WRT-2, the punctuation game.
- **2026-10-09** — DES-2 blocked, waiting on the teacher's design choice. Alex moved the give-away fixes up to fill the gap: BUG-5 (widened to every lesson), then BUG-6, the new BUG-15, GAME-4 and BUG-3.
- **2026-10-09** — BUG-5 Lessons give the answer away — Done. No lesson says or shows its answer (45 give-aways found by a scan, now 0); a sentence, line or story reads aloud only after the first answer, while single words can be tapped any time (Alex's call). Also gave the story answers their missing clips and taught `voice:audit` to check them.
- **2026-10-09** — BUG-18 Some of Luna's game lines use the browser voice — Done. The inventory and the audit now both read `lunaLine` literals; "Found it!" and "We already tried those two!" have clips.
- **2026-10-09** — CUR-2 No phonetic symbols shown to children — Done. Blend tiles and read-and-match cards show letters only; the unused IPA labels are gone from the data. A sweep of all 12 lessons (60 screens) found no phonetic symbol.
- **2026-10-09** — BUG-16 Word of the day says the word twice — Done. A tap says "Today's word is" and the word once.
- **2026-10-09** — BUG-17 Feed Luna says "Mmm!" after every right cookie — Done. A right cookie is named ("big M") with no "Mmm!", and Luna's cheer "Mmm! Crunchy letter." is now "Crunchy letter. Delicious!".
- **2026-10-09** — BUG-19 Feed Luna: the cheer cuts in under the letter — Done. Luna names the cookie, then cheers; timed over 5 right answers, nothing overlaps or is cut off.
- **2026-10-09** — BUG-20 Story Corner never reads line 1 — Done. A story opens with its title and then line 1, at every grade.
- **2026-10-09** — Added the `know-how` skill (`.claude/skills/know-how/`): solved problems written as symptom, cause, fix and check, plus `speech-check.cjs`, a silent browser check that logs and times every clip. A new hook (`.claude/hooks/know-how-nudge.mjs`) reminds Claude to add to it whenever a ticket closes as Done.
- **2026-10-09** — Added the `app-updates` skill (`.claude/skills/app-updates/`): `/app-updates` writes the day's "App Updates" note for the teacher, in plain words and ready for Apple Notes, from that day's Changelog, new tickets and commits.
