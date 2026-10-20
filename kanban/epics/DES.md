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


### DES-26 · Make the arch radius work at any size
Task · P2 · S · needs: —
- **Why:** `--radius-arch` is `999px 999px 22px 22px`. When the corners add up to more than the box, the browser shrinks all four in proportion, so the bottom corners come out about 2px, not the 22px `foundations.md` describes (the round 2 board's "?" cue has the same flaw). Found in DES-7b: ListenCue works round it with its own arch, built from its width.
- **OKed (Alex, 2026-10-19)** to start: kit only, no visible change expected.
- **How:** a primitive change, so Alex OKs it first (ladder step 4). Give the arch a form that keeps a half-circle top and card corners at any width: for example a `arch($width)` mixin beside `bp()`, or container units. Then ListenCue reads it again instead of its own `--cue-radius`.
- **Complete when:**
  - on the Kit page, an arch 192px wide and one 400px wide both show a half-circle top and 22px bottom corners, in light and dark;
  - ListenCue uses the shared arch, and its shots don't change;
  - `components/kit` is still at zero.
- **Where it stands (2026-10-19):** built; **Blocked: waits for Alex's OK** (review sheet `screenshots/review/des26-arch.png`). The arch is the `arch($width: 100cqi)` mixin beside `bp()` (with `arch-host` for the box it fills), and `--radius-arch` is gone. ListenCue passes its own width; the squishy shelf's cabinet (PRG-5a, the token's only user) reads its container's and now has the board's 22px bottom corners. `kit-check.mjs` hit-tests the Kit page's two arches (fails with the old 999px top). ListenCue's dangling `styles.ear` is OPS-13's.

### DES-27 · Our own pictures instead of emoji
Story · P2 · L · needs: — · split into batches before starting
- **Why:** Alex (2026-10-19): an emoji is drawn by each device's own font, so the app's pictures look like Apple's on the iPads, Google's on a Chromebook and Microsoft's on Windows, in different styles and sometimes colours (a "blue cap" story only matches Apple's 🧢). Apple's emoji can't be shipped to other devices (Apple's license; the repo is public). His call: "make our own emoji system that matches the look and feel of the current app", as Luna, the moon, the cookies and the squishies already are.
- **How:**
  - A kit `Picture` component: a picture by name (`<Picture name="cap" />`), drawn as an SVG in the illustration style (`_illustration.scss` colours, the `line` outline, soft and round like the squishies), in light and dark. Until a name is drawn it shows the emoji, so screens move over one picture at a time.
  - Every picture the app shows goes through it: the word bank, lessons' options, Treasure Path's passages, Story Corner's stories, the game tiles (about 200 emoji in `src` today, fewer once the same ones are counted once).
  - Batches, most-seen first: the word bank's 100 words (every game draws on them), then lessons, then passages and stories. Each batch is its own ticket, and Alex (and the teacher) OK a sample sheet before the batch is drawn.
  - The content checks learn the names: one picture per word (CNT-4's rule) and each story's picture matching it carry over.
  - Stopgap if wanted before then: bundle one free emoji set (Microsoft's Fluent Emoji, MIT, the softest style and closest to Apple's; or Google's Noto, OFL), trimmed to the pictures used, so every device matches. **Skipped (Alex, 2026-10-19).**
  - **Review first in an artifact (Alex, 2026-10-19):** before anything goes into the app, build each batch as a page he reviews: each picture as Apple's and Google's emoji, an arrow, and our drawing in the design system. Only OKed drawings go into the kit. Start with the word bank's 100 words, after the squishies (PRG-5a).
- **Where it stands (2026-10-19):** a first sample of 12 (cat, dog, frog, sun, moon, apple, cake, cup, tree, boat, igloo, mug) is up for Alex's review: <https://claude.ai/artifact/TaRumwLfd1KAkqgvSkJiJp>. Each row shows his device's emoji, Google's (Noto Color Emoji from Google Fonts), an arrow and ours, in light and dark. Three show why: today "cup" is a soda cup, "igloo" a hut (no emoji draws an igloo) and "mug" hot coffee. Source: `.claude/skills/luna-design/pictures/sample-1.html` (its drawings are inline SVG in the illustration colours), shots with `shoot.cjs` next to it. Waits for his notes on the style before the 100 are drawn.
- **Complete when:** no screen shows a system emoji; every picture is a kit `Picture` that looks the same on an iPad, a Chromebook and Windows (shots from Chrome and Safari match); the Kit page shows them all in light and dark; the teacher has OKed the look.
