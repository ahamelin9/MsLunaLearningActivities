# DES — Design system & layout (Phase 1)

**Goal:** the whole app looks and moves like one product, designed by hand
rather than generic AI-made. The home screen keeps its iPad feel, and the
reading app is boho, modern and animated (see DES-2). Today there are two looks:
- the tablet shell, Settings, Trophies and Grade Select use a generic slate and
  purple style (`src/styles/_variables.scss`) with an emoji owl;
- the reading app uses warm paper, wood and ink
  (`src/apps/reading/engine/_world.scss`) with the illustrated `LunaOwl`.

On top of that:
- about 270 colours are hard-coded across the stylesheets;
- 62 `@keyframes` are spread over 11 files, with no shared timings;
- reduced motion is honoured in only 4 files.

**The epic is done when** every screen uses the shared tokens, components and
motion, and looks right at the four target sizes (DES-10).

### DES-2 · Write the design standards
Story · P0 · M · needs: —
- **Why:** one written source of truth, so every later screen is built the same way.
- **How:** write `docs/design-standards.md` covering each item below. The values are proposals, to confirm with Alex.
  - **Direction (Alex, 2026-10-08):** a full redesign. Today it reads as a generic AI-made site, and it should stop: no glassy gradients, stock pills or emoji standing in for icons.
    - **Home screen:** keeps the iPad feel (status bar, springboard, app icon, home indicator), restyled in the same family as the reading app. The purple-gradient OS look retires. **Teacher (2026-10-09):** keep it simple like today, with just the one Reading app. A little more than today is fine, since it's her app, but no wall of widgets.
    - **Reading app:** boho and modern, and animated. **Teacher (2026-10-09):** option A Boho, but in lighter tans and browns instead of the rainbow (cream, oat, sand, latte, caramel, cocoa). No rainbow arches. Paper texture and hand-drawn touches stay, with motion from DES-5.
    - **Lessons grow from seeds to flowers** (teacher, 2026-10-09, from option C): a lesson starts as a seed and blooms once it's learned, so the child can see what they've learned. Goes into DES-13.
    - **Built from shared components** (DES-7), so later screens are quicker to make and stay consistent.
    - **ESL first (Alex, 2026-10-08):** this is an ESL teacher's app and reading is the core. No school subjects; any later apps surround ESL reading.
    - **Four options** (A Boho Classroom, B Moonlit, C Groovy Garden, D Clear, which is iPad-native) share these rules and differ in mood. Ms. Luna's look (8 candidates, plus D's geometric owl) is a separate choice. The teacher decides, picking one option or combining them, and Alex passes the decision on. The doc then records it.
  - **Theme decision:** the `theme` setting (sunset/day/cosmic) is unused. **Decided (Alex, 2026-10-09):** a real light and dark pair (DES-16), so sunset/day/cosmic goes. DES-3 builds the tokens for both.
  - **Colour:** semantic tokens (surface, ink, accent, success, retry, focus, disabled) mapped onto the world palette. Text meets WCAG AA (4.5:1).
  - **Type scale:** display font for titles. Text the child reads uses a literacy font (DES-4). Minimums: kid-read text 20px, answer words 32px, answer letters 48px.
  - **Touch targets:** answer choices at least 64×64px with at least 12px between them; chrome at least 48px. Nothing a child must hit sits within 16px of the screen edge.
  - **Spacing and radius:** a 4px-based scale; the paper-card radius and the chunky-button edge from `_world.scss`.
  - **Elevation:** three levels at most (flat, card, lifted).
  - **Motion:** links to DES-5.
  - **Copy voice:** kid-facing text is short and spoken by Luna. Grown-up text (objectives, settings) is plain and lives behind the gate (SET-1).
  - **Heard, never shown:** how a hidden target looks (the "?" cue), and what may appear only after a round is solved.
- **Progress (2026-10-08):**
  - **Done:**
    - Full audit of today's styles, written up as the appendix of `docs/design-standards.md`: 185 hex colours, 62 keyframes, 56 font sizes, six answer-button styles, two looks.
    - `docs/design-standards.md` drafted, covering every item above, with option A's values filled in.
    - Style sample canvas built: <https://claude.ai/artifact/Gr1ngbrVdGS6xE4pALyWsm>. Four options, each with a direction board, iPad home screen, library and a playable round, all animated. There's a component sheet for A and a "Who is Ms. Luna?" page with 8 characters; D adds a ninth, a geometric owl.
    - Every palette checked for WCAG AA contrast.
  - **Teacher's feedback (2026-10-09):** option A Boho in light tans and browns, a simple home screen, seeds to flowers for lessons. For Luna, a second round of characters:
    - **Row 1:** the rounder owl (candidate 2), in black glasses, in a few variations.
    - **Row 2:** a crescent moon, with a face and without one.
    - Also asked for: squishies instead of the sticker tin (PRG-5), and time per lesson, before and after (PRG-6).
  - **Round 2 published (2026-10-09):** a new first page on the same canvas, "Round 2 · Teacher's picks" (<https://claude.ai/artifact/Gr1ngbrVdGS6xE4pALyWsm>), with 8 screens in the sand-and-cocoa palette: the look, the home screen twice (just the app; a little more), the library with the lesson garden and times, a round, the lesson-done screen, the squishy shelf, and 8 characters (4 owls in black glasses, 4 crescent moons). Round 1 stays on its own pages. Every text colour passes WCAG AA.
  - **Round 2 feedback (Alex, 2026-10-09), added to the same page:**
    - **Light and dark on every screen:** a Light/Dark button in the prototype's bar. Every colour has a dark twin under the same role name (card, ground, edge, ink, action…), so components never hard-code a colour. At night the home screen shows a crescent moon and stars.
    - **The moon breaks the palette:** moons are moon gold (#F2CF63) on a cocoa night, so they read as moons. It's the one colour outside the palette, and only the moon wears it.
    - **Round:** a solved round grows flowers up both sides of the stage, and petals fall instead of confetti. The done screen uses the same petals.
    - **Done screen:** the rare-colour tag shimmers and sparkles.
    - **Squishy shelf:** easier squishies not found yet show as greyed shapes, harder ones as "?". Each squishy has colour dots, with "?" for colours still to find. A last, secret squishy ("Pearl Moon") sits at the top of the arch.
    - **Flowers board (new):** six roses (red, blush, cream, coral, yellow, dried mauve), a red rose through the lesson stages, a mixed-garden idea, and six other flowers. Rose is her favourite.
    - **"Feed Luna" renamed** on the Play Shelf; "Letter Cookies" is a placeholder (GAME-6).
  - **Later the same day (Alex, 2026-10-09):**
    - **The canvas's own button switches light/dark too.** Signed-out viewers don't get that button, so the prototype keeps its own.
    - **No "Luna is ready"** on the home screen (DES-8).
    - **Library:** Luna's greeting is spoken, not an always-on bubble; tap her to hear it again (DES-12). The space holds a Squishy Shelf card showing the last three squishies and the count, which opens the shelf.
    - **Home, a little more:** tapping the bunny squishes her, and a "My shelf" button pops up (PRG-5).
  - **Prototype source and the design skill:** `.claude/skills/luna-design/`. `SKILL.md` holds the direction, the decisions so far, the open questions (// TODO) and how to change the prototype. `prototype/` holds the generator that builds the round 2 boards.
  - **Now (Alex, 2026-10-09):** the prototype is the main focus until the teacher gives her final approval, because everything else builds on it. The teacher sees round 2 on 2026-10-10.
  - **Waiting on, from the teacher:** her pick of character, home screen and flower, and the cookie game's name.
  - **Then:**
    - Fold the choice into sections 3–9 of the doc.
    - Settle the theme setting (proposal: drop it).
    - Copy the decisions into DES-3 to DES-7.
    - Get Alex's sign-off.
- **Complete when:** the teacher's choice of option and character is recorded in `docs/design-standards.md`, Alex approves the doc, and the decisions are copied into DES-3 to DES-7.

### DES-3 · One set of design tokens
Story · P0 · M · needs: DES-2
- **How:**
  - Create `src/styles/_tokens.scss` with SCSS variables plus CSS custom properties on `:root`.
  - Fold in `_variables.scss` and `_world.scss`, then move every stylesheet onto the tokens.
  - Delete the unused palette, and implement the theme decision from DES-2.
  - Name tokens by role, not colour (card, ground, edge, soil, ink, soft ink, accent, action, pressed, right, try again, rare, super rare, moon), each with a light and a dark value, as on the round 2 Look board.
- **Complete when:** searching for hex colours outside `_tokens.scss` finds only illustration art (LunaOwl, scenery), with a comment marking each exception, and every token has both a light and a dark value.

### DES-4 · Typography and local fonts
Story · P0 · S · needs: DES-2
- **Why:**
  - Fredoka and Nunito load from Google Fonts. On an offline classroom tablet they fall back to system fonts.
  - In Fredoka, lowercase `l` and capital `I` are both a plain stroke, so the Letter Jar can be unfair.
- **How:**
  - Self-host the fonts under `public/fonts/` (woff2, `font-display: swap`).
  - Pick a literacy font for letters and words the child must read. Andika is built for beginning readers: distinct I/l/1 and a single-storey a/g.
  - Apply the type scale from DES-2.
- **Complete when:** the app shows the right fonts with the network off, and I/l are visibly different on letter tiles.

### DES-5 · Motion system
Story · P0 · M · needs: DES-2
- **How:**
  - Create `src/styles/_motion.scss` with timing tokens: tap 120ms, enter 240ms, emphasis 400ms, celebrate 700ms.
  - Add easing tokens (standard, springy, exit) and shared keyframes (pop-in, wobble, shake, float, bounce, glow).
  - Replace the 62 scattered `@keyframes` with these.
- **Rules to write into DES-2:**
  - Motion is for feedback, celebration and drawing attention.
  - Things the child is reading never move, except in Bubble Sounds, where movement is the game.
  - Ambient loops are slow (4s or more) and pause during play.
  - Celebrations finish within 1.5s and never block input for the next round.
  - Luna's talking animation follows the audio.
- **Complete when:** every animation uses the tokens, and no stylesheet defines a keyframe that `_motion.scss` already has.

### DES-6 · Reduced motion, wired end to end
Story · P0 · S · needs: DES-5
- **Why:** the `reducedMotion` setting is saved but never read. The device setting is ignored in `games.scss`, the confetti, and the home-screen glow bubbles.
- **How:**
  - Set `data-reduced-motion` on the app root from either the setting or `prefers-reduced-motion`.
  - Have `_motion.scss` drop transforms and loops under it, and skip confetti.
  - Bubble Sounds slows its bubbles down instead of stopping them.
  - Add the toggle to Settings, behind the gate from SET-1.
- **Complete when:** with the flag on, no screen has continuous motion and every game is still playable.

### DES-7 · Shared component kit
Story · P0 · M · needs: DES-3, DES-5
- **Why:** answer buttons are styled six separate ways: `lesson-choice`, `cookie`, `treasure-option`, `missing-choice`, `story-answer` and `word-tile`. `components/ui/Button` is in the old OS style.
- **How:**
  - Build `src/components/kit/` with these components:
    - `ChunkyButton` and `PaperCard`
    - `Chip` and `Tile`
    - `Modal` and `SpeechBubble`
    - `ListenCue` (the "?" placeholder)
    - `Choice`, with idle, pressed, wrong, right, revealed and disabled states
  - Games and lessons use these components, and keep only the visuals that are specific to them.
- **Complete when:** every answer button in every game and lesson is a `Choice`, and `components/ui/Button` is gone.

### DES-8 · One set of chrome
Story · P0 · M · needs: DES-7
- **Why:** inside the app there are two header bars, stars and mute shown twice, `VoiceIndicator` shown twice, and four ways home: the status pill, the Home button, the home-indicator bar, and "Library". Together these take about 130px of an 820px-tall screen.
- **How:**
  - Inside an app: one header with Home, the title, stars, and the settings gear (gated).
  - The status bar shrinks to the clock, or disappears. The "Luna is ready" voice indicator goes too (Alex, 2026-10-09: the problem it flagged is fixed).
  - Keep one way home plus "Library" inside games.
  - Fix BUG-11 while you're in there.
- **Complete when:** each control appears exactly once, and the game stage gets back at least 80px of height in landscape.

### DES-9 · Restyle the tablet shell: iPad feel, boho finish
Story · P0 · L · needs: DES-7, DES-8, DES-15 · split before starting
- **Scope:**
  - Home screen
  - Status bar and header
  - Settings
  - Trophy room
  - Grade Select
- **How:** the home screen keeps its iPad feel (Alex, 2026-10-08) but drops the purple gradients for the DES-2 palette. It stays simple like today, with the one Reading app in the middle (teacher, 2026-10-09), plus the small extras on the round 2 home board in the style sample. No school-subject apps (OPS-3), with room for future ESL companion apps. Use kit components and tokens throughout. Replace the emoji owl `components/ui/Mascot` with the chosen Luna (DES-15). Grade Select talks to the child, not to grown-ups: no "digraphs" and no "dashboard".
- **Complete when:** the `ui:shots` screenshots show no slate or purple-gradient screens, and `Mascot` is deleted.

### DES-10 · Layout grid and breakpoints
Story · P0 · M · needs: DES-7
- **How:**
  - Lay out the hub and game stage for the four `ui:shots` sizes (1180×820, 820×1180, 1024×768, 744×1133).
  - Hub: the next lesson and Luna's Pick are visible without scrolling.
  - Play Rug: tiles sit on a consistent grid. Titles must not overlap their scenery (they do today on Feed Luna and Muddled Cards), and Treasure Path's tile must not be oversized.
  - Game stages fit the screen with no scrolling during play.
- **Complete when:** at all four sizes, nothing overlaps, nothing scrolls mid-round, and all touch targets meet DES-2.

### DES-11 · One right/wrong/reveal visual language
Story · P1 · S · needs: DES-5, DES-7
- **How:** use the same right glow, wrong wobble, win veil and "revealed" style (for FB-2) in every game and lesson, through `Choice` and the shell's flash.
  - **A win grows flowers (Alex, 2026-10-09):** a solved round grows a few flowers up the sides of the stage, and petals fall instead of confetti, as on the round 2 Round board. The lesson-done screen uses the same petals. Flowers and petals never cover the answer choices or block the next tap.
- **Complete when:** a right answer and a wrong answer look the same in all 8 games and 8 lesson types, and every solved round grows flowers and drops petals, with no confetti left anywhere.

### DES-12 · Luna on screen: one Luna, clear moods
Story · P1 · S · needs: DES-9, DES-15
- **Why:** Feed Luna shows two owls at once (the one on the stage and the one on the perch).
- **How:** at most one Luna per screen; the perch Luna hides when the game's stage has its own. Document what each mood is for. Make sure the talking animation always follows the audio.
  - **Spoken, not shown (Alex, 2026-10-09):** where space is tight, as on the library, Luna's greeting is spoken with no always-on speech bubble. A small speaker mark shows she talks, and tapping her says it again.
- **Complete when:** no screen shows two Lunas.

### DES-13 · Lesson path on the hub: seeds to flowers
Story · P1 · S · needs: DES-10
- **Why:** the teacher liked option C's garden (2026-10-09): seeing a lesson bloom is how a child knows they learned it.
- **How:** show the lessons as a garden path. Each lesson is a plant:
  - **Not started:** a seed in the soil, open but quieter.
  - **Up next:** a sprout that glows, with an "Up next" label.
  - **Started, not finished:** a bud.
  - **Done:** a flower in bloom. Which flower is the teacher's pick from the round 2 Flowers board: the rose is her favourite (red, or another colour), or a mixed garden with a different flower per lesson.
  - Finishing a lesson plays a short bloom (DES-5; a plain swap with reduced motion), and the glow moves to the next seed.
- **Complete when:** a new child sees Lesson 1 as a glowing sprout marked "Up next" and the rest as seeds; finishing it shows it in bloom and moves "Up next" to Lesson 2; a lesson left part-way shows a bud.

### DES-14 · Feed Luna's cookies look like real, different cookies
Story · P2 · S · needs: DES-7
- **Why:** every cookie is the same flat brown circle, which doesn't read as a picture (Alex, 2026-10-09).
- **How:** a few cookie designs (chocolate chip, sprinkles, jam, and so on), mixed in each round, drawn in the DES-2 style. The letter stays just as easy to read.
- **Complete when:** a round shows at least two different cookie designs, and every letter still meets the DES-2 type minimums.

### DES-16 · Light and dark mode
Story · P1 · M · needs: DES-3, SET-1
- **Why:** Alex wants a real dark mode (2026-10-09), and building the components on role tokens from the start keeps every screen working in both.
- **How:**
  - Follow the iPad's light/dark setting by default. A grown-up can choose Light, Dark or "Match the iPad" in Settings, behind the gate (SET-1).
  - Every screen uses the role tokens from DES-3 only. Illustrations (Luna, squishies, flowers) keep their own colours.
  - At night the home screen shows a crescent moon in moon gold and twinkling stars instead of the sun (round 2 Home board).
  - With reduced motion (DES-6) the stars don't twinkle.
- **Complete when:**
  - with the iPad set to dark, every screen shows the dark set, and switching back shows the light set without a reload;
  - a check over the tokens finds every text pairing at 4.5:1 or more in both modes;
  - the home screen shows the moon and stars in dark mode and the sun in light mode;
  - the Settings choice overrides the iPad and survives a reload.

### DES-15 · Draw the chosen Ms. Luna
Story · P0 · M · needs: DES-2
- **Why:** the teacher is choosing a new look for Luna (round 2, 2026-10-09): the rounder owl in black glasses, or a crescent moon with or without a face. Today's `LunaOwl` drawing and the emoji `components/ui/Mascot` both retire.
- **How:**
  - Redraw `engine/LunaOwl.tsx` as the chosen character, in the DES-2 palette. If she's no longer an owl, rename it to `Luna`.
  - Keep all 8 moods (idle, happy, cheer, think, oops, surprise, listen, sleepy), the blink, and the talking animation, which follows the audio.
  - A moon without a face shows mood through motion and glow instead (a tilt, a bounce, a brighter glow when she cheers).
  - A moon is moon gold (#F2CF63), the one colour outside the palette, so she reads as a moon in light and dark (Alex, 2026-10-09).
- **Complete when:** the character the teacher picked appears on every screen that shows Luna, each of the 8 moods looks different, and she only moves her mouth (or glows, for a faceless moon) while a clip is playing.
