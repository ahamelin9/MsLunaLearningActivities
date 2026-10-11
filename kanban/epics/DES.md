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
| 2 | Structure (pure refactors, nothing looks different) | DES-18a → DES-18b → DES-18c → DES-18d, DES-18e | Screenshots you can compare; one folder per page, game and lesson; CSS modules; `games.scss` gone |
| 3 | Foundations | DES-3 → DES-19 → DES-20 → DES-4 → DES-5 → DES-6 | Tokens in light and dark; lint enforces the rules after every edit; the Kit page; Andika and Fraunces offline; shared motion; reduced motion |
| 4 | The kit | DES-7a → DES-7b, DES-7c → DES-15 | Every kit component on the Kit page in every state, and the new Luna |
| 5 | Frame and shell | DES-8 → DES-10 → DES-9a → DES-9b → DES-9c → DES-12 | One header, the layout grid, the restyled home, Settings, trophies and Grade Select; one Luna per screen |
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

### DES-18a · Screenshots you can compare: same every run, with a pixel diff
Task · P0 · M · needs: —
- **Why:** pure refactors must look identical, and today that can't be proven:
  - `Math.random` (in 11 files), the clock and endless animations make every run differ;
  - `ui:shots` clicks through by class names, which CSS modules will change (DES-18b on).
- **How:** in `scripts/ui/shots.mjs` only, with no app change:
  - seed `Math.random` and fix `Date.now` in `evaluateOnNewDocument`;
  - before each shot, pause infinite animations at 0 and finish the rest (`document.getAnimations()`);
  - stub the confetti canvas;
  - click by `data-shot="…"` attributes, added to the elements the script uses today (`.home-screen-container`, `.grade-card-item`, `.game-thing`, `.lesson-choice` and the rest);
  - add `--diff <a> <b>`: it compares the PNGs inside the headless page (a pixel counts as different past about 8 per channel), lists the screens that differ, and saves a red overlay for each.
  - Also delete `src/App.css` (never imported; taken from OPS-1).
- **Complete when:**
  - two runs of an unchanged tree diff to 0 differing screens at all 4 sizes;
  - a deliberate one-pixel colour change shows up in `--diff` with an overlay;
  - the script uses no class selectors;
  - `App.css` is gone, and build and lint pass.

### DES-18b · Module setup, then the shell and UI as modules in folders
Task · P0 · M · needs: DES-18a
- **Why:** global SCSS lets moved files collide. CSS modules make collisions impossible (Alex's call, 2026-10-10).
- **How:**
  - **Setup:**
    - `vite.config.ts`: `css.modules.localsConvention: 'camelCaseOnly'`, and `css.preprocessorOptions.scss.loadPaths` set to the absolute `src`;
    - an `@/` alias in Vite and the tsconfig, for TypeScript only;
    - a small `cx()` helper in `src/utils/`.
  - **Convert in place, then move:** each file in `components/os/` and `components/ui/` becomes `Name.module.scss` in its current place, with the same selectors and order. Diff. Then each moves into its own folder (`components/os/HomeScreen/HomeScreen.tsx` + `.module.scss`). Diff again.
  - State classes become `data-*` attributes (`is-active` becomes `data-state="active"`), which keeps the specificity the same.
  - The same goes for `App.scss` and `apps/preview/ComingSoonApp`.
  - Delete `AppDock` (never rendered; taken from OPS-1).
- **Complete when:**
  - `--diff before after` shows 0 differing screens at 4 sizes;
  - no global class is left in `components/os`, `components/ui`, `App` or `apps/preview`;
  - `AppDock` is gone, and build and lint pass.

### DES-18c · Reading pages, GameShell and LunaOwl as modules in folders
Task · P0 · M · needs: DES-18b
- **How:**
  - `pages/ReadingHub` becomes `pages/Hub/`, plus `pages/GradeSelect/`, `engine/GameShell/` and `engine/LunaOwl/`, each converted in place and then moved, as in DES-18b.
  - The template-built class names (`shape-${…}`, `flash-${…}`, `phase-${…}`, `is-*`) become `data-shape`, `data-flash`, `data-phase` and `data-state`.
  - The shell's global `.speak-chip` and `.stage-prompt`, which 6 games use, become `SpeakChip` and `StagePrompt` components that take a `className`. That covers Story Corner's `.book-page.right .speak-chip`.
- **Complete when:**
  - `--diff before after` shows 0 differing screens at 4 sizes;
  - no global class is left in those folders;
  - no game uses `.speak-chip` or `.stage-prompt` as a class;
  - build and lint pass.

### DES-18d · One folder per game; `games.scss` gone
Task · P0 · M · needs: DES-18c
- **How:**
  - Each game moves into its own folder with its own module: `games/BubbleSounds/BubbleSounds.tsx` + `BubbleSounds.module.scss`, and the same for the other 7, under today's component names.
  - The shared pieces (`.game-surface`, `.sound-horn`) go to `games/shared/`, and the unused `.reveal-chip` is dropped.
  - Before splitting, check that no shared rule after a game's block overrides it, since moving it would change the result.
  - The small-screen block at the end of `games.scss` goes to each game's own module.
- **Complete when:**
  - `--diff before after` shows 0 differing screens at 4 sizes;
  - `games.scss` is deleted;
  - each game's folder holds its `.tsx` and its module;
  - build and lint pass.

### DES-18e · One folder per lesson type
Task · P0 · S · needs: DES-18c
- **How:**
  - `apps/reading/components/` becomes `apps/reading/lessons/`: one folder per lesson type (`lessons/BlendAndRead/` …).
  - `lessons/shared/` holds `LessonKit`, `LessonRound`, `lessonHooks` and the shared `lesson-*` pieces as a module.
  - Story Corner's lesson block goes to `lessons/StoryReader/`.
- **Complete when:**
  - `--diff before after` shows 0 differing screens at 4 sizes;
  - `lesson.scss` and `apps/reading/components/` are gone;
  - build and lint pass.

### DES-3 · One set of design tokens
Story · P0 · M · needs: —
- **Why:** values must live in one place, and light/dark must come from roles alone (DES-2, `docs/design-system/colour.md`).
- **How:** build the three layers in `src/styles/tokens/`, with the round 2 values from the frozen prototype (`gen.py`), snapped to the scales in `decisions.md`.
  - **`_primitives.scss`:** SCSS only, outputs no CSS. The palette, the 4px space scale, radii, borders (including `--border-hair` and `--press-depth`), z-index, breakpoints (a map plus a mixin, since media queries can't use `var()`) and touch-target minimums. Only token files may `@use` it.
  - **`_roles.scss`:**
    - every colour role written once as `role: (light, dark)` with a comment saying what it's for: ground, card, edge, well, soil, ink, ink-soft, accent (and its ink, edge, soft and text), action (and its ink and edge), pressed, right (ink, edge, soft, text, glow), try again (soft, edge, text), rare, super rare, focus, grain, picture tints;
    - elevation (flat, card, lifted, ledges 3, 5 and 6, the glow ring), radius roles (chip, tag, tile, card, stage, arch), z roles and target sizes;
    - one `roles($mode)` mixin outputs the full list under `:root, [data-theme="light"]` and under `[data-theme="dark"]`, with `color-scheme` set. No `light-dark()`;
    - the text pairs the contrast check proves sit next to the roles;
    - `--space-*` is published too.
  - **`_illustration.scss`:** `--illo-*` colours. Luna, moon gold, squishies, cookies, roses and petals are fixed in both modes; the home scenery (sky, dunes, pampas) has a day and a night value.
  - **`src/styles/global.scss`:** the one entry, imported by `main.tsx`. It loads roles, illustration and `base/` (reset, ground with paper grain). `styles/_mixins.scss` outputs no CSS and is the only partial a module may `@use`.
  - **The app root:** pinned to `data-theme="light"` until DES-16, so a dark iPad doesn't get half-dark screens while areas move.
  - **The unused sunset/day/cosmic setting goes** (its type, default and the `theme-*` classes), keeping today's default look.
  - The legacy `_variables.scss` and `_world.scss` stay until their areas move (DES-24 deletes them).
- **Complete when:**
  - removing one role's dark value fails `npm run build`;
  - every colour on the round 2 boards has a role or an `--illo-*` entry;
  - nothing outside `src/styles/tokens/` uses the primitives;
  - `ui:shots --diff before after` shows 0 differing screens (nothing reads the tokens yet);
  - the map's status row for tokens is updated.

### DES-19 · Design check and contrast check in `npm run lint`, and after every edit
Task · P0 · M · needs: DES-3, DES-18e
- **Why:** the rules only hold if a machine checks them, and catching a slip straight after the edit means nothing needs cleaning up later (Alex, 2026-10-10).
- **How:**
  - **`scripts/design/check.mjs`** (no new dependencies), run by `npm run lint` after eslint. Over `src/**/*.{scss,ts,tsx}` it fails on:
    - colour literals outside `_primitives.scss` and `_illustration.scss`;
    - px/rem, duration and easing literals outside the token files;
    - `@keyframes` outside `src/styles/motion/`;
    - `@use` of the primitives outside `src/styles/tokens/`;
    - a kit folder with no `.kit.tsx`;
    - a `design-exception(ID): why` marker whose ID is neither on the board nor in the changelog.
  - **What the check skips:**
    - it strips comments and `url(data:…)` first;
    - it allows `0`, `%`, `fr`, viewport units, `deg`, `em` and unitless numbers;
    - in `.ts`/`.tsx` it checks colours only.
  - **Ratchet:**
    - `scripts/design/baseline.json` holds today's count per file. Lint fails if a file goes up or a new file has any violations.
    - `--update` rewrites the baseline but refuses any increase, and accepts a moved file only when the total doesn't rise.
    - `npm run design:status` prints what's left per area.
  - **`scripts/design/contrast.mjs`**, also run by lint. It compiles `src/styles/tokens` with sass-embedded (`compileAsync`, absolute `loadPaths`), blends semi-transparent colours over their ground, and checks every listed text pair at 4.5:1 or more in light and dark.
  - **`.claude/hooks/design-check-file.mjs`** (PostToolUse on Edit, Write and MultiEdit) runs the check on the edited file alone. It reports only violations that are new against the baseline or the file's HEAD version, each with a fix hint ("raw hex: use a role, see colour.md"), fed back so Claude fixes them in the same turn.
- **Complete when:**
  - a raw hex added to a kit component fails `npm run lint` and is reported straight after the edit;
  - editing a legacy file without adding violations reports nothing;
  - today's tree passes through the baseline, and `--update` refuses a raised count;
  - a marker naming an unknown ID fails;
  - the contrast check lists every pair in both modes, and fails when a pair is pushed under 4.5;
  - `npm run design:status` prints counts per area;
  - the map and the skill explain how to read a failure.

### DES-20 · Kit page (dev only) and its screenshots
Task · P0 · M · needs: DES-3, DES-18b
- **Why:** one place to see every token and component, in every state, in light and dark, so a restyle can be judged at a glance.
- **How:**
  - `src/dev/KitPage/`, opened with `?kit` only when `import.meta.env.DEV`, and lazy-loaded so the production build has none of it.
  - **Tokens tab:** colour roles in light and dark side by side with their contrast ratios, the illustration palette, type, space, radii, elevation and motion demos.
  - **Components tab:** collects every `src/components/kit/*/*.kit.tsx` with `import.meta.glob`, so a new component shows up by itself.
  - Light, dark and side-by-side switches.
  - `npm run ui:shots -- --kit` captures it in light and dark at 1180×820.
- **Complete when:**
  - `npm run dev` with `?kit` shows the Tokens tab in light, dark and side by side;
  - a grep of `dist/` after `npm run build` finds no Kit page code;
  - `npm run ui:shots -- --kit --label kit` writes a light and a dark shot.

### DES-4 · Typography and local fonts
Story · P0 · S · needs: —
- **Why:**
  - Fredoka and Nunito load from Google Fonts. On an offline classroom tablet they fall back to system fonts.
  - In Fredoka, lowercase `l` and capital `I` are both a plain stroke, so the Letter Jar can be unfair.
- **How:**
  - Self-host Andika (400, 700) and Fraunces (with its Soft axis) under `public/fonts/` as woff2 with `font-display: swap`, through `@font-face` in `src/styles/base/_fonts.scss`. Remove the Google Fonts link from `index.html`.
  - Andika is for everything a child reads: distinct I/l/1 and a single-storey a/g. Fraunces Soft (`'SOFT' 100, 'WONK' 0`) is for titles.
  - Add the type roles to the tokens: display sizes, read, label, caption, answer-word and answer-letter, from the type scale in `decisions.md`. The 20px minimum applies to text a child must read to play.
  - Point the legacy font variables (`$font-display`, `$font-main`) and the 33 `'Fredoka', sans-serif` literals at the font roles, so the whole app switches font at once. Fredoka and Nunito retire.
- **Complete when:**
  - with the network off, the app shows Andika and Fraunces;
  - I and l look different on letter tiles;
  - no stylesheet or `index.html` names Fredoka or Nunito.

### DES-5 · Motion system
Story · P0 · M · needs: —
- **How:**
  - **Motion roles in the tokens:**
    - durations tap, enter, emphasis and celebrate, plus a loop length;
    - easings standard, springy and exit;
    - one `--motion-*` shorthand per shared animation (`--motion-pop: luna-pop var(--dur-emphasis) var(--ease-springy)`).
  - **`src/styles/motion/_keyframes.scss`** holds the shared set: pop, wobble, glow, float, sway, twinkle, squish, shimmer, petal-fall, grow-in and talk. It's loaded once by `global.scss`. Modules use the shorthands (`animation: var(--motion-pop)`), which CSS modules don't rename.
  - Glows use roles inside the keyframes (no hard-coded action colour, unlike the prototype).
  - **One helper** for JS timers tied to an animation (a wrong answer clears after 600ms to match the wobble). It reads the duration roles, so reduced motion shortens both.
  - Areas move onto the shared set when they're restyled. Until then, an area's own keyframes stay in its module, and the ratchet counts them.
- **Rules (in `foundations.md`):**
  - Motion is for feedback, celebration and drawing attention.
  - Things the child is reading never move, except in Bubble Sounds, where movement is the game.
  - Ambient loops are slow (4s or more) and pause during play.
  - A celebration may run up to 2.2s (the petals) if it never blocks input for the next round.
  - Luna's talking animation follows the audio.
- **Complete when:**
  - every shared animation plays on the Kit page;
  - no keyframe in the motion folder uses a raw colour;
  - the design check refuses a new `@keyframes` outside the motion folder;
  - on the real iPad, a glow takes the dark colour in dark mode (Alex).

### DES-6 · Reduced motion, wired end to end
Story · P0 · S · needs: DES-5
- **Why:** the `reducedMotion` setting is saved but never read. The device setting is ignored in `games.scss`, the confetti, and the home-screen glow bubbles.
- **How:**
  - Set `data-reduced-motion` on the app root from either the setting or `prefers-reduced-motion`.
  - Under it, the motion roles turn every loop and transform to `none` and durations to `0ms`, and confetti is skipped.
  - Bubble Sounds slows its bubbles down instead of stopping them.
  - Add the toggle to Settings, behind the gate from SET-1.
- **Complete when:** with the flag on, no screen has continuous motion and every game is still playable.

### DES-7a · Kit, part 1: the basics
Story · P0 · M · needs: DES-3, DES-5, DES-20
- **Why:** a restyle should mean changing the kit, not every screen. Today `components/ui/Button` is in the old OS style, and every screen draws its own cards and chips.
- **Each kit component** lives in `src/components/kit/<Name>/` and has:
  - `<Name>.tsx`, opening with a header comment: what it is, its props, its states, the component tokens it declares and the roles they read;
  - `<Name>.module.scss`: component tokens at the top (`--button-bg: var(--action)`), with variants swapping only those;
  - `<Name>.kit.tsx`: every state, for the Kit page.

  States go in `data-state`. A parent's `className` may set layout only, and a kit root never sets its own margin. Every component is exported from `kit/index.ts`, the kit list.
- **This part:**
  - **Icon:** the drawn set from `components/ui/Icons.tsx`, redrawn to the prototype's 2.2 stroke with round caps, in `currentColor`, with no colour props or default colour. Plus the icons the boards use: check, clock, lock, unlock, chevrons, arrows, home, speaker, ear, replay, gear, info, book, dice, play, star, sparkle.
  - **ChunkyButton:** variants action, secondary, quiet (dashed) and icon; sizes 48 and 64; the press sinks by `--press-depth` and the ledge shrinks.
  - **PaperCard:** flat, card and lifted.
  - **Chip:** time "about N min", took "took N min", accent tag ("Up next"), count (stars). TimeChip is a preset of it.
  - **Tile:** a picture area and a name, for the Play Shelf.
  - **Modal:** a lifted card with a 48px close button. No board shows one, so Alex OKs it on the Kit page.
- **Complete when:**
  - each component shows every state in light and dark on the Kit page;
  - each has its header and its `.kit.tsx`;
  - `npm run design:status` shows zero for `components/kit`;
  - Alex OKs the Kit page shots.

### DES-7b · Kit, part 2: play
Story · P0 · M · needs: DES-7a
- **Why:** answer buttons are styled six separate ways today (`lesson-choice`, `cookie`, `treasure-option`, `missing-choice`, `story-answer`, `word-tile`), with two different wrong shakes and no "revealed" state.
- **This part** (same kit rules as DES-7a):
  - **Choice**, the one answer button: letter, word or picture, in the states idle, pressed, wrong, right, revealed (for FB-2: a dashed accent ring with a soft accent fill, for Alex to OK), and faded/disabled. Sizes follow the target and type roles: answer letters 48px or more, words 32px or more, targets 64px or more with 12px between them.
  - **ListenCue**, the "?" arch: waiting (dashed action border, ear, "?", "tap to listen", a slow pulse), tapped (a ripple), and found (right-soft, the answer, "found it!").
  - **SpeechBubble:** tail left or bottom, with an optional "Hear my clue" button.
  - **StarRow:** 0 to 3 stars, which can animate in.
- **Complete when:**
  - every state of each component shows in light and dark on the Kit page;
  - wrong uses the shared wobble and right the shared pop (DES-5);
  - `components/kit` is still at zero;
  - Alex OKs the revealed state.

### DES-7c · Kit, part 3: progress and rewards
Story · P0 · M · needs: DES-7a
- **Why:** DES-13 (one bar, lessons in order), PRG-5 (squishies), PRG-6 (times) and PRG-7 (locked lessons) all need these pieces drawn once.
- **This part** (same kit rules as DES-7a):
  - **ProgressBar:** the lessons size, with segments and "N of M lessons done", and the rounds size for a lesson's top bar. The count comes from the data, never from the design.
  - **LessonCard:** done (check badge, "took N min"), up next (glowing border, "Up next" tag that stays centred with reduced motion, "about N min", a thin rounds bar once started) and locked (dashed, lock badge, "about N min", a wobble on tap).
  - **Squishy:** the kinds on the boards (squish ball, mochi cat, bunny, bear, butter block, peach, cloud, little moon) in usual, rare and super-rare colours from `_illustration.scss`. It squishes on tap. A not-found squishy shows as a greyed ghost, a harder one as a "?" slot, and a rarity tag can shimmer. Colour dots show found, grey (a usual colour still to find) and "?" (a rare one still to find).
- **Complete when:**
  - every state of each component shows in light and dark on the Kit page;
  - the Squishy's colours come only from `_illustration.scss`;
  - `components/kit` is still at zero;
  - Alex OKs the Kit page shots.

### DES-8 · One set of chrome
Story · P0 · M · needs: DES-7a
- **Why:** inside the app there are two header bars, stars and mute shown twice, `VoiceIndicator` shown twice, and four ways home: the status pill, the Home button, the home-indicator bar, and "Library". Together these take about 130px of an 820px-tall screen.
- **How:**
  - Inside an app: one header with Home, the title, stars, and the settings gear (gated), built from ChunkyButton, Chip and Icon, as on the round 2 Library and Round boards.
  - The status bar shrinks to the clock, or disappears. The "Luna is ready" voice indicator goes too (Alex, 2026-10-09: the problem it flagged is fixed).
  - Keep one way home plus "Library" inside games.
  - Fix BUG-11 while you're in there.
- **Complete when:**
  - each control appears exactly once;
  - the game stage gets back at least 80px of height in landscape;
  - the header is built from kit components and roles only, its folders show zero in `design:status`, and it's checked in light and dark.

### DES-9a · Shell restyle, part 1: home screen and status bar
Story · P0 · M · needs: DES-8, DES-15
- **Why:** the home screen keeps its iPad feel (Alex, 2026-10-08) but drops the purple gradients. It stays like today, with just the one Reading app icon (the teacher, 2026-10-10, chose the original over the "a little more" board). No school-subject apps (OPS-3).
- **How:**
  - As on the round 2 Home board: the iPad feel (status bar, the one Reading app icon, home indicator) in the sand and cocoa palette. Day shows the sun and dunes. The night scene comes with DES-16. No purple gradients or blurred blobs.
  - The scenery's colours come from `_illustration.scss`, and the app colours in `apps/registry.ts` go.
  - Room is left for later ESL companion apps (WRT-1 asks the teacher first).
- **Complete when:**
  - the home and status-bar shots match the Home board;
  - `components/os/HomeScreen` and `StatusBar` show zero in `design:status`;
  - `registry.ts` holds no colours;
  - it's checked in light and dark.

### DES-9b · Shell restyle, part 2: Settings and the Trophy room
Story · P0 · M · needs: DES-7a, DES-9a
- **How:**
  - Settings and the Trophy room become kit Modals with kit buttons, chips and cards, in plain grown-up language.
  - No board shows them, so Alex OKs the shots.
  - The achievement badge colours (`data/achievements.ts`) and `TrophyModal`'s inline colours go; badges use roles or `_illustration.scss`.
  - `components/ui/Button` goes with its last users here.
- **Complete when:**
  - both screens use kit components and roles only, and their folders show zero;
  - `components/ui/Button` is deleted;
  - it's checked in light and dark, and Alex OKs it.

### DES-9c · Shell restyle, part 3: Grade Select
Story · P0 · S · needs: DES-7a, DES-15
- **How:**
  - Grade Select talks to the child, not to grown-ups: no "digraphs" and no "dashboard".
  - Kit cards, with Luna (DES-15) instead of the emoji `components/ui/Mascot`.
  - The curriculum's gradient colours (`data/readingCurriculum.ts`) go.
  - No board shows it, so Alex OKs the shots.
- **Complete when:**
  - Grade Select uses kit components and roles only, and its folder shows zero;
  - `Mascot` is deleted;
  - no grade colour is left in the curriculum data;
  - it's checked in light and dark, and Alex OKs it.

### DES-10 · Layout grid and breakpoints
Story · P0 · M · needs: DES-7a
- **How:**
  - Lay out the hub and game stage for the four `ui:shots` sizes (1180×820, 820×1180, 1024×768, 744×1133), using the breakpoint mixin from the tokens (as few breakpoints as the four sizes need; today's 640/700/720/860 retire).
  - Hub: the next lesson and Luna's Pick are visible without scrolling.
  - Play Rug: tiles sit on a consistent grid. Titles must not overlap their scenery (they do today on Feed Luna and Muddled Cards), and Treasure Path's tile must not be oversized.
  - Game stages fit the screen with no scrolling during play.
- **Complete when:**
  - at all four sizes, nothing overlaps, nothing scrolls mid-round, and all touch targets meet the target roles;
  - no media query outside the breakpoint mixin.

### DES-11 · One right/wrong/reveal visual language
Story · P1 · S · needs: DES-5, DES-7b, DES-22a
- **How:** use the same right glow, wrong wobble, win veil and "revealed" style (for FB-2) in every game and lesson, through `Choice` and the shell's flash. Game pieces that aren't Choices (bubbles, cookies, bugs, memory cards, word tiles) use the same state roles, `data-state` and motion. The games and lessons adopt it in DES-22b, DES-22c and DES-23.
  - **A win grows flowers (Alex, 2026-10-09):** a solved round grows a few flowers up the sides of the stage, and petals fall instead of confetti, as on the round 2 Round board. The lesson-done screen uses the same petals. Flowers and petals never cover the answer choices or block the next tap. **Kept for now (Alex, 2026-10-10):** the teacher dropped flowers for progress (DES-13), not for wins; change this only if she asks.
- **Complete when:**
  - the shell's flash, the win's flowers and petals, and Choice's states share one set of roles and motion;
  - the state roles for game pieces are documented in `components.md`;
  - every solved round grows flowers and drops petals;
  - no confetti is left anywhere (`utils/confetti.ts` deleted);
  - it's checked in light and dark. (That every game and lesson looks the same is checked in DES-22b, DES-22c and DES-23.)

### DES-12 · Luna on screen: one Luna, clear moods
Story · P1 · S · needs: DES-9c, DES-15
- **Why:** Feed Luna shows two owls at once (the one on the stage and the one on the perch).
- **How:** at most one Luna per screen; the perch Luna hides when the game's stage has its own. Document what each mood is for. Make sure the talking animation always follows the audio.
  - **Spoken, not shown (Alex, 2026-10-09):** where space is tight, as on the library, Luna's greeting is spoken with no always-on speech bubble. A small speaker mark shows she talks, and tapping her says it again.
  - **The milestone moon is a visitor (DES-17):** while she visits, the owl stays and watches, and only the moon talks. One talker at a time.
- **Complete when:** no screen shows two owls, and the moon appears only during a milestone visit.

### DES-13 · Lesson path on the hub: in order, one bar
Story · P1 · S · needs: DES-7c, DES-10, PRG-7
- **Why:** the teacher found seeds to flowers too confusing and picked "One bar" from the round 2 Progress board (2026-10-10). Lessons now go in order (PRG-7), so each one only needs to say done, up next or locked.
- **How:** as on the round 2 Library, Round and Done boards:
  - **The bar:** one bar above the lessons, one segment per lesson, with "N of 6 lessons done". It fills as each lesson is done.
  - **Done:** a green check badge and "took N min" (PRG-6). It can be played again.
  - **Up next:** a glowing border, an "Up next" tag and "about N min". Once started, a thin bar shows how many of its rounds are done.
  - **Locked:** dashed and quieter, with a lock badge and "about N min". Tapping it wobbles it, and Luna says to finish the open lesson first (PRG-7).
  - **Inside a lesson:** the top bar shows the rounds as a bar, not seeds.
  - **Finishing a lesson:** the done screen shows a "Lesson done!" mark, the bar moving on, and "Lesson N is open now". Back on the hub, the next card unlocks with a short pop (DES-5; a plain swap with reduced motion).
  - No seeds, sprouts or flowers anywhere in progress. Wins keep theirs (DES-11).
- **Complete when:**
  - a new child sees an empty bar, Lesson 1 up next and the rest locked;
  - finishing Lesson 1 fills one segment, shows it done with its time, and opens Lesson 2;
  - a lesson left part-way shows its rounds bar;
  - the hub, the round's top bar and the done screen show no seeds or flowers;
  - the path is built from ProgressBar, LessonCard and roles only, its code shows zero in `design:status`, and it's checked in light and dark.

### DES-14 · Feed Luna's cookies look like real, different cookies
Story · P2 · S · needs: DES-22b
- **Why:** every cookie is the same flat brown circle, which doesn't read as a picture (Alex, 2026-10-09).
- **How:** a few cookie designs (chocolate chip, sprinkles, jam, and so on), mixed in each round, drawn in the DES-2 style, with their colours in `_illustration.scss`. The letter stays just as easy to read.
- **Complete when:** a round shows at least two different cookie designs, and every letter still meets the DES-2 type minimums.

### DES-16 · Light and dark mode
Story · P1 · M · needs: DES-3, SET-1
- **Why:** Alex wants a real dark mode (2026-10-09), and building the components on role tokens from the start keeps every screen working in both.
- **How:** the dark roles already exist (DES-3), and the contrast check runs in lint (DES-19). What's left:
  - **Follow the iPad's light/dark setting by default:** a `prefers-color-scheme: dark` block (`:root:not([data-theme="light"])`) outputs the dark roles. An inline script in `index.html` sets `data-theme` on `<html>` before the first paint, so there's no flash.
  - **A grown-up's choice:** Light, Dark or "Match the iPad" in Settings, behind the gate (SET-1). The choice is saved.
  - Every screen uses the roles only. Illustrations (Luna, squishies, flowers) keep their own colours from `_illustration.scss`.
  - At night the home screen shows a crescent moon in moon gold and twinkling stars instead of the sun (round 2 Home board), using the night scenery from `_illustration.scss`.
  - With reduced motion (DES-6) the stars don't twinkle.
- **Complete when:**
  - with the iPad set to dark, every screen shows the dark set, and switching back shows the light set without a reload;
  - the contrast check passes in both modes;
  - the home screen shows the moon and stars in dark mode and the sun in light mode;
  - the Settings choice overrides the iPad and survives a reload;
  - every screen is checked in dark on the real iPad (Alex).

### DES-15 · Draw the chosen Ms. Luna
Story · P0 · M · needs: DES-7a
- **Why:** the teacher picked the round 2 prototype's owl (2026-10-10, "she loved it"): the rounder owl in round black frames, caramel feathers. Today's `LunaOwl` drawing and the emoji `components/ui/Mascot` both retire. The moon is her own ticket (DES-17).
- **How:**
  - Redraw `LunaOwl` as that owl and move it into the kit as `src/components/kit/Luna/` (a Writing app will use her too). The reference is `owl()` in `.claude/skills/luna-design/prototype/gen.py` and owl 1 on the round 2 Ms. Luna board (marked "Her pick").
  - Her colours come from `--illo-*` in `_illustration.scss`, set through classes, never `fill="#…"`.
  - Keep all 8 moods (idle, happy, cheer, think, oops, surprise, listen, sleepy), the blink, and the talking animation, which follows the audio. Her `.kit.tsx` shows every mood.
- **Complete when:**
  - the round 2 owl appears on every screen that shows Luna;
  - each of the 8 moods looks different on the Kit page;
  - her beak only moves while a clip is playing;
  - the Luna folder shows zero in `design:status`.

### DES-17 · The moon visits for big milestones
Story · P1 · M · needs: DES-15, DES-5
- **Why:** the teacher (2026-10-10): the second moon on the round 2 Ms. Luna board, a crescent with a face and black glasses, comes in every once in a while to say "good job" for big milestones. The owl stays Luna.
- **How:**
  - Draw that moon (round 2 Ms. Luna board, moon 6, marked "Milestone moon") as its own kit component, `src/components/kit/MilestoneMoon/`, in moon gold from `_illustration.scss`, the one colour outside the palette. She needs a happy and a cheer look, both shown on the Kit page. Her mouth moves only while her clip plays.
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
  - each lesson milestone above brings the moon exactly once, with her line playing;
  - an ordinary lesson never does;
  - with reduced motion she appears without gliding;
  - her clips are rendered and `voice:audit` passes;
  - the MilestoneMoon folder shows zero in `design:status`.

### DES-21 · Library on the kit: header, welcome row, Luna's Pick, Play Shelf
Story · P1 · M · needs: DES-7a, DES-8, DES-10
- **Why:** the round 2 Library board is approved, but no ticket covered the hub apart from its lesson path (DES-13).
- **How:**
  - As on the Library board:
    - the welcome row (Luna with her spoken greeting, DES-12);
    - Luna's Pick;
    - the Play Shelf: 8 kit Tiles with drawn pictures in place of today's scenery and emoji lanterns.
  - The Squishy Shelf card and the "Today" panel come with PRG-5 and PRG-6, built from the same kit.
  - `ReadingHub`'s own keyframes move onto the shared motion set.
- **Complete when:**
  - the hub matches the Library board (lesson path aside) at the four sizes, in light and dark;
  - `pages/Hub` shows zero in `design:status`;
  - Alex OKs the shots.

### DES-22a · GameShell on the kit: start, stage, perch, reward
Story · P1 · M · needs: DES-7b, DES-8
- **Why:** every game's start screen is the same centred card with a green that belongs to neither palette, and the reward screen predates the round 2 Done board.
- **How:**
  - **Start screen:** built from the kit. No board shows it, so Alex OKs it.
  - **Stage and perch:** as on the Round board.
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
- **Complete when:**
  - in each of the 4 games, a right and a wrong answer look like they do everywhere else;
  - the 4 game folders show zero in `design:status`;
  - they're checked in light and dark at the four sizes.

### DES-22c · Games on the kit, part 2: Words Off the Page, What's Missing?, Treasure Path, Story Corner
Story · P1 · M · needs: DES-11, DES-22a
- **How:** the same as DES-22b, for these 4 games. Treasure Path's stopgap passage view stays until GAME-1c designs its real screen.
- **Complete when:**
  - in each of the 4 games, a right and a wrong answer look like they do everywhere else;
  - the 4 game folders show zero in `design:status`;
  - they're checked in light and dark at the four sizes.

### DES-23 · Lessons on the kit
Story · P1 · M · needs: DES-7b, DES-11
- **How:**
  - All 8 lesson types use Choice, ListenCue, SpeechBubble and PaperCard.
  - The shared `lessons/shared` module shrinks to layout only.
  - The lesson-specific wrong shake retires for the shared wobble.
- **Complete when:**
  - every answer button in every lesson type is a `Choice`;
  - `lessons/` shows zero in `design:status`;
  - a right and a wrong answer look the same as in the games;
  - it's checked in light and dark.

### DES-24 · Retire the legacy styles
Task · P1 · S · needs: DES-9a, DES-9b, DES-9c, DES-21, DES-22b, DES-22c, DES-23
- **Why:** this is the finish line of the design-system effort (Alex's plan, 2026-10-10).
- **How:**
  - Delete `src/styles/_variables.scss`, `src/apps/reading/engine/_world.scss`, `src/index.css` (replaced by `styles/base/`), the legacy mixins (`glassmorphism`, `squircle-icon` and the like) and `scripts/design/baseline.json`.
  - The design check then runs strict, with no baseline.
- **Complete when:**
  - `npm run lint` passes with no baseline: every colour, size, radius, border, shadow, duration and breakpoint in `src` comes from the token files;
  - every screen works in light and dark from roles alone, and the contrast check passes;
  - every button, card and answer choice is a kit component, and the Kit page shows them all in every state;
  - each page, game and lesson type has its own folder and styles;
  - someone new can open `docs/design-system/README.md`, find any token or component in under a minute, and follow written steps to add one or to handle something that doesn't fit (Alex tries it);
  - the `luna-design` skill tells Claude the same.
