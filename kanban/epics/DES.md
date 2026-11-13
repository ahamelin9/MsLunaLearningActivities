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


### DES-31 · Luna on the browser tab and the home screen
Story · P2 · S · needs: —
- **Why:** Alex (2026-11-12): the tab still shows Vite's default icon (`public/vite.svg`, named in `index.html` and `gate.html`); it should show the moon or the owl, so the app looks like itself in a tab and on an iPad's home screen.
- **How:** Luna's face from the kit's drawing (the owl in her round black frames), as `public/icon.svg` for the tab, with PNGs for an iPad's and a Chromebook's home screen (`apple-touch-icon` 180 px, and 192/512 px), in her illustration colours on the light ground so it reads on any wallpaper. Both pages point at it; the password Worker lets the icons through, as it does `vite.svg`. Last of the teacher's try-out tickets (Alex).
- **Complete when:** the tab shows Luna on the app and the password page; "Add to Home Screen" on an iPad shows her (the touch icon is served, 180×180); `vite.svg` is gone; build and lint pass; Alex OKs the look.
- **Blocked (2026-11-12):** built, waits for Alex's OK on the look (`screenshots/review/des31-luna-icon.png`). Her face, not the whole owl: the whole owl was too small to read at a tab's 16 px. A small `manifest.webmanifest` (`display: browser`, so nothing else changes) lists the 192 and 512 px icons for a Chromebook's shortcut. `icon-check.mjs` and the Worker's lines in `password-check.mjs` fail on the old files. A real iPad's "Add to Home Screen" is still to see once it's live.

### DES-28 · Works on a Chromebook
Story · P1 · M · needs: —
- **Why:** Alex (2026-11-08): the class will use iPads and Chromebooks, shared between children. Everything is built and checked for iPads: the layout checks run at four iPad sizes, and play is by touch. A Chromebook screen is wide and short (often 1366×768, so about 1366×650 for the page once the browser's bars are counted), shorter than any iPad, and most are driven by a trackpad. Its emoji are Google's too, and they stay: the teacher likes the emoji as they are (2026-11-12).
- **How:**
  - Alex names the Chromebooks (model or screen size, and whether they have touch).
  - Their page sizes join `layout-audit`, `fit-check` and `ui:shots`; whatever doesn't fit is fixed within the two breakpoints (DES-10) where possible.
  - Mouse and trackpad: every target works with a click, the grown-up gate's 1.5s hold works as a held click, nothing stays stuck in a hover look, and Luna's voice starts on the first click.
- **Complete when:** `layout-audit` and `fit-check` pass at the Chromebook sizes; `gate-check` passes with a mouse; a browser check with no touch plays each game and a lesson by clicks alone; Alex or the teacher has tried it on a real Chromebook.
