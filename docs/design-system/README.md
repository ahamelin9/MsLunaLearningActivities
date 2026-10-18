# Ms. Luna design system

Start here for anything visual in Ms. Luna: how it looks and why, where every
value lives, and how to add or change something. It's written for people and
for Claude alike. The `luna-design` skill points Claude here before any UI
work, and a hook brings in the right section whenever a UI file is edited.

**Status (2026-10-18):** the teacher approved the look (the round 2 style
sample), and Alex approved these standards (2026-10-10). Every screen is now
built from the kit and the tokens, and the legacy styles are gone (DES-24), so
the design check is strict: any raw value fails `npm run lint`. What's left of
the DES epic is at the top of `kanban/epics/DES.md`, and the table at the
bottom of this page shows where each area stands.

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
| What every screen starts from: the reset, the paper ground, the base text (Andika in `--ink`, headings in Fraunces) and the focus ring for a plain button | `src/styles/base/` | DES-3, DES-24 |

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
  contrast check. `npm run design:status` counts raw values and exception
  markers per area (every area is at 0 since DES-24). A failure? See "Reading a
  design check failure" below.
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
  show. Every screen is on roles (DES-24), but until DES-16 the app itself
  stays light, so this is how to see dark. Take a `before-dark` too, and
  `--diff before-dark after-dark`.

## Reading a design check failure

`npm run lint` runs eslint, then the design check, then the contrast check, and
stops at the first that fails.

**The design check** (`scripts/design/check.mjs`) finds raw values outside
their homes. It's strict: there's no baseline (DES-24 deleted it), so one raw
value anywhere in `src` fails it.

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
- **`src/x.module.scss: 2 raw value(s)`** and a list: each raw value with its
  line and a hint (↳) naming the token to use. Replace each with its role or
  token. `node scripts/design/check.mjs src/x.module.scss` lists them again.
  Nothing fits? Go down the ladder in [fitting-in.md](fitting-in.md).
- **A line with no count**: a broken rule. `@use` of the primitives outside
  `src/styles/tokens/`, a kit folder with no `.kit.tsx`, an `@media` outside
  the breakpoint mixin (use `@include bp(narrow)` or `bp(short)`; DES-10), or a
  `design-exception` marker whose ticket ID is on neither the board nor the
  changelog, or that gives no reason.

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
| Source tree and CSS modules | `src/` | Done (2026-10-11): every page, game and lesson type has its own folder and CSS module, and no global class is left in `src/` (`module-refs-check.mjs`). The only global styles are `global.scss`'s tokens, keyframes and `base/` (DES-24 deleted the legacy partials and `index.css`) | DES-18b–e, DES-24 |
| Tokens | `src/styles/tokens/` | Done (DES-3, 2026-10-11): primitives, roles in light and dark (the build fails if one is missing), the illustration palette, `bp()`, `global.scss` and `base/`. Every colour on the round 2 boards has a token (`tokens-check.mjs`). The app is pinned light on `<html>`; nothing reads the tokens yet | DES-3 |
| Design check and contrast check | `scripts/design/` | Done (DES-19, 2026-10-11): both run in `npm run lint`. It started with a baseline of 2,365 raw values in 50 files, which could only shrink; 22 text pairs pass 4.5:1 in both modes. Strict since DES-24 (2026-10-18): no baseline, and one raw value anywhere in `src` fails lint; the after-edit hook lists every one left in the file | DES-19, DES-24 |
| Kit page | `src/dev/KitPage/` | Done (DES-20, 2026-10-11): `/?kit` in dev only (the production build has none of it). The Tokens tab reads the tokens from `global.scss` itself, with each text role's contrast; the Components tab collects every `.kit.tsx` (none until DES-7a). `ui:shots --kit` shoots light and dark | DES-20 |
| Type and fonts | tokens, `public/fonts/` | Done (DES-4, 2026-10-11): Andika and Fraunces served from `public/fonts/` (no Google Fonts), 11 type roles, and every old Fredoka/Nunito use points at the font roles (titles Fraunces, the rest Andika). Screens move onto the type roles when restyled | DES-4 |
| Motion and reduced motion | `src/styles/motion/` | Done (DES-5, DES-6, 2026-10-11): duration, easing and 11 `--motion-*` roles, the shared keyframes, `motionMs()`/`afterMotion()` and the press mixin, all on the Kit page. Reduced motion (the Settings switch or the iPad's) stops every screen's motion, proven by `ui:shots --reduced-motion`; Bubble Sounds slows down | DES-5, DES-6 |
| Kit components | `src/components/kit/` | Parts 1–3 done (DES-7a–c, 2026-10-11): Icon, ChunkyButton, PaperCard, Chip and TimeChip, Tile, Modal; Choice, ListenCue, SpeechBubble, StarRow; ProgressBar, LessonCard, Squishy and SquishyDots. Each shows every state on the Kit page, the kit is at 0 in `design:status`, and `kit-check.mjs` (know-how) checks their behaviour in a browser. No screen uses them until the restyles. Luna done (DES-15, 2026-10-11): the teacher's owl with 8 moods, the blink, and a beak that follows the voice (`luna-talk-check.mjs`); she replaced LunaOwl and the emoji Lunas on every screen. One Luna per screen (DES-12, 2026-10-12): no screen shows two owls, which `layout-audit.mjs` checks; a game with its own Luna (`ownLuna`, Feed Luna) gets a perch with no owl; what each mood is for is in `components.md`. SpeechBubble has a no-tail form whose line says itself again, for a perch with no owl (DES-22a, 2026-10-12). Flower (daisy, red and blush roses, growing) and Petals, for a won round and the done screen (DES-11, 2026-10-17). ChunkyButton's prompt pill, and ListenCue's burst and picture (DES-22b, 2026-10-17). Still to come: MilestoneMoon (DES-17) | DES-7a–c, DES-11, DES-12, DES-15, DES-17, DES-22b |
| Chrome and layout | `components/os/AppHeader`, breakpoints | Header done (DES-8, 2026-10-11): one 64px header inside the app from kit pieces and roles (0 in `design:status`). It shows Home, the title, stars and the gear on the library, and Library, the title, the rounds bar and Again in a round. No status bar, mute or home strip inside the app, and the stage is 116px taller. Checked in light and dark (`ui:shots --theme dark`). Layout done (DES-10, 2026-10-11): two breakpoints, `narrow` and `short`, and lint fails any other `@media`. `layout-audit.mjs` (know-how) passes at 3 grades and 4 sizes: nothing scrolls or is cut off mid-round, and the library's next lesson and Luna's Pick show without scrolling. The Play Shelf's grid is DES-21's, and targets inside the stages are DES-22b/c's and DES-23's | DES-8, DES-10 |
| The tablet shell | `components/os/`, Grade Select | Home and status bar done (DES-9a, 2026-10-12): as on the Home board, with sky, sun, dunes and pampas from the illustration palette, the Reading icon, and the time and the kit's gear (a cog). HomeScreen, StatusBar, AppWindow and App are at 0, and the Coming Soon apps are gone (OPS-3). The night scene is DES-16's. Settings and the Trophy room done (DES-9b, 2026-10-12): kit Modals in plain words, with the new kit Switch and pick-one rows; the Trophy room opens from the library's sticker tin. Every folder in `components/os/` is at 0. Grade Select done (DES-9c, 2026-10-12): Luna asks which grade in her own voice, and the grades are kit Tiles (K, 1, 2) with the current one picked, a new kit Tile state. The Mascot and the grade colours are gone, and the folder is at 0. The tablet shell is done | DES-9a–c |
| Library | `apps/reading/pages/Hub/` | Welcome row and Play Shelf done (DES-21, 2026-10-12): as on the Library board, from the kit. Luna says her greeting with no bubble (from home only; tap her to hear it again) and has a mute beside her; the grade is a header button to Grade Select; a Sticker Tin card stands in for the Squishy Shelf (PRG-5) and Today (PRG-6); Luna's Pick; 8 Tiles on one even grid with drawn pictures (`games/shared/GamePicture` since DES-22a, which the start screens share). `greeting-check.mjs` (know-how) checks the greeting, grade and mute. The folder is at 0 apart from `LessonPath`, the old lesson cards moved unchanged for DES-13. Lessons open in order (PRG-7, 2026-10-12): `lessonStates` gives each lesson done, next or locked. The lesson path done (DES-13, 2026-10-12): one ProgressBar and kit LessonCards (done, up next, locked, and a pop for the one that just opened), six across on landscape and three on portrait; `LessonPath` is gone, and `pages/Hub` is at 0. Times come with PRG-6, the part-way rounds bar with PRG-8, and the done screen's lesson pieces with DES-22d. The library is done | DES-21, PRG-7, DES-13 |
| GameShell and games | `engine/GameShell/`, `engine/DoneScreen/`, `games/` | Start screen, stage and perch done (DES-22a, 2026-10-12): as on the Round board, the stage is a card with the accent blob and one in the game's Play Shelf tint, and Luna's perch is the kit's Luna with a SpeechBubble (no tail where the game draws its own Luna) and "Hear my clue". The start screen uses the same frame: the game's picture (`games/shared/GamePicture`; a lesson its number), how tricky and the big button. The shell's flash is the stage's edge, on roles. `engine/GameShell`, GameSurface and StagePrompt are at 0; `perch-check.mjs` (know-how) checks the perch, the flash and the clue. The done screen done (DES-22d, 2026-10-13): as on the Done board, the mark in the arch, "Lesson done!" (a game: "All done!"), StarRow, Luna in the corner, a lesson's bar moving on and "Lesson N is open now", today's sticker in PaperCard's dashed `reward` panel, Play again and Next lesson; the confetti is deleted and `engine/DoneScreen` is at 0. The layout audit now covers it. The win done (DES-11, 2026-10-17): a won round grows the Round board's garden behind the pieces (kit `Flower`) and drops kit `Petals` that fall on into the next round; the done screen drops them once it has arrived; the stand-in sparkle is gone. The game pieces' state roles are a table in `components.md`. The first four games done (DES-22b, 2026-10-17): Letter Cookies, Letter Jar, Bubble Sounds and Muddled Cards on the kit and their Play Shelf pictures' colours, every tapped piece at least the answer size, right and wrong as everywhere else; SpeakChip gave way to ChunkyButton's prompt pill in every game; the done screen's arch now ends just under its title. Their folders, `games/shared` and `content.ts` are at 0. The other four games done (DES-22c, 2026-10-18): Words Off the Page, What's Missing?, Treasure Path (its GAME-1b stopgap layout, on roles) and Story Corner on the kit, with kit Choices (and Choice's new `phrase` kind) and the reading size for what a child reads; their folders are at 0, so every game is on the kit. Still to come: Treasure Path's real screen with GAME-1c, the times and the squishy with PRG-6 and PRG-5 | DES-22a, DES-22d, DES-11, DES-22b, DES-22c |
| Lessons | `apps/reading/lessons/` | Done (DES-23, 2026-10-18): all 8 lesson types on the kit, as on the Round board. The thing to listen for is the kit ListenCue (with its burst), the question is ChunkyButton's prompt pill, word cards are PaperCards, the answers are Choices (letter, word, picture with its word once found, phrase), and every word in a sentence or story is a 48px target that says itself. `lessons/shared` is layout only (its own cue and prompt chip are deleted) and a wrong answer clears on the shared timer. `lessons/` is at 0 | DES-23 |
| Light and dark switching | `index.html`, Settings | Planned | DES-16 |
| Legacy styles retired | everything above at zero | Done (DES-24, 2026-10-18): `_variables.scss`, `_world.scss`, `index.css`, the old mixins, `components/ui/Icons` and the baseline are deleted. `index.css`'s base text and focus ring moved onto roles in `base/_reset.scss`, and the curriculum's unused skill colours went. Every area is at 0 in `design:status`, and every screen's shots, light and dark, are pixel for pixel what they were | DES-24 |
