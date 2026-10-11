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

Once DES-25 is built, a hook shows the right `## Rules` the first time a UI file
is edited in a session. Read the doc anyway when the job is bigger than one
edit.

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
4. `npm run lint` checks the build and contrast in both modes.
5. Add a line to `docs/design-system/decisions.md`, and the role to the table in
   `colour.md`.

### Add a kit component
Follow "Adding a component" in `components.md`:
1. Make the folder with `<Name>.tsx` (with its header comment),
   `.module.scss` (tokens first) and `.kit.tsx` (every state).
2. Export it from `kit/index.ts`.
3. Check it on the Kit page in light and dark, then run `npm run lint`.
4. Add it to the table in `components.md`.

### Build or restyle a screen
Follow `screens.md`:
1. `npm run ui:shots -- --label before`.
2. Build from the kit, with roles and the space scale only, in the screen's own
   folder.
3. `npm run design:status` should show the area at zero, and `npm run lint`
   should pass.
4. `npm run ui:shots -- --label after`. Compare it with the board (style sample,
   page "Round 2 · Teacher's picks") in light and dark.
5. Get Alex's OK, and update the area's row on the map.

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
  The backlog guard runs it before any ticket closes.
- `npm run design:status`: what's left per area.
- The Kit page, light and dark side by side (from DES-20).
- `npm run ui:shots` at the four iPad sizes, and `--diff` for refactors (from
  DES-18a).
- Dark mode: force it on the Kit page or in the shots. Until DES-16 the app
  itself stays light.

### When a hook speaks
- **Before an edit** (`design-guide.mjs`, DES-25): it shows the area's
  `## Rules`. Follow them in the edit you're about to make.
- **After an edit** (`design-check-file.mjs`, DES-19): it lists new violations
  with a fix hint. Fix them in the same turn. Don't raise the baseline or add an
  exception to get past them.

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
