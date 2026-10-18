---
name: luna-design
description: Ms. Luna's design system. Read it before any UI work (styles, SCSS, components, screens, games, lessons, colours, type, spacing, motion, light and dark, Luna, the milestone moon, squishies). It holds the hard rules and step-by-step recipes for using a colour or value, adding a kit component, building or restyling a screen, and handling something that doesn't fit, and it points into docs/design-system/, the written standards. Also the archive of the round 2 prototype the teacher approved.
---

# Ms. Luna design system

Read this before touching anything visual. The standards live in
`docs/design-system/`, one explanation for people and Claude alike. This skill
is how Claude works with them. Never copy values or rules from the docs into
here; link to them.

> **Status, 2026-10-10:** the teacher approved the round 2 look. The standards
> are written (DES-2), and the code is being built ticket by ticket in the DES
> epic. Check the status table in `docs/design-system/README.md` for what
> exists yet. If a piece isn't built yet (the tokens before DES-3, the kit before
> DES-7a), follow the ticket that builds it, and don't invent a stand-in.

## Start here

1. `docs/design-system/README.md`, the map: the layers, where every file lives,
   status per area.
2. The topic doc for the job. Each opens with `## Rules`:

   | Job | Doc |
   |---|---|
   | Choosing a colour, light/dark, an illustration | `colour.md` |
   | Type, space, corners, shadows, touch, motion, layout | `foundations.md` |
   | Using, building or changing a kit component | `components.md` |
   | Building or restyling a page, game or lesson | `screens.md` |
   | Something new, or something that doesn't fit | `fitting-in.md` |
   | Who decided what, and why | `decisions.md` |

3. The ticket's Why / How / Complete when (`kanban/epics/DES.md`).

A hook (DES-25) shows the right `## Rules` the first time a UI file in an area
is edited in a session (see "When a hook speaks"). Read the doc anyway when the
job is bigger than one edit.

## The hard rules

1. **Values live only in the token files** (`src/styles/tokens/`). No hex,
   `rgb()`, px, ms or easing typed anywhere else. Raw colours exist only in
   `_primitives.scss` and `_illustration.scss`.
2. **Roles, not colours.** Pick a role by its job (`var(--card)`), and every
   role has a light and a dark value. Illustrations use `--illo-*` through
   classes.
3. **Kit first.** Every button, card, chip and answer is a kit component, and
   answer buttons are always `Choice`. A pattern used twice belongs in the kit.
4. **Own folder, CSS modules, `data-state`.** Each page, game, lesson and kit
   component sits in its own folder with its `.module.scss`. States are
   attributes, never class names built from strings. `@keyframes` live only in
   `src/styles/motion/`.
5. **Doesn't fit? Use the ladder** in `fitting-in.md`: reuse, then a component
   token, then a role (Alex's OK), then a primitive (Alex's OK, and the
   teacher's if the look changes), then a marked exception. Never raise the
   baseline, and never leave a silent exception.

Plus the backlog's guardrails: heard, never shown; voice stays pre-rendered;
build only what the ticket asks.

## Recipes

### Use a colour, size or duration
1. Find the role or token by its job (`colour.md`, `foundations.md`). The Kit
   page shows them all (`npm run dev`, `/?kit`).
2. Write `var(--role)`. In a kit component, map it through a component token at
   the top of the module.
3. Nothing fits? Go to "Handle something that doesn't fit".

### Add a role or a primitive
1. Only after reuse and component tokens fail (`fitting-in.md`).
2. Ask Alex first, with the job it does and why no existing role fits. For a
   primitive that changes the look, Alex asks the teacher.
3. A role goes in `_roles.scss` with a light **and** a dark value, a comment
   saying its job, and its text pairs if it carries text.
4. `npm run lint` checks the build and contrast in both modes. After changing
   a value the round 2 boards use, run
   `node .claude/skills/luna-design/prototype/tokens-check.mjs "$PWD"` too: a
   gap means the token no longer matches what the teacher approved.
5. Add a line to `docs/design-system/decisions.md`, and the role to the table in
   `colour.md`.

### Add a kit component
Follow "Adding a component" in `components.md`:
1. Make the folder with `<Name>.tsx` (with its header comment),
   `.module.scss` (tokens first) and `.kit.tsx` (every state, laid out with
   `Specimens`/`Specimen` from `src/dev/KitPage/Specimen.tsx`; a pressed
   state is held with `data-state="pressed"`).
2. Export it from `kit/index.ts`.
3. Check it on the Kit page in light and dark, then run `npm run lint`.
   Add its behaviour (taps, motion, reduced motion) to
   `.claude/skills/know-how/kit-check.mjs`, and watch a check fail once.
4. Add it to the table in `components.md`.

A new state or variant on an existing component follows steps 3 and 4: a
specimen on its Kit page, a `kit-check.mjs` line that fails with the style off,
and its row in `components.md`. Check what a screen puts inside it (a slot, a
picture) in the new state too: DES-9c's picked Tile first turned its picture's
ink to the action ink, and the K on Grade Select all but vanished.

### Build or restyle a screen
Follow `screens.md`:
1. `npm run ui:shots -- --label before`.
2. Build from the kit, with roles and the space scale only, in the screen's own
   folder.
3. `npm run design:status` should show the area at zero, and `npm run lint`
   should pass. Then `node scripts/design/check.mjs --update` writes the lower
   baseline, so the area can't slip back.
4. `npm run ui:shots -- --label after`. Compare it with the board (style sample,
   page "Round 2 · Teacher's picks") in light and dark.
5. Get Alex's OK on a review sheet (before, after light, after dark, plus any
   state the shots don't reach, **plus the board's shot in light and dark
   beside ours** when there is one), made with
   `node .claude/skills/know-how/review-sheet.mjs <spec.json> screenshots/review/<ticket>-<screen>.png`.
   Send it with SendUserFile. In a cloud session without it, publish the
   sheet as a private Artifact and give Alex the link (`docs/cloud-sessions.md`).
   Then update the area's row on the map.

**Comparing with the board, at the start and the end** (Alex, 2026-10-12):
plan from the board before building, and show it beside ours at the end.
**The boards are in the repo as pictures** (OPS-10, 2026-10-13):
`prototype/shots/<Board>-light.png` and `-dark.png` for all eight (R2Look,
R2Home, R2Library, R2Progress, R2Round, R2Done, R2Squishies, R2Luna), so any
session, a cloud one included, can read them and list them in a review sheet.
The prototype is frozen, so they don't go stale. The Ms. Luna board's lower
row is cut off by its own nav bar; its picks are in the top part. To shoot a
board afresh (desktop app only): open the canvas in the built-in browser (it's signed in; a
headless puppeteer gets "Page not found", and the built boards in
`prototype/project/` need the canvas runtime, so they don't render alone), set
the tab to 1440×1000 with `resize_window`, wait about 8 s, then use the
board's own nav bar (its buttons sit on the row at y≈466 of the 800-wide
screenshot frame; "Dark" toggles the theme, and a board opens in light). A
`zoom` of the region (120, 58)–(681, 446) is the board alone, saved as a PNG
under the session's `tool-results/`: copy it to the scratchpad and list it in
the sheet's spec. Reset the viewport (`preset: "desktop"`) when done.

For a pure refactor, `npm run ui:shots -- --diff before after` must show 0
changed screens.

### Handle something that doesn't fit
1. Go down the ladder in `fitting-in.md` and stop at the first step that works.
2. Steps 3 to 5 wait for Alex's OK. Ask, with a one-line proposal.
3. An exception gets `design-exception(<ticket ID>): why` on or just above the
   line, and a line in `decisions.md` if it's permanent.
4. If the idea is bigger than the current ticket, log it as a new ticket instead
   of building it.

### Check your work
- `npm run lint`: eslint, the design check and the contrast check (from DES-19).
  The backlog guard runs it before any ticket closes. To read a failure, see
  "Reading a design check failure" in `docs/design-system/README.md`;
  `node scripts/design/check.mjs <file>` lists one file's raw values with hints.
- `npm run design:status`: what's left per area and folder.
- The Kit page, light and dark side by side: `npm run dev`, open `/?kit`
  (DES-20). `npm run ui:shots -- --kit --label <name>` saves both tabs in both
  modes. With Vite on 5199, `node .claude/skills/know-how/kit-sections.mjs
  <outDir> <Name>…` gives close-ups of components, and `kit-check.mjs` next
  to it checks the kit's behaviour in a browser (DES-7a–c).
- A ticket that should change no screen, with no "before" taken: shoot an
  unpacked HEAD and `--diff` (know-how, "Proving no screen changed when nobody
  took a before").
- `npm run ui:shots -- --reduced-motion`: the same run with Reduce Motion on;
  it fails if any screen keeps moving (DES-6).
- `npm run ui:shots` at the four iPad sizes, and `--diff` for refactors (from
  DES-18a).
- Does Luna's beak move only while a clip plays?
  `node .claude/skills/know-how/luna-talk-check.mjs 5199` (Vite on 5199;
  DES-15). Her moods and blink are in `kit-check.mjs`. Her library greeting,
  the header's grade button and her mute: `greeting-check.mjs` (DES-21).
  The game's perch (her line, a no-tail bubble, "Hear my clue") and the
  stage's flash: `perch-check.mjs` (DES-22a), which also checks a won
  round's garden and petals (DES-11). Review shots of a win:
  `win-shot.mjs` next to it.
- Does a screen fit? `node .claude/skills/know-how/layout-audit.mjs 5199 <grade 0|1|2>`
  (Vite on 5199): nothing scrolls or is cut off mid-round, and no tap target
  outside a game's stage is small, overlapping or in the edge band (DES-10).
  It also fails a screen with more than one owl, the kit's Luna or an owl
  emoji (DES-12), and covers Grade Select (DES-9c). Its "(stage)" lines are
  the games' and lessons' own pieces.
- `node .claude/skills/know-how/module-refs-check.mjs "$PWD" <folders>`: every
  `styles.x` points at a real class (a typo is silently `undefined`), and no
  `className="…"` string is left. For a refactor, the know-how entry "A move to
  CSS modules" has the rule-by-rule comparison too.
- Dark mode: force it on the Kit page, or in the shots with
  `npm run ui:shots -- --theme dark --label <name>-dark` (DES-8), and compare
  each label with `--diff` as usual. Until DES-16 the app itself stays light,
  and only what's on roles turns dark in those shots.

### When a hook speaks
- **Before an edit** (`design-guide.mjs`, DES-25): the first edit in an area
  each session is refused once, with the area's `## Rules` as the reason (plus
  the ladder for tokens, the Illustrations section for drawn things). Read
  them, then make the edit again, following them; it goes through. Later edits
  in the area get one reminder line. Areas: tokens (all of `src/styles/`
  except motion), motion, kit (and the legacy `components/ui/`), screens
  (everything else in `src`), and illustrations on top (`_illustration.scss`,
  `LunaOwl`, kit `Luna`, `MilestoneMoon`, `Squishy`). After changing the hook,
  a doc's headings or the folders, run
  `node .claude/skills/luna-design/guide-check.mjs "$PWD"`.
- **After an edit** (`design-check-file.mjs`, DES-19): it lists new violations
  with a fix hint. Fix them in the same turn. Don't raise the baseline or add an
  exception to get past them. It compares with the file's committed version,
  so a value only moved within the file doesn't count.

## Who decides, and where learnings go

- **The teacher** picks the look, Alex passes her feedback on and sets
  priorities, and Claude proposes and builds.
- **Design decisions** go in `docs/design-system/decisions.md`.
- **How-to steps for Claude** go here, in the recipes above.
- **Problems that took troubleshooting** go in the `know-how` skill.
- **Alex's and the teacher's preferences** go in memory.

The `wrap-up` skill has the full table.

## The approved prototype (archived)

The round 2 style sample is the frozen record of what the teacher approved on
2026-10-10:
- **Canvas:** <https://claude.ai/artifact/Gr1ngbrVdGS6xE4pALyWsm>, page "Round 2 ·
  Teacher's picks". Its boards are Look, Home, Library, Progress, Round, Done,
  Squishies and Ms. Luna. Round 1 (options A to D, 8 Lunas) stays on its own
  pages.
- **Source:** `prototype/` next to this file (`gen.py` plus `frag/*.frag`).
- **How to rebuild and publish it:** `prototype/README.md`.

Use it as the picture of the target when building a screen. Don't take values
from it once DES-3 has built the tokens: the token files are the source, and the
prototype's values were snapped to the scales in `decisions.md`. A future design
round for the teacher starts from the token files, not from `gen.py`'s copy.
