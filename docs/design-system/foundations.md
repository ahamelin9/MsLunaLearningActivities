# Foundations: type, space, shape, elevation, touch, motion, layout

Everything except colour ([colour.md](colour.md)). The values live in
`src/styles/tokens/` (DES-3 to DES-5). The scales below were agreed on
2026-10-10, and the numbers are recorded in [decisions.md](decisions.md).

## Rules

**Type**
- Andika for everything a child reads; Fraunces Soft for titles only. No other
  fonts. Both are self-hosted, so the app works offline.
- Use a type role (`font: var(--text-read)`), never a size.
- Text a child must read to play is at least 20px. Answer words are at least
  32px, and answer letters at least 48px.
- Labels on tiles and lesson cards may be 16px when a picture or number carries
  the meaning. Grown-up text (times, settings) is at least 16px. Uppercase tags
  ("Up next") are never needed to play.

**Space, shape, elevation**
- Space comes from the 4px scale (`var(--space-4)`). 2px appears only in
  borders.
- Corners come from the radius roles (chip, tag, tile, card, stage, arch). The
  arch is the signature shape.
- Three heights only: flat, card, lifted. Lifted is for modals and the done
  panel. Pressable things stand on a hard ledge that shrinks when pressed.

**Touch**
- Answer targets are at least 64×64px with at least 12px between them. Chrome
  is at least 48px. Nothing a child must hit sits within 16px of the screen
  edge.

**Motion**
- Motion is for feedback, celebration and drawing the eye.
- Words a child is reading never move. Bubble Sounds is the one exception,
  because the movement is the game.
- Ambient loops are slow (4s or more) and pause during play.
- A celebration may run up to 2.2s if it never blocks the next tap.
- Luna's mouth (and the moon's) moves only while a clip plays.
- Use the motion roles (`animation: var(--motion-pop)`). `@keyframes` live
  only in `src/styles/motion/`.
- With reduced motion, every loop stops and things appear without travelling.
  Bubble Sounds slows down instead of stopping.
- A JS timer tied to an animation reads the duration role, never a typed
  number.

**Layout**
- Every screen works at 1180×820, 820×1180, 1024×768 and 744×1133, with no
  scrolling mid-round.
- Media queries go only through the breakpoint mixin.
- Inside an app there's one header (`AppHeader`): Home or Library, the title,
  then the stars and the gated gear, or a game's rounds and Again.

## Type

| Role | Font | Used for |
|---|---|---|
| `display-xl` | Fraunces | Big moments: "Lesson done!" |
| `display-l` | Fraunces | Section headings: "Luna's Lessons" |
| `display-m` | Fraunces | Screen titles in the header |
| `display-s` | Fraunces | Card, tile and modal titles |
| `cue` | Fraunces | The "?" in the ListenCue |
| `read` | Andika | Luna's lines, prompts, story text: anything a child reads to play |
| `label` | Andika, bold | Buttons, game and lesson names |
| `label-small` | Andika, bold | Chips and times, mostly for grown-ups |
| `tag` | Andika, bold, uppercase | Section labels and tags, never needed to play |
| `answer-word` | Andika, bold | Word choices |
| `answer-letter` | Andika, bold | Letter choices |

In code: `font: var(--text-read)` (each role is a whole `font` shorthand:
weight, size, line height and family). A tag adds `text-transform: uppercase`
and `letter-spacing: var(--tracking-tag)`. The families alone are
`--font-read` and `--font-display`. Both fonts are served from `public/fonts/`
(`src/styles/base/_fonts.scss`), and Fraunces is always set soft. The Kit page
shows every role with `I l 1 · a g`.

- **Why Andika:** it was made for beginning readers. `I`, `l` and `1` look
  different, and `a` and `g` are single-storey. Fredoka, the old font, drew `I`
  and `l` as the same plain stroke, which made the Letter Jar unfair.
- **Why Fraunces Soft** (`'SOFT' 100, 'WONK' 0`): warm, rounded titles that
  feel made by hand.

## Space

- **The scale:** one 4px scale, published as `--space-1` (4px) up to
  `--space-16` (64px).
- **The one primitive screens use directly:** space has no meaning beyond its
  size, so it needs no role.
- **Snapping the prototype:** its values sit on a 2px grid. When building from
  it, round each value up to the next step (6 becomes 8, 14 becomes 16), which
  is a little roomier for small hands.

## Shape

| Radius role | Used on |
|---|---|
| `chip` | Chips, pills, the prompt pill (fully round) |
| `tag` | Small tags ("Up next"), badges |
| `tile` | Buttons, small tiles, icon tiles |
| `card` | Cards, lesson cards, answer choices, panels |
| `stage` | The game stage and big panels |
| `arch` | The ListenCue, arched panels, Luna's window: round top, gentle bottom corners |

In code: `var(--radius-card)` and so on; the arch is `var(--radius-arch)`.

The arch is the motif: lesson cards, the "?" cue, the squishy shelf, Luna's
stages. The hand-cut uneven corners of the old reading app retire. The boho
feel comes from the arches, the colour and the paper.

## Elevation

| Level | What it looks like | Used for |
|---|---|---|
| **Flat** | No shadow | Wells, tracks, empty slots |
| **Card** | A thin hard ledge in the edge colour, plus a soft shade | Cards, tiles, panels, bubbles |
| **Lifted** | A deeper ledge plus a wide soft shade | Modals and the lesson-done panel only |

**Ledges** are the chunky feel: a solid band under a pressable thing, in a
deeper shade of its own colour. There are three depths: small for cards and
secondary buttons, medium for main buttons, large for answer choices. On press,
the thing sinks until its ledge is a hairline.

**The glow ring** is a soft halo, used for the "up next" card, a right answer
and the picked thing.

In code: `--elevation-flat`, `--elevation-card` and `--elevation-lifted` (each a
whole `box-shadow`), the ledge depths `--ledge-small`, `--ledge-medium` and
`--ledge-large`, `--press-depth`, and `--glow-ring`. The "up next" pulse uses
`--action-glow`. Border widths are `--border-hair`, `--border-regular` and
`--border-thick`.

## Touch

The minimums in the Rules come from five-year-old fingers. In practice, letter
choices are much bigger than 64px. The header's buttons are 48px, and nothing
sits in the 16px band around the screen's edge, where an iPad's case and swipes
get in the way.

In code: `--target-answer`, `--target-chrome`, `--target-gap` and
`--target-edge`. Anything you can tab to shows the `focus-ring` mixin from
`styles/mixins`.

## Motion

| Duration role | Used for |
|---|---|
| `tap` | Press and release |
| `quick` | Colour changes, small state changes |
| `emphasis` | The wrong-answer wobble, the right-answer pop |
| `enter` | Things arriving: cards, bubbles, Luna |
| `celebrate` | Big pops, stars landing |
| `petals` | Falling petals after a win |
| `loop` | The shortest ambient loop |
| `hold` | A grown-up's press and hold on a gated button (1.5s, SET-2; it was 2s with SET-1). A wait, not motion, so reduced motion keeps it |

- **In code:** durations are `--dur-tap` … `--dur-loop` and `--dur-hold`, easings `--ease-standard`,
  `--ease-springy`, `--ease-soft-spring`, `--ease-exit` and `--ease-in-out`, and
  each shared animation is a whole `--motion-*` shorthand. The keyframes live in
  `src/styles/motion/_keyframes.scss` (named `luna-*`). A JS timer uses
  `motionMs('emphasis')` or `afterMotion('emphasis', fn)` from
  `src/utils/motion.ts`. A pressable thing uses the `press` mixin from
  `styles/mixins`. The Kit page plays every one (Play again restarts them).
- **Easings:** `standard` for most things, `springy` for a pop with a little
  overshoot, `soft-spring` for bars filling, `exit` for things leaving.
- **The shared animations:** pop, wobble, glow, float, sway, twinkle, squish,
  shimmer, petal-fall, grow-in, burst (sparks out of a found "?", DES-22b),
  talk, blink (Luna's eyes, DES-15), open (an
  app window opening from the home screen, DES-9a), and glide-in and glide-out
  (the milestone moon arriving from the top corner and leaving, DES-17). Each is a `--motion-*`
  role, used as `animation: var(--motion-pop)`.
- **Luna's beak follows the voice:** the voice code reports when one of her
  clips starts and when the last one ends (`pronunciation.onSpeaking`, read
  through `useSpeaking()`), and the kit's Luna moves her beak only then.
  Screens don't drive it. `.claude/skills/know-how/luna-talk-check.mjs`
  proves it in a browser.

What the moments look like:
- **A win:** the answer pops, Luna hops, flowers grow up the sides of the stage
  and petals drift down, falling on into the next round's first second
  (DES-11; `components.md`, "A won round"). It never blocks the next tap.
- **Wrong:** a small wobble and the soft try-again tint, which clears when the
  wobble ends. Never red.
- **Rare things shimmer:** a light sweep and sparkles on rare tags and Pearl
  Moon.
- **Squishies squish** when tapped: squash, stretch, settle.
- **The milestone moon glides in,** says her line and glides out once her clip
  ends, about 3 seconds in all, over the done screen's empty space; she never
  takes a tap. Her mouth follows the voice as Luna's beak does, and Luna's
  beak stays still while she's there (DES-17). With reduced motion she appears
  and goes without gliding.
- **Reduced motion:** loops stop, petals and sparkles hide, and things fade
  instead of travelling. It comes from the Settings switch (Less Motion) or the
  iPad's setting (DES-6), as `data-reduced-motion` on `<html>`. Under it every
  duration role is `0ms` and every `--motion-*` is `none`; older styles end
  their animations at once (`base/_reduced-motion.scss`). Motion a game drives
  by script reads `isReducedMotion()` from `src/utils/motion.ts` and slows to
  `REDUCED_MOTION_PACE` (Bubble Sounds' bubbles). `npm run ui:shots --
  --reduced-motion` plays every screen with it on and fails if anything still
  moves.

## Layout

- **The four target sizes:** iPad landscape (1180×820), portrait (820×1180),
  the older iPad (1024×768) and the iPad mini (744×1133). `npm run ui:shots`
  captures all four.
- **Breakpoints:** two, settled in DES-10: `narrow` (the portrait iPads, up to
  899px wide) and `short` (the 1024×768 iPad, up to 799px tall). They're
  written once in the tokens and used only through the breakpoint mixin:
  `@use 'styles/mixins' as *;` then `@include bp(narrow) { … }`. Any other
  `@media` fails `npm run lint`. Reduced motion needs none: `[data-reduced-motion]`
  covers both the Settings switch and the iPad's setting.
- **Checking a layout:** `node .claude/skills/know-how/layout-audit.mjs 5199 <grade>`,
  with Vite on 5199, visits the library, every game and every lesson of a
  grade at the four sizes. It fails on anything that scrolls or is cut off
  mid-round, and on small, overlapping or edge-hugging targets outside a
  game's stage. It also lists those inside a stage, for the games' and
  lessons' own tickets.
- **Stacking:** the z roles, lowest first: `--z-ground`, `--z-raised`,
  `--z-float`, `--z-header`, `--z-celebrate` (the petals, which never take
  taps) and `--z-modal`. A won round's garden sits behind the stage's pieces
  instead, so it never covers an answer.
- **Chrome:** one 64px header inside an app, `components/os/AppHeader`
  (DES-8). It stays at the top while the screen under it scrolls. Inside an
  app there's no status bar and no home-indicator strip; the home screen keeps
  both.
- **The library:** the next lesson and Luna's Pick show without scrolling, and
  the Play Shelf sits on one even grid (DES-10).
