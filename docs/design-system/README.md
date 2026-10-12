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
    right, try again, rare, super rare, picture tints, focus, grain…
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
| Mixins: `bp()` for breakpoints, `focus-ring`, and the press (DES-5) | `src/styles/_mixins.scss`, the one partial a module may `@use`; `bp()` lives in `tokens/_breakpoints.scss` | DES-3, DES-5 |
| Proof that every colour on the approved boards has a token | `node .claude/skills/luna-design/prototype/tokens-check.mjs "$PWD"` | DES-3 |
| The one global stylesheet | `src/styles/global.scss`, imported by `main.tsx` | DES-3 |
| Kit components | `src/components/kit/<Name>/`, listed in `kit/index.ts` | DES-7a–c, DES-15, DES-17 |
| The tablet shell (home, status bar, Settings, trophies) | `src/components/os/<Name>/` | DES-18b |
| Reading app screens | `src/apps/reading/{pages,engine,games,lessons}/<Name>/` | DES-18c–e |
| Kit page (every token and component, light and dark) | `src/dev/KitPage/`: run `npm run dev`, open `/?kit` | DES-20 |
| Design check | `scripts/design/check.mjs`, run by `npm run lint` and `npm run design:status` | DES-19 |
| Contrast check | `scripts/design/contrast.mjs`, run by `npm run lint` | DES-19 |
| Hooks for Claude's edits | `.claude/hooks/design-guide.mjs` (before), `design-check-file.mjs` (after) | DES-25, DES-19 |
| Pre-commit check for people | `.githooks/pre-commit`; turn it on once per clone (see "How to…") | DES-25 |
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
the hook shows Claude before an edit. The first time Claude edits a UI file in
an area in a session, the hook refuses that edit once, with the area's rules
as the reason, and Claude makes it again following them. Later edits in the
area get a one-line reminder. The hook reads the rules from these docs live,
so changing a `## Rules` section changes what Claude is shown.

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
- **See everything:** run `npm run dev` and open `/?kit` (DES-20): the Tokens
  and Components tabs, in light, dark or side by side (`&mode=light|dark|both`).
  `npm run ui:shots -- --kit --label <name>` saves both tabs in both modes as
  full-page shots in `screenshots/<name>/kit/` (`light.png` and `dark.png` for
  the tokens, `components-light.png` and `components-dark.png`), which `--diff`
  compares like a screen size.
- **Check your work:** `npm run lint` runs eslint, the design check and the
  contrast check. `npm run design:status` shows what's left per area (DES-19).
  A failure? See "Reading a design check failure" below.
- **Turn on the pre-commit check** (people; once per clone): run
  `chmod +x .githooks/pre-commit`, then `git config core.hooksPath .githooks`.
  Every commit then runs `npm run lint` first, and a failure stops the commit.
  Claude never runs `git config`.
- **Prove a refactor looks the same:** run `npm run ui:shots -- --label before`,
  change the code, run `--label after`, then `npm run ui:shots -- --diff before after`
  (DES-18a). It should say "0 changed screens"; anything else lists the screens
  and saves red overlays in `screenshots/diff-before-after/`. The run finds
  screens by their `data-shot="…"` attributes, so keep them when moving a screen,
  and give anything new it should click one.
- **See the screens in dark:** `npm run ui:shots -- --theme dark --label after-dark`
  (DES-8) sets `data-theme="dark"` on `<html>` for the run, so the dark roles
  show. Until DES-16 only what's already on roles turns dark. Take a
  `before-dark` too, and `--diff before-dark after-dark`.

## Reading a design check failure

`npm run lint` runs eslint, then the design check, then the contrast check, and
stops at the first that fails.

**The design check** (`scripts/design/check.mjs`) counts raw values outside
their homes:

| Kind | What counts | Its home |
|---|---|---|
| colour | a hex, `rgb()`, `hsl()` or colour name (the only check in `.ts`/`.tsx`) | `_primitives.scss`, `_illustration.scss` |
| size | a `px` or `rem` value, media queries included | `src/styles/tokens/` |
| motion | a duration (`ms`, `s`) or an easing | `src/styles/tokens/` |
| keyframes | an `@keyframes` | `src/styles/motion/` |

It skips comments, `url(data:…)`, `0`, `%`, `fr`, viewport units, `deg`, `em`
and plain numbers. A `design-exception(ID): why` marker covers its own line and
the next ([fitting-in.md](fitting-in.md)).

What a failure says, and what to do:
- **`src/x.module.scss: 41 raw value(s), the baseline allows 40 (+1)`**: the
  file gained one. `node scripts/design/check.mjs src/x.module.scss` lists every
  raw value with its line and a hint (↳) naming the token to use. Replace the
  new one. `--update` won't help: it refuses a higher count.
- **`…, the baseline allows 0`** and a list: a new file has raw values. Move
  them onto tokens. If it's an old file that was only moved or renamed, run
  `node scripts/design/check.mjs --update`: it accepts the move when the total
  doesn't rise.
- **A line with no count**, which fails whatever the baseline: `@use` of the
  primitives outside `src/styles/tokens/`, a kit folder with no `.kit.tsx`, an
  `@media` outside the breakpoint mixin (use `@include bp(narrow)` or
  `bp(short)`; DES-10), or a `design-exception` marker whose ticket ID is on
  neither the board nor the changelog, or that gives no reason.
- **On a pass, "N file(s) now below their baseline"**: raw values were moved
  onto tokens. Run `--update` to lock the lower count in, so it can't creep
  back.

**The contrast check** (`scripts/design/contrast.mjs`) prints every text pair
from `_roles.scss` with its ratio in light and dark. A ❌ names the text role,
the role under it and the mode. Change a role's value (steps 3 and 4 of the
ladder), never the 4.5:1 minimum.

**Straight after Claude's edits,** the hook `design-check-file.mjs` runs the
same design check on that one file and lists only what the edit added, with
the same hints, so it's fixed in the same turn.

## Status per area

Each ticket updates its row when it closes (Completion criteria B7 in
`kanban/README.md`).

| Area | Where | Status | Tickets |
|---|---|---|---|
| Standards (these docs, the skill) | `docs/design-system/`, `luna-design` | Done (Alex approved, 2026-10-10) | DES-2 |
| Hooks at the moment of editing | `.claude/hooks/`, `.githooks/` | Done: the before-edit hook and pre-commit check (DES-25, 2026-10-10), and the after-edit design check (DES-19, 2026-10-11) | DES-25, DES-19 |
| Screenshots you can compare | `scripts/ui/shots.mjs` | Done (DES-18a, 2026-10-11): same pixels every run on a page clock, `--diff` with red overlays, found by `data-shot` | DES-18a |
| Source tree and CSS modules | `src/` | Done (2026-10-11): every page, game and lesson type has its own folder and CSS module, and no global class is left in `src/` (`module-refs-check.mjs`). Only the legacy partials and `index.css` stay global until DES-24 | DES-18b–e |
| Tokens | `src/styles/tokens/` | Done (DES-3, 2026-10-11): primitives, roles in light and dark (the build fails if one is missing), the illustration palette, `bp()`, `global.scss` and `base/`. Every colour on the round 2 boards has a token (`tokens-check.mjs`). The app is pinned light on `<html>`; nothing reads the tokens yet | DES-3 |
| Design check and contrast check | `scripts/design/` | Done (DES-19, 2026-10-11): both run in `npm run lint`. Baseline 2,365 raw values in 50 files, which may only shrink; 22 text pairs pass 4.5:1 in both modes. `npm run design:status` shows what's left | DES-19 |
| Kit page | `src/dev/KitPage/` | Done (DES-20, 2026-10-11): `/?kit` in dev only (the production build has none of it). The Tokens tab reads the tokens from `global.scss` itself, with each text role's contrast; the Components tab collects every `.kit.tsx` (none until DES-7a). `ui:shots --kit` shoots light and dark | DES-20 |
| Type and fonts | tokens, `public/fonts/` | Done (DES-4, 2026-10-11): Andika and Fraunces served from `public/fonts/` (no Google Fonts), 11 type roles, and every old Fredoka/Nunito use points at the font roles (titles Fraunces, the rest Andika). Screens move onto the type roles when restyled | DES-4 |
| Motion and reduced motion | `src/styles/motion/` | Done (DES-5, DES-6, 2026-10-11): duration, easing and 11 `--motion-*` roles, the shared keyframes, `motionMs()`/`afterMotion()` and the press mixin, all on the Kit page. Reduced motion (the Settings switch or the iPad's) stops every screen's motion, proven by `ui:shots --reduced-motion`; Bubble Sounds slows down | DES-5, DES-6 |
| Kit components | `src/components/kit/` | Parts 1–3 done (DES-7a–c, 2026-10-11): Icon, ChunkyButton, PaperCard, Chip and TimeChip, Tile, Modal; Choice, ListenCue, SpeechBubble, StarRow; ProgressBar, LessonCard, Squishy and SquishyDots. Each shows every state on the Kit page, the kit is at 0 in `design:status`, and `kit-check.mjs` (know-how) checks their behaviour in a browser. No screen uses them until the restyles. Luna done (DES-15, 2026-10-11): the teacher's owl with 8 moods, the blink, and a beak that follows the voice (`luna-talk-check.mjs`); she replaced LunaOwl and the emoji Lunas on every screen. Still to come: MilestoneMoon (DES-17) | DES-7a–c, DES-15, DES-17 |
| Chrome and layout | `components/os/AppHeader`, breakpoints | Header done (DES-8, 2026-10-11): one 64px header inside the app from kit pieces and roles (0 in `design:status`). It shows Home, the title, stars and the gear on the library, and Library, the title, the rounds bar and Again in a round. No status bar, mute or home strip inside the app, and the stage is 116px taller. Checked in light and dark (`ui:shots --theme dark`). Layout done (DES-10, 2026-10-11): two breakpoints, `narrow` and `short`, and lint fails any other `@media`. `layout-audit.mjs` (know-how) passes at 3 grades and 4 sizes: nothing scrolls or is cut off mid-round, and the library's next lesson and Luna's Pick show without scrolling. The Play Shelf's grid is DES-21's, and targets inside the stages are DES-22b/c's and DES-23's | DES-8, DES-10 |
| The tablet shell | `components/os/`, Grade Select | Home and status bar done (DES-9a, 2026-10-12): as on the Home board, with sky, sun, dunes and pampas from the illustration palette, the Reading icon, and the time and the kit's gear (a cog). HomeScreen, StatusBar, AppWindow and App are at 0, and the Coming Soon apps are gone (OPS-3). The night scene is DES-16's. Settings and the Trophy room done (DES-9b, 2026-10-12): kit Modals in plain words, with the new kit Switch and pick-one rows; the Trophy room opens from the library's sticker tin. Every folder in `components/os/` is at 0. Grade Select is planned | DES-9a–c |
| Library | `apps/reading/pages/Hub/` | Planned | DES-21, DES-13 |
| GameShell and games | `engine/GameShell/`, `games/` | Planned | DES-22a–c, DES-11 |
| Lessons | `apps/reading/lessons/` | Planned | DES-23 |
| Light and dark switching | `index.html`, Settings | Planned | DES-16 |
| Legacy styles retired | everything above at zero | Planned | DES-24 |
