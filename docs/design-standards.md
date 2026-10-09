# Ms. Luna — Design standards

**Status:** draft for Alex's review (DES-2). Nothing here is final until Alex
approves it. The visual version is the style sample canvas:
<https://claude.ai/artifact/Gr1ngbrVdGS6xE4pALyWsm>. It shows four options
(A to D), each with a playable round, plus eight candidates for how Ms. Luna
looks (nine with option D's geometric owl).

Sections 3 to 9 currently hold **option A's** values. Once Alex picks an
option (or a mix), those sections take its values and the "Options" section
below shrinks to a record of the choice.

**Who it's for:** an ESL teacher's class. Reading English is the core, and
there are no school-subject apps. Any later app surrounds ESL reading
(speaking, listening, vocabulary), so the home screen leaves room for those.

## Options under review

All four keep the same rules (sections 5, 8, 10, 11 and 12):
- Andika for all reading.
- Heard, never shown.
- The same touch targets and motion timings.
- One kit of components.

| | A · Boho Classroom | B · Moonlit | C · Groovy Garden | D · Clear |
|---|---|---|---|---|
| **Mood** | Cosy classroom at golden hour | Bedtime story under the night sky | Sunny 70s flower power | Made by the iPad's own designers: crisp, calm, native |
| **Colours** | Terracotta, sage, mustard, clay, plum on oat | Indigo night, moon gold, blush, sea glass; cream reading pages | Tangerine, bubblegum, avocado, mustard; chocolate outlines | Vivid blue, green, yellow, indigo, used sparingly on white and light grey |
| **Titles** | Fraunces Soft | Young Serif | Caprasimo | The iPad's own rounded system font (Nunito where it's missing) |
| **Signature shape** | Arch | Circle, moon phases | Daisy; sticker outline with a hard shadow | Continuous-corner cards; frosted glass for floating controls only |
| **"?" cue** | Dashed arch | New moon that turns full | Bud that blooms | Listening card with a live sound wave, turns green with a drawn check |
| **Lesson path** | Arches, "Up next" glows | Moon phases, new to full | Sprout, bud, bloom | A row of cards and a progress ring |
| **Luna (as drawn)** | Owl, recoloured | The moon on a cloud | Fox in a scarf | A geometric owl made of circles |
| **Motion** | Gentle: bob, sway, sparkle | Drifting: twinkle, rise, star showers | Bouncy: squash, wiggle, petal bursts | Springs and blur-ins; wrong answers shake like a passcode |

Option D deliberately uses frosted glass, which section 1 otherwise rules
out. It keeps glass to the controls that float over content. It takes the
spirit of iPad design without copying Apple's assets: no logo, no SF Symbols,
and every icon is drawn for this app.

**Ms. Luna's look** is a separate choice. The characters can move between
options. The candidates are:
- the current owl;
- a rounder owl;
- the moon;
- a luna moth;
- a fox;
- a hedgehog;
- a moon cat;
- a person drawn like the real teacher.

Every candidate wears round glasses, blinks, and talks in time with her voice.

This is the one written source of truth for how the Learning Pad looks, reads
and moves. Every later screen change (DES-3 to DES-13, then the GAME and PRG
work) follows it. When code and this doc disagree, fix one of them; don't let
them drift.

---

## 1. Direction

The app should look made by hand, not generated. It drops what makes it read
as an AI-made site today:
- purple-to-pink gradient washes;
- glassy pills and glowing blobs;
- emoji standing in for icons;
- one card template repeated on every screen.

Two places, one family:

| | Home screen | Reading app |
|---|---|---|
| **Feel** | An iPad: status bar, widgets, app icons, dock | Luna's boho classroom: warm paper, earthy colour, arches and rainbows |
| **Ground** | Dusk-plum wallpaper of flat paper-cut shapes: moon, rainbow, hills | Oat paper with a faint grain |
| **Motion** | Slow ambient (twinkling stars, drifting moon, Luna's bob) | Feedback and celebration; calm while a child reads |

Both use the same colours, type, icons and components. Opening Reading should
feel like opening an app on the same iPad, not visiting another website.

**Three principles**
1. **Made by hand, not generated.** Flat paper shapes, drawn icons, real illustration. No gradient washes.
2. **Heard, never shown.** The arch with a "?" holds the place of whatever the child must find, until it is found (section 11).
3. **Calm until it matters.** Motion is for answers, celebrations and drawing the eye. Words a child is reading never move.

## 2. Theme decision

The `theme` setting (`sunset` / `day` / `cosmic`) is saved, but nothing reads
it except a class name on the app root that no stylesheet uses.

**Proposal: drop it.** One look, done well, beats three half-looks. The home
wallpaper already gives a dusk mood. DES-3 removes the setting, its type and
the `theme-*` class.

## 3. Colour

### Palette

| Token | Hex | Use |
|---|---|---|
| `oat` | `#F6EEE3` | Ground of every reading-app screen |
| `linen` | `#FFFBF5` | Cards, tiles, buttons, bubbles |
| `sand` | `#EADBC8` | Borders, the chunky edge on light parts, empty wells |
| `ink` | `#3D2C25` | All main text |
| `ink-soft` | `#6B5649` | Secondary text, captions |
| `terracotta` / `terracotta-deep` | `#B65535` / `#8E3F25` | Action: primary buttons, "up next", the "?" |
| `sage` / `sage-deep` | `#8FAA8A` / `#4E6E4B` | Right answers, done |
| `mustard` / `mustard-deep` | `#E3AA3E` / `#9A6A12` | Stars, Luna's Pick, "revealed", tags |
| `clay` / `clay-deep` | `#E6AE9F` / `#A6584A` | Try again (gentle, never alarm red) |
| `plum` / `plum-deep` | `#6E5A7C` / `#4D3E58` | Luna, the home-screen sky |
| `dusk` / `dusk-deep` | `#5B7C93` / `#3F5F75` | Focus rings, info |

**Tints**, used only for picture areas, wells and tags:
- sage `#DCE6DA`
- clay `#F3D9D1`
- mustard `#F6E3C0`
- plum `#E4DCE8`
- dusk `#D8E2E9`

The `-deep` shade of each colour is its pressed edge (the chunky bottom
border) and its text colour on light grounds.

### Semantic tokens (what DES-3 builds)

| Role | Token | Value |
|---|---|---|
| Ground | `--surface-ground` | oat |
| Card | `--surface-card` | linen |
| Edge | `--edge` | sand |
| Text | `--ink`, `--ink-soft` | ink, ink-soft |
| Action | `--accent`, `--accent-edge` | terracotta, terracotta-deep |
| Success | `--success`, `--success-edge` | sage-deep fill, `#3A5338` edge |
| Retry | `--retry`, `--retry-edge` | clay tint fill, clay-deep border |
| Highlight | `--highlight`, `--highlight-edge` | mustard, mustard-deep |
| Focus | `--focus` | dusk-deep, 3px ring, 3–4px offset |
| Disabled | (opacity) | 40–45% opacity of the normal state |

### Contrast (WCAG AA, checked)

| Pairing | Ratio |
|---|---|
| ink on oat | 11.5 |
| ink on linen | 12.9 |
| ink-soft on oat | 6.0 |
| white on terracotta | 4.8 |
| white on sage-deep | 5.7 |
| ink on mustard | 6.4 |
| ink on clay | 6.9 |
| white on plum | 6.2 |
| dusk-deep on linen | 6.6 |

Rules:
- Text never sits on plain `dusk` (4.4); use `dusk-deep`.
- Right and wrong never differ by colour alone. Right also gets a check, a
  glow and a pop; wrong gets a wobble. Sage and clay also differ in lightness.

## 4. Type

Two families, both self-hosted (DES-4):

- **Fraunces**, with its Soft axis at 100 and Wonk at 0: titles and headings only.
- **Andika**: everything else, above all whatever a child reads. It was built
  for beginning readers: `I`, `l` and `1` look different, and `a` and `g` are
  single-storey. Today, in Fredoka, `I` and `l` are both a plain stroke.

Fredoka and Nunito retire.

| Style | Font | Size / line height | Use |
|---|---|---|---|
| display-xl | Fraunces 650 | 48 / 1.05 | Reward title |
| display-l | Fraunces 650 | 32 / 1.1 | Screen titles |
| display-m | Fraunces 600 | 25 / 1.15 | Section headings ("Luna's Lessons") |
| display-s | Fraunces 600 | 22 / 1.2 | Card, modal and game-bar titles |
| read-l | Andika 400 | 21 / 1.35 | Luna's bubble, prompts, story text |
| label | Andika 700 | 17 / 1.3 | Buttons, tile titles, chips |
| caption | Andika 400 | 14 / 1.35 | Grown-up notes only |
| answer-word | Andika 700 | 40 | Word choices |
| answer-letter | Andika 700 | 64–76 | Letter choices |

**Minimums:**
- 20px for text a child must read to play: Luna's lines, prompts, stories.
- 32px for answer words.
- 48px for answer letters.

Chrome and tile labels may be smaller (15px or more) only when an icon or
picture carries the same meaning.

## 5. Touch targets

- Answer choices are at least 64×64px (letters 112–136px in practice), with at least 12px between them.
- Chrome (Home, Library, Again, gear) is at least 48×48px.
- Nothing a child must hit sits within 16px of the screen edge.

## 6. Spacing and corners

**Spacing:** a 4px scale: 4, 8, 12, 16, 24, 32, 48, 64. Screen gutters are
24–32px, and card padding 16–28px.

**Corners:**

| Token | Radius | Used on |
|---|---|---|
| `sm` | 10px | Chips, tags |
| `md` | 16px | Buttons, small tiles |
| `lg` | 24px | Cards, answer tiles |
| `xl` | 30px | Game stages, home widgets |
| `pill` | 999px | Pill shapes |
| `arch` | `999px 999px lg lg` | ListenCue, the lesson path, Luna's window: the signature shape |

The hand-cut, uneven card corners in `_world.scss` retire for these even radii.
The boho feel comes from the arches, colour and paper shapes instead.

## 7. Elevation

Three levels, no more:

| Level | Shadow | Used for |
|---|---|---|
| **Flat** | none | Wells, tracks, empty slots |
| **Card** | `0 3px 0 sand, 0 8px 18px rgba(61,44,37,.08)` | Tiles, panels, bubbles |
| **Lifted** | `0 5px 0 sand, 0 18px 36px rgba(61,44,37,.16)` | Modals and nothing else |

**Chunky buttons** use a solid edge in the colour's `-deep` shade
(`0 5px 0 <deep>`). On press they sink 4px and the edge shrinks to 1px.

## 8. Motion

Tokens live in `_motion.scss` (DES-5).

| Token | Duration | Used for |
|---|---|---|
| `tap` | 120ms | Press and release |
| `enter` | 240ms | Things arriving |
| `emphasis` | 400ms | Wrong-answer wobble, right-answer pop |
| `celebrate` | 700ms | Sparkle bursts, reward stars |

**Easing:**
- standard: `cubic-bezier(0.2, 0, 0, 1)`
- springy: `cubic-bezier(0.34, 1.56, 0.64, 1)`, for pop
- exit: `cubic-bezier(0.4, 0, 1, 1)`

**Shared keyframes:** pop-in, wobble, float, bounce, glow, burst.

**Rules:**
- Motion is for feedback, celebration and drawing attention.
- Things the child is reading never move. The one exception is Bubble Sounds, where the movement is the game.
- Ambient loops are slow (4s or more) and pause during play.
- Celebrations finish within 1.5s and never block input for the next round.
- Luna's talking animation follows the audio.
- Reduced motion, from the setting or the device, turns off every loop and transform and skips confetti (DES-6).

## 9. Icons, pictures and Luna

**Icons:**
- One drawn stroke set on a 24px grid: 2.2px stroke, round caps and joins, `currentColor`.
- `components/ui/Icons.tsx` is the start of it. Every UI icon comes from that set, never an emoji.

**Pictures:**
- Game and lesson tiles get simple flat illustrations in palette colours.
- Emoji pictures of words (🐱 for "cat") stay as content for now. Replacing them is a separate decision.
- Decoration is flat paper-cut shapes (rainbow arches, blobs, moon), kept to the edges and never behind text a child reads.

**Luna:**
- The same drawing (`LunaOwl`), recoloured to dusk plum, with mustard beak and feet, terracotta glasses and clay blush.
- At most one Luna on a screen (DES-12).
- The emoji owl (`components/ui/Mascot`) retires.

## 10. Copy voice

- Kid-facing text is short and spoken by Luna. Every line a child sees, Luna can say.
- Grown-up text (learning objectives, settings, grade descriptions) is plain and lives behind the grown-up gate (SET-1).
- No grown-up jargon on child screens: no "digraphs", no "dashboard".

## 11. Heard, never shown

What the child is looking for is heard, never shown, at every grade.

- **Before it's found,** the **ListenCue** holds its place: a terracotta dashed arch with an ear, a large "?" and "tap to listen". Tapping it says the target again.
- **After it's solved,** the arch turns sage and shows the answer, with "found it!".
- No target letter, sound (`/m/`), word-to-find, or name under an answer picture appears before the round is solved.
- Hints are spoken (`SpeechPart[]`), never written. On screen a hint is only a "Hear my clue" button.
- The "revealed" Choice state (FB-2) is the only time the app points at the answer unprompted: a mustard dashed ring, after repeated misses.

## 12. Components (DES-7)

Everything is built from one kit in `src/components/kit/`.

| Component | What it is |
|---|---|
| `ChunkyButton` | Variants: primary (terracotta), secondary (linen), highlight (mustard), quiet (dashed outline), icon (56px). Every one has a press state. |
| `Choice` | One answer, as a letter, word or picture. States: idle, pressed, wrong, right, revealed, disabled. This is the only answer button in the app. |
| `ListenCue` | The "?" arch (section 11). |
| `SpeechBubble` | Luna's line in a linen bubble with a tail, with an optional "Hear my clue" button. |
| `PaperCard` / `Tile` | The card surface. A tile is a card with a picture area and a title. |
| `Chip` | Small selectable options (difficulty), plus tags ("Up next") and counters (stars). |
| `Modal` | A lifted card with a 48px close button. |

## 13. Layout and chrome

- **Inside an app,** one 64px header holds Home or Library, the title, the grade chip, stars and the gear (gated). The status bar shrinks to the clock and Luna's voice status (DES-8).
- **Hub:** at 1180×820, the next lesson and Luna's Pick are visible without scrolling. Games sit on one even grid (DES-10).
- **Target sizes:** every screen works at 1180×820, 820×1180, 1024×768 and 744×1133. Check with `npm run ui:shots`.

---

## Appendix: what this replaces (audit, 2026-10-08)

Taken from the code and the `ui:shots` before set.

**Two looks:**
- The tablet shell, Settings, Trophies and Grade Select use a slate-and-purple OS style (`src/styles/_variables.scss`) and the emoji owl.
- The reading app uses warm paper and wood (`apps/reading/engine/_world.scss`) and the drawn owl. It has its own purple (`$plum`) as well.

**Scattered values:**

| What | Count today |
|---|---|
| Stylesheets | 24, 5,348 lines (534 of them in a never-imported `App.css`) |
| Unique hex colours | 185, plus 258 `rgba()` uses |
| `@keyframes` | 62, in 11 files |
| Distinct values | 56 font sizes, 50 border radii, 71 box shadows, about 45 durations |
| Fonts | Fredoka and Nunito, loaded from Google Fonts at runtime |
| Reduced motion | Honoured in only 4 files |

**Repeated templates:**
- Answer buttons are styled six separate ways: `lesson-choice`, `cookie`, `treasure-option`, `missing-choice`, `story-answer` and `word-tile`.
- Every game's start screen is the same centred card: an emoji in a circle, a dashed quote box, three chips and a big green button. That green belongs to neither palette.

**Chrome:**
- Inside an app there are two header bars.
- Stars, mute and the voice indicator each appear twice.
- There are four ways home.

**What reads as AI-made:**
- The home screen's purple-to-pink gradient with blurred blobs.
- Gradient squircle icons.
- Emoji lanterns and emoji icons on tiles.
- "Choose your adventure" style badges.
- The one template used on every start screen.
