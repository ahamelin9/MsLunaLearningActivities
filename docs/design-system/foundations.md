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
- Inside an app there's one header: Home or Library, the title, stars, and the
  gated gear.

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

## Touch

The minimums in the Rules come from five-year-old fingers. In practice, letter
choices are much bigger than 64px. The header's buttons are 48px, and nothing
sits in the 16px band around the screen's edge, where an iPad's case and swipes
get in the way.

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

- **Easings:** `standard` for most things, `springy` for a pop with a little
  overshoot, `soft-spring` for bars filling, `exit` for things leaving.
- **The shared animations:** pop, wobble, glow, float, sway, twinkle, squish,
  shimmer, petal-fall, grow-in and talk. Each is a `--motion-*` role, used as
  `animation: var(--motion-pop)`.

What the moments look like:
- **A win:** the answer pops, Luna hops, flowers grow up the sides of the stage
  and petals drift down. It never blocks the next tap.
- **Wrong:** a small wobble and the soft try-again tint, which clears when the
  wobble ends. Never red.
- **Rare things shimmer:** a light sweep and sparkles on rare tags and Pearl
  Moon.
- **Squishies squish** when tapped: squash, stretch, settle.
- **The milestone moon glides in,** says her line and glides out (DES-17).
- **Reduced motion:** loops stop, petals and sparkles hide, and things fade
  instead of travelling. It comes from the Settings switch or the iPad's
  setting (DES-6).

## Layout

- **The four target sizes:** iPad landscape (1180×820), portrait (820×1180),
  the older iPad (1024×768) and the iPad mini (744×1133). `npm run ui:shots`
  captures all four.
- **Breakpoints:** as few as those four sizes need, decided in DES-10. They're
  written once in the tokens and used only through the breakpoint mixin.
- **Chrome:** one 64px header inside an app. The status bar shrinks to the
  clock (DES-8).
- **The library:** the next lesson and Luna's Pick show without scrolling, and
  the Play Shelf sits on one even grid (DES-10).
