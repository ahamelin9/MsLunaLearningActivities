---
name: luna-design
description: Ms. Luna's design direction and how we build and change the style sample, the prototype canvas the teacher reviews. Use for any visual or UI work on Ms. Luna (screens, colours, type, motion, Luna's character, the lesson garden, squishies and rewards, light and dark mode) and whenever the teacher's feedback means updating the prototype. Still a skeleton; parts marked // TODO wait on the teacher's final approval (DES-2).
---

# Ms. Luna design

> **Status: skeleton, 2026-10-09.** The direction is chosen and round 2 of the
> style sample is with the teacher. Anything marked `// TODO` waits for her
> final approval (DES-2). When she approves, fill those in here **and** in
> `docs/design-standards.md`, then copy the decisions into DES-3 to DES-7.

## Where things live

| What | Where |
|---|---|
| Tickets and decisions | `kanban/epics/DES.md` (and PRG-4/5/6 in `PRG.md`, GAME-6 in `GAME.md`); status on the board in `kanban/README.md` |
| The full written standards | `docs/design-standards.md`. // TODO: still holds round 1 option A (the terracotta palette); update after approval |
| The style sample (prototype canvas) | <https://claude.ai/artifact/Gr1ngbrVdGS6xE4pALyWsm>, page "Round 2 · Teacher's picks" (the link opens on it). Round 1 (options A–D, 8 Lunas) stays on its own pages |
| Prototype source | `prototype/` next to this file. See "Changing the prototype" |

**Who decides:** the teacher picks the look, Alex passes her feedback on, and
Alex sets priorities. While her approval is pending, the prototype is the main
focus (Alex, 2026-10-09).

**Where new learnings go:** design decisions and prototype how-tos go here;
problems that took troubleshooting go in `know-how`; Alex's and the teacher's
preferences go in memory. The `wrap-up` skill has the full table.

---

## Design philosophy (where we're leaning)

1. **ESL reading first.** This is an ESL teacher's app; reading is the core. No school subjects, ever. Later apps are ESL companions (Writing is next, WRT).
2. **Made by hand, not generated.** Flat paper shapes, drawn icons, a little texture. No gradient washes, glassy pills, or emoji standing in for icons.
3. **Boho, in sand and cocoa.** Light tans and browns, soft arches, pampas grass. No rainbow (the teacher, 2026-10-09).
4. **Heard, never shown.** Targets and answers are spoken, never written before the round is solved. Hints are spoken. Kids can't read the chatter anyway, so where space is tight Luna *says* it instead of showing a bubble (tap her to hear it again).
5. **Simple for a five-year-old.** One app on the home screen, big targets, one clear way in to everything. Grown-up things (settings, times in detail) sit behind the gate.
6. **Calm until it matters.** Motion is for feedback, wins and drawing the eye. Words a child is reading never move. Ambient loops are slow.
7. **Progress you can see.** Lessons grow from seeds to flowers. Time is visible: about how long before, how long it took after.
8. **Collecting is joyful.** Squishies with rare colours, a shelf with things still to find, and a secret last one.
9. **Light and dark from day one.** Components only use role tokens (card, ink, action…), never raw colours, so every screen works in both.
10. **The moon is the one colour that breaks the palette.** Moon gold, so a moon reads as a moon. Nothing else gets to.

---

## Decisions so far

| Date | Decision | Who |
|---|---|---|
| 2026-10-08 | Full redesign. Home keeps its iPad feel; the reading app goes boho and modern | Alex |
| 2026-10-09 | Option A Boho, recoloured light tans and browns, no rainbow | Teacher |
| 2026-10-09 | Home screen stays simple: the one Reading app, maybe a little more | Teacher |
| 2026-10-09 | Lessons grow seed → sprout → bud → flower | Teacher |
| 2026-10-09 | Squishies replace emoji stickers, with rare colours | Teacher |
| 2026-10-09 | Time per lesson shown before and after | Teacher |
| 2026-10-09 | Luna: round 2 is the rounder owl in black glasses, or a crescent moon (with or without a face) | Teacher |
| 2026-10-09 | A real light/dark pair; the unused sunset/day/cosmic setting goes | Alex |
| 2026-10-09 | A win grows flowers and drops petals; no confetti | Alex |
| 2026-10-09 | No "Luna is ready" indicator (the problem it flagged is fixed) | Alex |
| 2026-10-09 | The squishy shelf has a card on the library; the home bunny leads to it | Alex |

## Open questions // TODO

- [ ] Luna's character: which owl, or which moon? (round 2, Ms. Luna board) → DES-15
- [ ] Home screen: "just the app" or "a little more"? → DES-9
- [ ] Lesson flower: which rose colour, another flower, or a mixed garden? → DES-13
- [ ] The cookie game's new name ("Letter Cookies" is a placeholder) → GAME-6
- [ ] Pearl Moon: tease it with a "?" on the shelf, or keep it a total secret? → PRG-4
- [ ] Squishy odds (proposal: rare 1 in 8, super rare 1 in 40) → PRG-5
- [ ] Is the soft green for "right" and soft pink for "try again" OK inside a tan palette?
- [ ] Keep the prototype's own Light/Dark button, or rely on the canvas's?
- [ ] Fraunces Soft for titles: confirm, or try another display face

---

## Colour: role tokens

Components use the **role**, never the hex. Values are the round 2 prototype's.
// TODO: confirm after approval; DES-3 turns these into `src/styles/_tokens.scss`.

| Role | Light | Dark | Used for |
|---|---|---|---|
| ground | `#F5EDE1` oat | `#1E1813` night cocoa | page background (with paper grain) |
| card | `#FFFBF5` cream | `#2A211B` espresso | cards, panels, choices |
| edge | `#E9DCC9` sand | `#433629` bark | borders, pressed shadows |
| well | `#F5EDE1` | `#352A21` | chips, wells |
| soil | `#D9C4A6` latte | `#5A4636` loam | soil, planks, arches |
| ink | `#3B2A20` cocoa | `#F4EADC` milk | text |
| soft ink | `#6E5747` mocha | `#C9B6A1` oat milk | quiet text |
| accent | `#C4996A` caramel | `#D9AE7C` | stars, "here", Luna's Pick |
| action | `#9A6B45` toffee (white text) | `#D9AE7C` (dark text) | main buttons |
| pressed | `#6B4C35` walnut | `#9C7651` | button edges (edge only, never text) |
| right | `#5C6849` / soft `#E7EADF` | `#A9B88C` / soft `#2F3527` | right answers, "took 4 min" |
| try again | `#9A5A44` / soft `#F3E0D6` | `#D79C86` / soft `#46302A` | wrong answers |
| rare / super rare | `#F3E0D6` / `#F3E3BC` | `#46302A` / `#3F3420` | squishy rarity tags |
| moon | `#F2CF63` moon gold | same | **only** the moon |

Every text pairing is WCAG AA (4.5:1) in both modes; the Look board shows the ratios.
Illustrations (Luna, squishies, flowers) keep their own colours in both modes.

## Type // TODO confirm

- **Titles:** Fraunces Soft (`'SOFT' 100, 'WONK' 0`).
- **Everything a child reads:** Andika. Distinct I/l/1 and single-storey a/g. Self-host it (DES-4).
- **Minimums:** kid-read text 20px, answer words 32px, answer letters 48px.

## Shape, space, depth // TODO confirm

- The **arch** is the motif: lesson cards, the "?" cue, the shelf, the Luna stages.
- Corners: chip 10, tile 16, card 22–24, arch `999px 999px 20px 20px`.
- 4px spacing steps. Three heights only: flat, card, lifted.
- Touch targets at least 64px for answers and 48px for chrome; nothing a child must hit within 16px of the edge.

## Motion // TODO tokens in DES-5

- Proposed timings: tap 120ms, enter 240ms, emphasis 400ms, celebrate 700ms. Spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- **A win:** the answer pops, Luna hops, flowers grow up the sides of the stage, petals drift down (about 2s, never blocking the next tap).
- **Wrong:** a small wobble and a soft "try again" tint. Never red.
- **Rare things shimmer:** a light sweep and sparkles on rare tags and Pearl Moon.
- **Squishies squish** when tapped (squash, stretch, settle).
- **Reduced motion:** every loop stops, petals and sparkles hide; Bubble Sounds slows instead of stopping (DES-6).
- // TODO: petals run about 2s against the proposed 1.5s celebration rule. Decide which wins.

## Luna // TODO pick

- **Round 2 choices:** four rounder owls in black glasses (round frames, cat-eye, bold frames with a scarf, reading glasses) and four crescent moons (a face; a face with glasses; no face with hanging stars; no face cradling a star).
- **The prototype uses** the round-framed caramel owl as a stand-in everywhere.
- **Rules either way:** one Luna per screen (DES-12), eight moods, her mouth (or a faceless moon's glow) moves only while a clip plays, and the moon is moon gold.

## Progress and rewards

- **Lesson garden (DES-13):** not yet = seed, up next = glowing sprout, started = bud, learned = flower. Each card shows "about N min"; a learned one shows "took N min" (PRG-6). // TODO: the flower.
- **Today:** minutes read and lessons in bloom, on the library and the "a little more" home screen.
- **Squishies (PRG-5):**
  - Kinds: squish ball, mochi cat, bunny, bear, butter block, peach, cloud, little moon, and more. Generic shapes, no brand names.
  - Colours: usual, rare (soft tints), super rare (swirl, shimmer, glow).
  - **The shelf:** found squishies with colour dots; a usual colour still to find is a grey dot; a rare one is a "?" dot. Easier squishies not found yet are greyed shapes, harder ones are "?" slots. **Pearl Moon**, the last one, sits at the top of the arch (PRG-4).
  - **Ways in:** the Squishy Shelf card on the library; the bunny on the "a little more" home screen ("My shelf"); "See my shelf" on the lesson-done screen.

## Screens in round 2 (the prototype)

| Board | What it shows |
|---|---|
| Look | Palette with light/dark values and contrast, type, the garden stages, squishy rarity, time chips |
| Home · just the app | Like today: one Reading app. Day: sun and dunes. Night: crescent moon and stars |
| Home · a little more | Plus Luna's greeting, today's mini garden and time, the newest squishy |
| Library | Luna (spoken greeting), Squishy Shelf card, Today, Luna's Pick, the lesson garden, the Play Shelf |
| A round | The "?" listen cue, four choices, seeds for the rounds; a win grows flowers and drops petals |
| Lesson done | The flower blooms, time vs estimate, the garden, a new squishy with a shimmering rare tag |
| Squishy shelf | The arched shelf: found, greyed, "?", colour dots, Pearl Moon |
| Flowers | Six roses, a rose through the stages, a mixed garden, six other flowers. Tap to bloom and mark a pick |
| Ms. Luna | Eight characters: four owls, four moons. Tap to say hi |

---

## Changing the prototype

The round 2 boards are built from pieces in `prototype/`, so the shared parts
(colours, the owl, plants, the nav bar, light/dark) live in one place.

- `prototype/gen.py`: assembles boards. Shared tokens, the owl (`%%OWL 108%%`), plants (`%%PLANT rose:red 84 98 sway fh%%`), includes (`%%INCLUDE homebg%%`), the nav and the theme code.
- `prototype/frag/<Board>.frag`: one per board, in three parts (`<!--CSS-->`, `<!--BODY-->`, `<!--LOGIC-->`). Shared bits are `frag/_<name>.part`.
- `prototype/check.py`: checks tags balance, no placeholder is left, and the script parses. Needs `node`.

**Steps:**
1. Read the live `project/canvas.json` and any board someone may have edited by hand (Artifact `read`). If a board was hand-edited, copy those edits into its fragment first.
2. Edit the fragment. Use role tokens (`var(--card)`), never raw hex, except inside illustrations.
3. `cd .claude/skills/luna-design/prototype && python3 -I gen.py R2Library` then `python3 -I check.py project/R2Library.dc.html`.
4. Publish to the canvas URL with `root` = `prototype/` and the board as `project/<Board>.dc.html`. Send `canvas.json` only when adding, moving or removing a board, re-read just before.
5. Have a look in the built-in browser:
   - It opens signed out, which is fine. Set the viewport to 1440×1000, then reset it when done.
   - A board takes about 8 seconds to appear after loading. Move between boards with the board's own nav bar (Look, Home, Library…).
   - Use the colour-scheme setting to check dark mode (see the `know-how` entry on light/dark).
6. Add a note to DES-2's progress in `kanban/epics/DES.md`.

**What we learned (2026-10-09):**
- **Light/dark:** the canvas tells each board its theme (`data-theme` on the page, `?theme=` in the URL, and a `__dc_theme` message when its button is pressed). Boards listen for all three plus the device setting. Signed-out viewers don't see the canvas's button, so the prototype keeps its own Light/Dark button too.
- **Fragments are not `.html`:** the desktop app opens `.html` files Claude writes, and a fragment on its own looks broken. Keep them `.frag`/`.part`.
- **SVG colours from tokens:** use `style="fill: var(--x)"`; `var()` in `fill=""` attributes isn't reliable.
- **A CSS animation's transform replaces an SVG `transform=""` attribute:** wrap the shape in a `<g>` and animate the `<g>`.
- **Each board keeps its own state.** Moving between boards is only through `<a href="Other.dc.html">`, never from script, so "squish, then go to the shelf" is two taps.
- **Moons:** a pale moon on tan disappears. Moon gold on a dark sky reads instantly. A glow drawn as a full circle behind a crescent makes it look like a full moon: glow the crescent itself.
- **Small squishies:** at under 64px the moon shape turns into a squiggle. Use round, simple kinds (bear, cat, peach).
- **`rose` must not match `rosebud`:** in `gen.py`'s `head()`, the rose check excludes `rosebud`, or buds draw as full roses.
