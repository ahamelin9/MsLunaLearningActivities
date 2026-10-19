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
| 6 | The library | DES-21 → **PRG-7 (pulled in)** → DES-13 (done 2026-10-12) | The library as on the board: lessons in order, one bar |
| 7 | Play | DES-22a (done 2026-10-12) → DES-22d (done 2026-10-13) → DES-11 (done 2026-10-17) → DES-22b, DES-22c → DES-23 (done 2026-10-18) | GameShell (start, stage, perch and the done screen), all 8 games and all 8 lesson types on the kit, with one right/wrong language |
| 8 | The design system is done | DES-24 (done 2026-10-18) | Legacy styles deleted; the check runs strict with no baseline |
| 9 | What's left of the epic | **SET-1 (pulled in, done 2026-10-18)** → DES-16, then DES-17, then DES-14 | Light/dark follows the iPad with a grown-up choice; the milestone moon; real cookies |

**Notes on the order:**
- **Why structure comes before tokens:** the design check's baseline (DES-19) is taken on the final tree, so moving files later doesn't upset it.
- **The two pulled-in tickets:**
  - PRG-7 (lessons open in order, Phase 7) was pulled into Stage 6 for DES-13, and both are done (2026-10-12).
  - SET-1 (the grown-up gate, Phase 3) was pulled into Stage 9 because DES-16's Settings choice lives behind it, and is done (2026-10-18).
- **DES-24 checks light and dark by forcing the theme** (on the Kit page and in the screenshots). DES-16 then lets the iPad and the grown-up switch it for real.
- **DES-17's full-shelf milestone moved to PRG-4,** so the moon doesn't wait on squishies (PRG-5, Phase 7).
- **DES-22d** (the done screen) was split from DES-22a before it started (Alex, 2026-10-12), and came before DES-11, whose petals fall on the done screen (both done).
- **DES-14** (P2) redraws Letter Cookies' cookies, whose folder DES-22b put on the kit, so it can slot in any time.
- **P0 bugs** can still be pulled in between tickets for a break from styling.


### DES-14 · Feed Luna's cookies look like real, different cookies
Story · P2 · S · needs: —
- **Blocked (2026-10-18): redone after Alex's review; waits for his OK on the look.** Alex didn't like the four kinds (sprinkles, jam, iced): every cookie stays chocolate chip, with its chips in different spots. Rebuilt that way: four chip layouts by `data-chips`, the chips a little bigger, kept near the rim and out of the middle low down (where a g, p, q or y hangs); no new colours (the six sprinkle/jam/icing ones are gone). Checked: `cookie-check.mjs` at all three grades, lint, shots (only Letter Cookies' plate changed). Review sheet: `screenshots/review/des14-cookies.png`.
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
Story · P1 · M · needs: —
- **Blocked (2026-10-18): waits for Alex's review.** Built and checked while he was away (`theme-check.mjs` 22 of 22, lint, shots, the layout audit at K); the review sheet is `screenshots/review/des16-light-and-dark.png`, and `screenshots/review/HANDOVER.md` has the rest. Left for Alex: his OK on the sun/moon button's shots (it isn't on the board) and every screen in dark on the real iPad. Then it closes out.
- **Why:** Alex wants a real dark mode (2026-10-09), and building the components on role tokens from the start keeps every screen working in both.
- **How:** the dark roles already exist (DES-3), and the contrast check runs in lint (DES-19). What's left:
  - **Follow the iPad's light/dark setting by default:** a `prefers-color-scheme: dark` block (`:root:not([data-theme="light"])`) outputs the dark roles. An inline script in `index.html` sets `data-theme` on `<html>` before the first paint, so there's no flash.
  - **A grown-up's choice:** Light, Dark or "Match the system" in Settings, behind the gate (SET-1). The choice is saved. ("the system", not "the iPad": it may be a Chromebook; Alex, 2026-10-18.)
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
- **Blocked (2026-10-18): waits for Alex's review.** Built and checked while he was away: every Complete when point passes (`moon-check.mjs`, with and without reduced motion; clips rendered, `voice:audit`; lint). Left for Alex: the moon's 9 lines, the two new shared animations (`--motion-glide-in`, `--motion-glide-out`), where she lands, and decisions.md's open question on the milestones. Review sheet: `screenshots/review/des17-milestone-moon.png`; `screenshots/review/HANDOVER.md` has the rest.
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
