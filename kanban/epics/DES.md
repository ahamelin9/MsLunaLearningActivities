# DES — Design system & layout (Phase 1)

**Goal:** the whole app looks and moves like one product, designed by hand
rather than generic AI-made. The home screen keeps its iPad feel, and the
reading app is boho, modern and animated (see DES-2). Today there are two looks:
- the tablet shell, Settings, Trophies and Grade Select use a generic slate and
  purple style (`src/styles/_variables.scss`) with an emoji owl;
- the reading app uses warm paper, wood and ink
  (`src/apps/reading/engine/_world.scss`) with the illustrated `LunaOwl`.

On top of that:
- 339 hex colours and 241 `rgba()` values are hard-coded across the stylesheets;
- 56 `@keyframes` are spread over 10 files, with no shared timings;
- reduced motion is honoured in only 4 files;
- every style is global, and `games.scss` (997 lines) holds all 8 games.

**How it's built (plan approved by Alex, 2026-10-10):** the written standards live in `docs/design-system/` (DES-2).
- **Tokens:** three token layers in `src/styles/tokens/`:
  - primitives: SCSS only;
  - roles: CSS custom properties, each colour role with a light and a dark value;
  - component tokens: at the top of each kit module.
  - Illustration colours sit in `_illustration.scss`. Raw values live only in these files.
- **Kit and styles:** a component kit in `src/components/kit/`, CSS modules, and one folder per page, game and lesson under `src/apps/<app>/`.
- **Checks:**
  - a design check and a contrast check in `npm run lint`, with a baseline that may only shrink;
  - hooks that bring in the standards before a UI edit and check the file after it (DES-25, DES-19);
  - a dev-only Kit page showing every token and component in both modes (DES-20).
- **Order:**
  1. structure first, as pure refactors proven identical by a pixel diff (DES-18a–e);
  2. then tokens, the checks, type and motion, and the kit;
  3. then each area restyled onto the kit and roles;
  4. DES-24 retires the legacy styles.

**The epic is done when:**
- every screen uses the shared tokens, components and motion, and looks right at the four target sizes (DES-10);
- the design check passes with no baseline, and contrast passes in both modes (DES-24).

## Order to finish the epic

Work top to bottom, one ticket at a time. Every ticket's `needs:` comes earlier
in the list. Tickets on the same line can go in either order. Two tickets from
other epics are pulled in because DES tickets need them; they're marked
**(pulled in)**. The board lists tickets by priority; this is the order to do
them in.

| # | Stage | Tickets | What you have at the end |
|---|---|---|---|
| 1 | Guardrails | DES-25 (done 2026-10-10) | Claude gets the right standards before any UI edit; people get a pre-commit check |
| 2 | Structure (pure refactors, nothing looks different) | DES-18a–e (done 2026-10-11) | Screenshots you can compare; one folder per page, game and lesson; CSS modules; `games.scss` gone |
| 3 | Foundations | DES-3 → DES-19 → DES-20 → DES-4 → DES-5 → DES-6 (done 2026-10-11) | Tokens in light and dark; lint enforces the rules after every edit; the Kit page; Andika and Fraunces offline; shared motion; reduced motion |
| 4 | The kit | DES-7a, DES-7b, DES-7c (done 2026-10-11) | Every kit component on the Kit page in every state |
| 5 | Frame and shell | DES-8, DES-10, DES-15 (done 2026-10-11), DES-9a, DES-9b, DES-9c, DES-12 (done 2026-10-12) | One header, the layout grid, the new Luna (moved here from Stage 4, Alex 2026-10-11), the restyled home, Settings, trophies and Grade Select; one Luna per screen |
| 6 | The library | DES-21 → **PRG-7 (pulled in)** → DES-13 | The library as on the board: lessons in order, one bar |
| 7 | Play | DES-22a → DES-11 → DES-22b, DES-22c → DES-23 | GameShell, all 8 games and all 8 lesson types on the kit, with one right/wrong language |
| 8 | The design system is done | DES-24 | Legacy styles deleted; the check runs strict with no baseline |
| 9 | What's left of the epic | **SET-1 (pulled in)** → DES-16, then DES-17, then DES-14 | Light/dark follows the iPad with a grown-up choice; the milestone moon; real cookies |

**Notes on the order:**
- **Why structure comes before tokens:** the design check's baseline (DES-19) is taken on the final tree, so moving files later doesn't upset it.
- **The two pulled-in tickets:**
  - PRG-7 (lessons open in order, Phase 7) has no needs of its own, and DES-13 can't finish without it.
  - SET-1 (the grown-up gate, Phase 3) needs DES-9b, and DES-16's Settings choice lives behind it.
  - If Alex would rather keep them in their phases, DES-13 and DES-16 wait for them, and the epic closes later.
- **DES-24 checks light and dark by forcing the theme** (on the Kit page and in the screenshots). DES-16 then lets the iPad and the grown-up switch it for real.
- **DES-17's full-shelf milestone moved to PRG-4,** so the moon doesn't wait on squishies (PRG-5, Phase 7).
- **DES-14** (P2) touches the same folder as DES-22b and can slot in straight after it.
- **P0 bugs** can still be pulled in between tickets for a break from styling.


### DES-11 · One right/wrong/reveal visual language
Story · P1 · S · needs: DES-22a
- **How:** use the same right glow, wrong wobble, win veil and "revealed" style (for FB-2) in every game and lesson, through `Choice` and the shell's flash. Game pieces that aren't Choices (bubbles, cookies, bugs, memory cards, word tiles) use the same state roles, `data-state` and motion. The games and lessons adopt it in DES-22b, DES-22c and DES-23.
  - **A win grows flowers (Alex, 2026-10-09):** a solved round grows a few flowers up the sides of the stage, and petals fall instead of confetti, as on the round 2 Round board. The lesson-done screen uses the same petals. Flowers and petals never cover the answer choices or block the next tap. **Kept for now (Alex, 2026-10-10):** the teacher dropped flowers for progress (DES-13), not for wins; change this only if she asks.
- **Complete when:**
  - the shell's flash, the win's flowers and petals, and Choice's states share one set of roles and motion;
  - the state roles for game pieces are documented in `components.md`;
  - every solved round grows flowers and drops petals;
  - no confetti is left anywhere (`utils/confetti.ts` deleted);
  - it's checked in light and dark. (That every game and lesson looks the same is checked in DES-22b, DES-22c and DES-23.)

### DES-13 · Lesson path on the hub: in order, one bar
Story · P1 · S · needs: PRG-7
- **Why:** the teacher found seeds to flowers too confusing and picked "One bar" from the round 2 Progress board (2026-10-10). Lessons now go in order (PRG-7), so each one only needs to say done, up next or locked.
- **How:** as on the round 2 Library, Round and Done boards:
  - **The bar:** one bar above the lessons, one segment per lesson, with "N of 6 lessons done". It fills as each lesson is done.
  - **Done:** a green check badge and "took N min" (PRG-6). It can be played again.
  - **Up next:** a glowing border, an "Up next" tag and "about N min". Once started, a thin bar shows how many of its rounds are done.
  - **Locked:** dashed and quieter, with a lock badge and "about N min". Tapping it wobbles it, and Luna says to finish the open lesson first (PRG-7).
  - **Inside a lesson:** the top bar shows the rounds as a bar, not seeds. Done in DES-8: the one header (`AppHeader`) shows every game's and lesson's rounds as the kit ProgressBar.
  - **Finishing a lesson:** the done screen shows a "Lesson done!" mark, the bar moving on, and "Lesson N is open now". Back on the hub, the next card unlocks with a short pop (DES-5; a plain swap with reduced motion).
  - No seeds, sprouts or flowers anywhere in progress. Wins keep theirs (DES-11).
- **Complete when:**
  - a new child sees an empty bar, Lesson 1 up next and the rest locked;
  - finishing Lesson 1 fills one segment, shows it done with its time, and opens Lesson 2;
  - a lesson left part-way shows its rounds bar;
  - the hub, the round's top bar and the done screen show no seeds or flowers;
  - the path is built from ProgressBar, LessonCard and roles only, its code shows zero in `design:status` (`pages/Hub` at zero, the `LessonPath` DES-21 left included), and it's checked in light and dark.

### DES-14 · Feed Luna's cookies look like real, different cookies
Story · P2 · S · needs: DES-22b
- **Why:** every cookie is the same flat brown circle, which doesn't read as a picture (Alex, 2026-10-09).
- **How:** a few cookie designs (chocolate chip, sprinkles, jam, and so on), mixed in each round, drawn in the DES-2 style, with their colours in `_illustration.scss`. The letter stays just as easy to read.
- **Complete when:** a round shows at least two different cookie designs, and every letter still meets the DES-2 type minimums.

### DES-26 · Make the arch radius work at any size
Task · P2 · S · needs: —
- **Why:** `--radius-arch` is `999px 999px 22px 22px`. When the corners add up to more than the box, the browser shrinks all four in proportion, so the bottom corners come out about 2px, not the 22px `foundations.md` describes (the round 2 board's "?" cue has the same flaw). Found in DES-7b: ListenCue works round it with its own arch, built from its width.
- **How:** a primitive change, so Alex OKs it first (ladder step 4). Give the arch a form that keeps a half-circle top and card corners at any width: for example a `arch($width)` mixin beside `bp()`, or container units. Then ListenCue reads it again instead of its own `--cue-radius`.
- **Complete when:**
  - on the Kit page, an arch 192px wide and one 400px wide both show a half-circle top and 22px bottom corners, in light and dark;
  - ListenCue uses the shared arch, and its shots don't change;
  - `components/kit` is still at zero.

### DES-16 · Light and dark mode
Story · P1 · M · needs: SET-1
- **Why:** Alex wants a real dark mode (2026-10-09), and building the components on role tokens from the start keeps every screen working in both.
- **How:** the dark roles already exist (DES-3), and the contrast check runs in lint (DES-19). What's left:
  - **Follow the iPad's light/dark setting by default:** a `prefers-color-scheme: dark` block (`:root:not([data-theme="light"])`) outputs the dark roles. An inline script in `index.html` sets `data-theme` on `<html>` before the first paint, so there's no flash.
  - **A grown-up's choice:** Light, Dark or "Match the iPad" in Settings, behind the gate (SET-1). The choice is saved.
  - **A sun/moon button on the home screen (Alex, 2026-10-12):** beside the gear in the status bar, a kit icon button a child can tap to turn day into night (the moon and stars) and back. It's saved like the Settings choice, which still works; the gear stays Settings. The Home board has no such button, so Alex OKs its shots. It comes only here: before every screen is on the roles, dark would show a dark header over light screens.
  - Every screen uses the roles only. Illustrations (Luna, squishies, flowers) keep their own colours from `_illustration.scss`.
  - At night the home screen shows a crescent moon in moon gold and twinkling stars instead of the sun (round 2 Home board), using the night scenery from `_illustration.scss`.
  - With reduced motion (DES-6) the stars don't twinkle.
- **Complete when:**
  - with the iPad set to dark, every screen shows the dark set, and switching back shows the light set without a reload;
  - the contrast check passes in both modes;
  - the home screen shows the moon and stars in dark mode and the sun in light mode;
  - the Settings choice overrides the iPad and survives a reload;
  - tapping the home screen's sun/moon button turns day into night and back, and the choice survives a reload;
  - every screen is checked in dark on the real iPad (Alex).

### DES-17 · The moon visits for big milestones
Story · P1 · M · needs: —
- **Why:** the teacher (2026-10-10): the second moon on the round 2 Ms. Luna board, a crescent with a face and black glasses, comes in every once in a while to say "good job" for big milestones. The owl stays Luna.
- **How:**
  - Draw that moon (round 2 Ms. Luna board, moon 6, marked "Milestone moon") as its own kit component, `src/components/kit/MilestoneMoon/`, in moon gold from `_illustration.scss`, the one colour outside the palette. She needs a happy and a cheer look, both shown on the Kit page. Her mouth moves only while her clip plays: she can follow `useSpeaking()` as Luna does (DES-15), and Luna gets `talking={false}` while the moon visits, or both would talk.
  - **Milestones (proposal; Alex left the choice to Claude, 2026-10-10):**
    - the first lesson a child ever finishes;
    - half of a grade's lessons done;
    - all of a grade's lessons done;
    - a full squishy shelf. PRG-4 wires this visit when the shelf exists (moved 2026-10-10, so this epic doesn't wait on PRG-5).

    Not after an ordinary lesson, so a visit stays special ("every once in a while"). At most one visit per done screen.
  - **The visit:** on the done screen she glides in from a top corner, says her line (pre-rendered, a few variants per milestone), and glides out. About 3 seconds, and it never blocks the next tap. With reduced motion she fades in and out.
  - The owl stays and watches while she talks (DES-12).
  - Milestones are checked with the achievements in `utils/storage.ts`, so each one fires once per child.
- **Complete when:**
  - the moon appears only during a milestone visit, and while she's there only she talks: Luna stays and watches, beak still (moved here from DES-12);
  - each lesson milestone above brings the moon exactly once, with her line playing;
  - an ordinary lesson never does;
  - with reduced motion she appears without gliding;
  - her clips are rendered and `voice:audit` passes;
  - the MilestoneMoon folder shows zero in `design:status`.

### DES-21 · Library on the kit: header, welcome row, Luna's Pick, Play Shelf
Story · P1 · M · needs: —
- **Why:** the round 2 Library board is approved, but no ticket covered the hub apart from its lesson path (DES-13).
- **How:**
  - As on the Library board:
    - the welcome row (Luna with her spoken greeting). **Spoken, not shown (Alex, 2026-10-09; moved here from DES-12):** where space is tight, as on the library, Luna's greeting is spoken with no always-on speech bubble. A small speaker mark shows she talks, and tapping her says it again;
    - Luna's Pick;
    - the Play Shelf: 8 kit Tiles with drawn pictures in place of today's scenery and emoji lanterns.
  - The Squishy Shelf card and the "Today" panel come with PRG-5 and PRG-6, built from the same kit.
  - The board's grade chip beside the title in the header was left out by DES-8, since the desk's grade sign still shows the grade. Decide here whether the chip replaces the sign (SET-1 moves changing the grade behind the gate). The header is `components/os/AppHeader`; ReadingApp fills its end.
  - The hub's own keyframes (`pages/Hub`) move onto the shared motion set.
  - **From DES-10 (Alex, 2026-10-11):** the Play Shelf sits on one even grid, every tile the same size (today Letter Jar and Treasure Path are double height, and Words Off the Page and Story Corner double width). No title sits on its picture (today Feed Luna, Muddled Cards, Words Off the Page, What's Missing and Story Corner do).
  - **Settled before building (Alex, 2026-10-12):**
    - **The lesson path is DES-13's, split by file:** today's lesson section moves unchanged into `pages/Hub/LessonPath.tsx` and its own module, with `SPINE_COLORS` and its old styles. `Hub.tsx` and `Hub.module.scss` go to zero; DES-13 rebuilds LessonPath.
    - **The Squishy Shelf's space:** a Sticker Tin card stands in, from the kit: "Sticker Tin", "N of 18 found", the last three stickers won on a little plank (tap one to hear its line), and "My trophies" (`open-trophies`). It stretches over the Today space until PRG-6; PRG-5 swaps the stickers for squishies there. The old 18-slot tin goes.
    - **Grade:** the grade sits beside the header's title, where the board has its chip, and the desk's grade sign goes (so does `badgeEmoji`). **It's a button (Alex, 2026-10-12):** the teacher takes different groups and swaps grades as the schedule needs, so tapping it opens Grade Select with the current grade picked. A kit ChunkyButton (48px, like Home), since the board's chip is too small to tap. Settings' Grade row still works too; whether either goes behind the gate is SET-1's call.
    - **Her greeting** is spoken when the library opens from the home screen, not straight after Grade Select (it would cut off "Let's start Kindergarten!") and not on coming back from a game. Tapping her says the same line again; her quirks on tap go.
    - **A mute beside her (Alex, 2026-10-12):** the board's speaker mark read as a mute button, so it is one: a kit icon button beside Luna (speaker when she talks, mute when she doesn't) that switches her voice off and on. It's the same setting as Settings' "Ms. Luna's voice", and muting stops her mid-line. Alex chose it knowing a child can then silence the games, whose targets are only spoken; SET-2 decides whether it's gated.
    - **Kit over board:** Luna's Pick is the accent ChunkyButton (64px, the dice, "she chooses, you play"); the pictures use the shared sway and float.
    - **Gone, as the board has none:** the lanterns, the desk books, the word-of-the-day nook (BUG-14 becomes Won't do), and the tiles' taglines, emoji and played stars. Tiles keep each game's own name (the board's "Letter Cookies" is GAME-6).
- **Complete when:**
  - the hub matches the Library board (lesson path aside; the Sticker Tin card in the Squishy Shelf's place until PRG-5 and PRG-6) at the four sizes, in light and dark;
  - the Play Shelf's tiles are all one size, and `layout-audit.mjs` (know-how) lists no "titles on their scenery" at any grade;
  - `pages/Hub` shows zero in `design:status` apart from `LessonPath`, DES-13's;
  - Luna's greeting plays when the library opens from home, not after Grade Select or a game, and tapping her plays it again;
  - tapping the header's grade opens Grade Select with that grade picked, and picking one returns to the library in that grade;
  - the button beside Luna mutes her (she stops mid-line, and taps stay silent) and unmutes her, and Settings' "Ms. Luna's voice" shows the same;
  - Alex OKs the shots.

### DES-22a · GameShell on the kit: start, stage, perch, reward
Story · P1 · M · needs: —
- **Why:** every game's start screen is the same centred card with a green that belongs to neither palette, and the reward screen predates the round 2 Done board.
- **How:**
  - **Start screen:** built from the kit. No board shows it, so Alex OKs it.
  - **Stage and perch:** as on the Round board. **From DES-12:** a game with its own Luna on the stage (`ownLuna`, Feed Luna) has a perch with no owl: the bubble alone, with no tail, tappable to hear it again. The kit SpeechBubble has tails left and bottom only, so it needs a no-tail form here.
  - **Reward screen:** follows the Done board. The squishy and the times come with PRG-5 and PRG-6.
  - The per-game stage backgrounds (`data-shape`) use roles and `_illustration.scss`.
- **Complete when:**
  - the start, stage, perch and reward screens use kit components and roles only;
  - `engine/GameShell` shows zero in `design:status`;
  - it's checked in light and dark, and Alex OKs it.

### DES-22b · Games on the kit, part 1: Letter Jar, Bubble Sounds, Letter Cookies, Muddled Cards
Story · P1 · M · needs: DES-11, DES-22a
- **How:**
  - Each game's answer buttons become `Choice`.
  - Its game pieces (bugs, bubbles, cookies, memory cards) stay in its folder but use the state roles, `data-state` and the shared motion (DES-11).
  - Its scenery uses roles and `_illustration.scss`, and Icon replaces emoji in the interface.
  - `engine/content.ts`'s colours go with these games.
  - **Touch targets (from DES-10):** every piece a child taps meets the target roles. On 2026-10-11, `layout-audit.mjs` found Letter Jar's smallest letters at 43–47px and its "Say it again" pill 39px tall; Bubble Sounds' overlapping bubbles are GAME-3's.
- **Complete when:**
  - in each of the 4 games, a right and a wrong answer look like they do everywhere else;
  - `.claude/skills/know-how/layout-audit.mjs` lists no "(stage)" line for these games at the four sizes and three grades, except Bubble Sounds' overlaps if GAME-3 isn't done;
  - the 4 game folders show zero in `design:status`;
  - they're checked in light and dark at the four sizes.

### DES-22c · Games on the kit, part 2: Words Off the Page, What's Missing?, Treasure Path, Story Corner
Story · P1 · M · needs: DES-11, DES-22a
- **How:** the same as DES-22b, for these 4 games. Treasure Path's stopgap passage view stays until GAME-1c designs its real screen. Its walker is the kit's Luna since DES-15 (36px, `talking={false}`); its hop is still the game's own keyframes.
  - **Touch targets (from DES-10):** on 2026-10-11, `layout-audit.mjs` found Words Off the Page's word tiles and empty slots 46px tall, the "🔊" prompt pills 39px tall (Hear the whole sentence, Read it to me) and Story Corner's "Next line" 38px.
- **Complete when:**
  - in each of the 4 games, a right and a wrong answer look like they do everywhere else;
  - `.claude/skills/know-how/layout-audit.mjs` lists no "(stage)" line for these games at the four sizes and three grades;
  - the 4 game folders show zero in `design:status`;
  - they're checked in light and dark at the four sizes.

### DES-23 · Lessons on the kit
Story · P1 · M · needs: DES-11
- **How:**
  - All 8 lesson types use Choice, ListenCue, SpeechBubble and PaperCard.
  - The shared `lessons/shared` module shrinks to layout only.
  - The lesson-specific wrong shake retires for the shared wobble.
  - **Touch targets (from DES-10):** on 2026-10-11, `layout-audit.mjs` found every lesson's "🔊" prompt pill 40–43px tall, and 2nd grade's Lesson 3 answers 43px tall (an answer needs 64).
- **Complete when:**
  - every answer button in every lesson type is a `Choice`;
  - `.claude/skills/know-how/layout-audit.mjs` lists no "(stage)" line for any lesson at the four sizes and three grades;
  - `lessons/` shows zero in `design:status`;
  - a right and a wrong answer look the same as in the games;
  - it's checked in light and dark.

### DES-24 · Retire the legacy styles
Task · P1 · S · needs: DES-21, DES-22b, DES-22c, DES-23
- **Why:** this is the finish line of the design-system effort (Alex's plan, 2026-10-10).
- **How:**
  - Delete `src/styles/_variables.scss`, `src/apps/reading/engine/_world.scss`, `src/index.css` (replaced by `styles/base/`), the legacy mixins (`glassmorphism`, `squircle-icon` and the like) and `scripts/design/baseline.json`.
  - Delete `components/ui/Icons`, once the restyles have moved every screen onto the kit's Icon (DES-7a). No ticket owns it before this one.
  - The design check then runs strict, with no baseline.
- **Complete when:**
  - `npm run lint` passes with no baseline: every colour, size, radius, border, shadow, duration and breakpoint in `src` comes from the token files;
  - every screen works in light and dark from roles alone, and the contrast check passes;
  - every button, card and answer choice is a kit component, and the Kit page shows them all in every state;
  - each page, game and lesson type has its own folder and styles;
  - someone new can open `docs/design-system/README.md`, find any token or component in under a minute, and follow written steps to add one or to handle something that doesn't fit (Alex tries it);
  - the `luna-design` skill tells Claude the same.
