# Ms. Luna design system

Start here for anything visual in Ms. Luna: how it looks and why, where every
value lives, and how to add or change something. It's written for people and
for Claude alike. The `luna-design` skill points Claude here before any UI
work, and a hook brings in the right section whenever a UI file is edited.

**Status (2026-10-10):** the teacher approved the look (the round 2 style
sample), and Alex approved these standards. The code is being built ticket by
ticket in the DES epic. The order to finish it is at the top of
`kanban/epics/DES.md`, and the table at the bottom of this page shows where each
area stands. Until an area is built, its old styles still run.

## In one minute

- **Every value has one home.** Every colour, size, radius, border, shadow,
  duration and breakpoint lives in `src/styles/tokens/`. No other file types a raw
  value.
- **Screens use roles, never colours.** A role is named for its job (card, ink,
  action, right, try again…), and each one has a light and a dark value. That's how
  dark mode comes for free.
- **Screens are built from the kit.** The kit lives in `src/components/kit/`:
  ChunkyButton, PaperCard, Choice… To restyle the app, change the kit, not every
  screen.
- **Every page, game and lesson has its own folder**, with its own styles (CSS
  modules), so nothing collides.
- **Machines check all of this.** `npm run lint` runs the design check and the
  contrast check, and Claude's hooks check each UI file as it's edited.

## The layers

```
LAYER 1 · PRIMITIVES                          src/styles/tokens/_primitives.scss
  the raw palette, the 4px space scale, radii, borders, type sizes,
  durations, easings, z-index, breakpoints, touch-target minimums
  SCSS only: only token files can read them (the space scale is also published)
          │
          ▼
LAYER 2 · ROLES                               src/styles/tokens/_roles.scss
  colour roles, each with a light and a dark value:
    ground, card, edge, well, soil, ink, ink-soft, accent, action,
    pressed, right, try again, rare, super rare, focus, grain…
  plus elevation, radius, type, motion, z-index and target roles
  CSS custom properties, so light/dark and reduced motion can swap them
          │                                   ┌───────────────────────────────────┐
          │                                   │ ILLUSTRATION PALETTE              │
          │                                   │ src/styles/tokens/_illustration   │
          │                                   │ Luna, the moon, squishies,        │
          │                                   │ cookies, roses, home scenery      │
          │                                   └───────────────────────────────────┘
          ▼
LAYER 3 · COMPONENT TOKENS                    top of each kit module
  --button-bg: var(--action)    --choice-edge: var(--edge)
  a component's restyle knobs; its variants swap only these
          │
          ▼
THE KIT  src/components/kit/  ──►  PAGES · GAMES · LESSONS · THE TABLET SHELL
                                   (they read roles, the space scale and the kit)
```

Raw colours may appear in two files only: `_primitives.scss` and
`_illustration.scss`.

## Where things live

| What | Where | Built by |
|---|---|---|
| Primitives (raw palette, scales) | `src/styles/tokens/_primitives.scss` | DES-3 |
| Roles, light and dark | `src/styles/tokens/_roles.scss` | DES-3 |
| Illustration palette | `src/styles/tokens/_illustration.scss` | DES-3 |
| Type roles and fonts | the tokens, `src/styles/base/_fonts.scss`, `public/fonts/` | DES-4 |
| Motion roles and keyframes | `src/styles/motion/` | DES-5 |
| Mixins (breakpoints, press, focus ring) | `src/styles/_mixins.scss`, the one partial a module may `@use` | DES-3 |
| The one global stylesheet | `src/styles/global.scss`, imported by `main.tsx` | DES-3 |
| Kit components | `src/components/kit/<Name>/`, listed in `kit/index.ts` | DES-7a–c, DES-15, DES-17 |
| The tablet shell (home, status bar, Settings, trophies) | `src/components/os/<Name>/` | DES-18b |
| Reading app screens | `src/apps/reading/{pages,engine,games,lessons}/<Name>/` | DES-18c–e |
| Kit page (every token and component, light and dark) | `src/dev/KitPage/`: run `npm run dev`, open `/?kit` | DES-20 |
| Design check | `scripts/design/check.mjs`, run by `npm run lint` and `npm run design:status` | DES-19 |
| Contrast check | `scripts/design/contrast.mjs`, run by `npm run lint` | DES-19 |
| Hooks for Claude's edits | `.claude/hooks/design-guide.mjs` (before), `design-check-file.mjs` (after) | DES-25, DES-19 |
| Pre-commit check for people | `.githooks/pre-commit`; turn it on once with `git config core.hooksPath .githooks` | DES-25 |
| Screenshots and the pixel diff | `scripts/ui/shots.mjs`, run by `npm run ui:shots` | DES-1, DES-18a |
| The approved design (frozen) | the [style sample](https://claude.ai/artifact/Gr1ngbrVdGS6xE4pALyWsm), page "Round 2 · Teacher's picks"; source in `.claude/skills/luna-design/prototype/` | frozen 2026-10-10 |
| Legacy styles (going away) | `src/styles/_variables.scss`, `src/apps/reading/engine/_world.scss`, `src/index.css` | DES-24 deletes them |

## The docs

| Doc | Read it when you're… |
|---|---|
| [principles.md](principles.md) | new here: why Ms. Luna looks the way it does |
| [colour.md](colour.md) | choosing a colour, adding a role, working on light/dark or an illustration |
| [foundations.md](foundations.md) | setting type, space, corners, shadows, motion, touch targets or layout |
| [components.md](components.md) | using, building or changing a kit component |
| [screens.md](screens.md) | building or restyling a page, game or lesson |
| [fitting-in.md](fitting-in.md) | adding something new, or something doesn't fit the standards |
| [decisions.md](decisions.md) | asking "who decided this, and why?" |
| [audit-2026-10-08.md](audit-2026-10-08.md) | curious about the styles before the redesign |

Each topic doc opens with `## Rules`: the short version, which is also what
the hook shows Claude before an edit.

## How to…

- **Use a colour:** pick the role by its job ([colour.md](colour.md)) and write
  `color: var(--ink)`. Never a hex.
- **Use a size, a corner, a shadow or a duration:** use its token
  ([foundations.md](foundations.md)).
- **Add or change a value:** go down the ladder in [fitting-in.md](fitting-in.md):
  reuse, then a component token, then a role, then a primitive.
- **Add a kit component:** follow "Adding a component" in [components.md](components.md).
- **Build or restyle a screen:** follow the steps in [screens.md](screens.md).
- **Handle something that doesn't fit:** see [fitting-in.md](fitting-in.md).
- **See everything:** run `npm run dev` and open `/?kit` (DES-20).
- **Check your work:** `npm run lint` runs eslint, the design check and the
  contrast check. `npm run design:status` shows what's left per area (DES-19).
- **Prove a refactor looks the same:** run `npm run ui:shots -- --label before`,
  change the code, run `--label after`, then `npm run ui:shots -- --diff before after`
  (DES-18a).

## Status per area

Each ticket updates its row when it closes (Completion criteria B7 in
`kanban/README.md`).

| Area | Where | Status | Tickets |
|---|---|---|---|
| Standards (these docs, the skill) | `docs/design-system/`, `luna-design` | Done (Alex approved, 2026-10-10) | DES-2 |
| Hooks at the moment of editing | `.claude/hooks/`, `.githooks/` | Planned | DES-25 |
| Screenshots you can compare | `scripts/ui/shots.mjs` | Planned | DES-18a |
| Source tree and CSS modules | `src/` | Planned | DES-18b–e |
| Tokens | `src/styles/tokens/` | Planned | DES-3 |
| Design check and contrast check | `scripts/design/` | Planned | DES-19 |
| Kit page | `src/dev/KitPage/` | Planned | DES-20 |
| Type and fonts | tokens, `public/fonts/` | Planned | DES-4 |
| Motion and reduced motion | `src/styles/motion/` | Planned | DES-5, DES-6 |
| Kit components | `src/components/kit/` | Planned | DES-7a–c, DES-15, DES-17 |
| Chrome and layout | header, breakpoints | Planned | DES-8, DES-10 |
| The tablet shell | `components/os/`, Grade Select | Planned | DES-9a–c |
| Library | `apps/reading/pages/Hub/` | Planned | DES-21, DES-13 |
| GameShell and games | `engine/GameShell/`, `games/` | Planned | DES-22a–c, DES-11 |
| Lessons | `apps/reading/lessons/` | Planned | DES-23 |
| Light and dark switching | `index.html`, Settings | Planned | DES-16 |
| Legacy styles retired | everything above at zero | Planned | DES-24 |
