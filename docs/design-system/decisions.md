# Decisions

The dated record of what was decided about Ms. Luna's design, by whom, and why.

**Adding a line:** each new role, primitive, permanent exception or change of
direction gets one, newest at the bottom of its table.

**Values:** this log records what was decided at the time. The live values are
in `src/styles/tokens/` once DES-3 to DES-5 build them. If the two ever differ,
the tokens win, and the change gets its own line here.

**Status:** everything below is decided. Alex approved the DES-2 docs and the
standards in them on 2026-10-10 ("as long as everything follows what we
mentioned and what the prototype follows"). A future proposal is marked
*Proposed* until he OKs it.

## Direction and the look

| Date | Decision | Who | Why | Ticket |
|---|---|---|---|---|
| 2026-10-08 | Full redesign. Home keeps its iPad feel; the reading app goes boho and modern | Alex | The app read as a generic AI-made site | DES-2 |
| 2026-10-08 | ESL reading first: no school subjects, ever; later apps are ESL companions | Alex | It's an ESL teacher's app | OPS-3, WRT |
| 2026-10-09 | Option A Boho, recoloured light tans and browns, no rainbow | Teacher | Her taste | DES-2 |
| 2026-10-09 | Home screen stays simple: the one Reading app, maybe a little more (settled 2026-10-10: just the app) | Teacher | Simple for a five-year-old | DES-9a |
| 2026-10-09 | Lessons grow seed → sprout → bud → flower (dropped 2026-10-10) | Teacher | So a child sees what they've learned | — |
| 2026-10-09 | Squishies replace emoji stickers, with rare colours | Teacher | More joyful to collect | PRG-5 |
| 2026-10-09 | Time per lesson shown before and after | Teacher | She wants to know how long a lesson takes | PRG-6 |
| 2026-10-09 | Luna: round 2 is the rounder owl in black glasses, or a crescent moon (with or without a face) | Teacher | Narrowing round 1's eight characters | DES-15 |
| 2026-10-09 | A real light/dark pair; the unused sunset/day/cosmic setting goes | Alex | One look in two modes beats three half-looks | DES-3, DES-16 |
| 2026-10-09 | A win grows flowers and drops petals; no confetti | Alex | Softer and on-palette | DES-11 |
| 2026-10-09 | No "Luna is ready" indicator | Alex | The problem it flagged is fixed | DES-8 |
| 2026-10-09 | The squishy shelf has a card on the library; the home bunny leads to it (the bunny went with the "a little more" home, 2026-10-10) | Alex | One clear way in | PRG-5 |
| 2026-10-09 | The moon breaks the palette: moon gold, and only the moon wears it | Alex | A pale moon on tan disappears; gold reads as a moon | DES-17 |
| 2026-10-10 | Home screen: the original, just the one Reading app icon | Teacher | She chose it over the "a little more" board | DES-9a |
| 2026-10-10 | Luna is the prototype's owl (round black frames, caramel feathers) | Teacher | "She loved it" | DES-15 |
| 2026-10-10 | The milestone moon (a crescent face in black glasses) visits now and then to say "good job" for big milestones | Teacher | Keeps big moments special | DES-17 |
| 2026-10-10 | No flowers for progress; of four simpler options she picked **One bar** | Teacher | Seeds to flowers was too confusing | DES-13 |
| 2026-10-10 | Lessons go in order: the next opens when the one before is done. Games stay open | Teacher, Alex | The lessons are linear; games are for going in and out | PRG-7 |
| 2026-10-10 | A win still grows flowers and drops petals, for now | Alex | The teacher dropped flowers for progress, not for wins | DES-11 |
| 2026-10-10 | The cookie game is "Letter Cookies" | Alex | A clearer name | GAME-6 |
| 2026-10-10 | The moon's milestones (proposal): first lesson ever, half a grade, a whole grade, a full shelf; never an ordinary lesson | Claude, for Alex | "Every once in a while" | DES-17 |

## How the system is built (Alex, 2026-10-10)

| Date | Decision | Who | Why | Ticket |
|---|---|---|---|---|
| 2026-10-10 | Three token layers (SCSS primitives; roles as CSS custom properties with light and dark; component tokens in each kit module), plus one illustration palette | Alex (plan) | Values in one place; light/dark from roles alone | DES-3 |
| 2026-10-10 | The source tree keeps `src/apps/<app>/` as the app boundary, with one folder per page, game and lesson | Alex | A second app (Writing) is coming, and screens reached from two places need one home | DES-18b–e |
| 2026-10-10 | Styles are scoped with CSS modules; states go in `data-state` | Alex | Moved files can't collide; deleting a component deletes its styles | DES-18b–e |
| 2026-10-10 | The written standards live in `docs/design-system/`, which replaces `docs/design-standards.md`; the `luna-design` skill links into it | Alex | One explanation for people and Claude, never written twice | DES-2 |
| 2026-10-10 | The round 2 prototype is frozen as the approved reference; the token files are the source from DES-3 on | Alex | The canvas is finished; keeping it in sync would mean renaming its variables on 8 boards | DES-2 |
| 2026-10-10 | Hooks bring the standards in whenever a UI file is created or edited, and check the file after the edit | Alex | So nothing needs cleaning up afterwards | DES-25, DES-19 |
| 2026-10-10 | A design check and a contrast check run in `npm run lint`, with a baseline that may only shrink | Alex (plan) | Rules only hold if a machine checks them | DES-19 |
| 2026-10-10 | Screens read roles and the space scale only; component tokens belong to kit components | Alex (plan) | Space has no meaning beyond its size, so it needs no role | DES-3 |
| 2026-10-10 | The app stays pinned to light until DES-16 | Alex (plan) | Following the iPad mid-migration would show half-dark screens | DES-3, DES-16 |
| 2026-10-10 | No `light-dark()`; plain custom properties | Claude | It needs a newer iPadOS than some classroom tablets have | DES-3 |

## Standards settled on 2026-10-10 (Alex approved)

The approved prototype was drawn freely. These turn what it shows into scales
the code can enforce, staying as close to the prototype as the scales allow.

| Decision | Why | Ticket |
|---|---|---|
| **Space:** a 4px scale. `--space-1` 4px, `-2` 8, `-3` 12, `-4` 16, `-5` 20, `-6` 24, `-8` 32, `-10` 40, `-12` 48, `-16` 64. The prototype's 2px-grid values round **up** to the next step (6→8, 10→12, 14→16) | Only 42% of the prototype's values sat on 4px; rounding up is roomier for small hands | DES-3 |
| **Radii:** chip 999px, tag 8px, tile 16px, card 22px, stage 30px, arch round top with 22px bottom corners | The prototype had 24 radii; these six cover every use | DES-3 |
| **Elevation:** flat; card (a small ledge in the edge colour plus a soft shade); lifted (a medium ledge plus a wide shade, for modals and the done panel). Ledges 3px, 5px and 6px. A pressed thing sinks until its ledge is a 1px hairline. One glow ring | The prototype used about 8 heights | DES-3 |
| **Type scale:** display-xl 40, display-l 30, display-m 24, display-s 20, cue 92 (Fraunces); read 22, label 18, label-small 16, tag 13 uppercase, answer-word 40, answer-letter 76 (Andika). All in px | The prototype had 25 sizes; this keeps its look in 11 roles | DES-4 |
| **The 20px minimum** applies to text a child must read to play. Tile and lesson labels may be 16px when a picture or number carries the meaning; grown-up text is at least 16px; uppercase tags are never needed to play | The prototype's lesson titles (15–16px), game names (17px) and time chips (13px) sat under 20px | DES-4 |
| **Durations:** tap 120ms, quick 240ms, emphasis 400ms, enter 600ms, celebrate 700ms, petals 2200ms, loops 4s or more | Taken from what the prototype actually uses: its entrances run 500–700ms, not the planned 240ms | DES-5 |
| **Easings:** standard `cubic-bezier(0.2, 0, 0, 1)`, springy `cubic-bezier(0.34, 1.56, 0.64, 1)`, soft-spring `cubic-bezier(0.34, 1.3, 0.64, 1)` for bars, exit `cubic-bezier(0.4, 0, 1, 1)`, plus ease-in-out for loops | The prototype's most-used curves; the outliers go | DES-5 |
| **A celebration may run up to 2.2s** if it never blocks the next tap (it was 1.5s) | The approved petals run about 2s | DES-5, DES-11 |
| **The "revealed" Choice state:** a dashed accent ring with a soft accent fill | No board designed it; FB-2 needs it. Alex OKs it on the Kit page | DES-7b |
| **Game pieces** (bubbles, cookies, bugs, memory cards, word tiles) aren't Choices, but share their `data-state` values, state roles and motion | Their shape is the game, but right and wrong must look alike everywhere | DES-11 |
| **Screens with no board** (Settings, Trophy room, Grade Select, game start screens, game scenery, Modal) are built from the kit, and Alex OKs the screenshots | The round 2 boards don't show them | DES-9b, DES-9c, DES-22a |
| **Round counts come from lesson data,** never the design | The boards disagree (4 rounds on Round and Done, 5 on Progress) | DES-7c, DES-13 |
| **Breakpoints:** as few as the four target sizes need, decided in DES-10; today's 640/700/720/860 retire | Two or three are enough for four iPad sizes | DES-10 |
| **Prototype glitches not to copy:** glow keyframes with the light action colour typed in; the "Up next" tag moving off-centre with reduced motion; the Look board's swatches for Right and Try again | Found in the 2026-10-10 audit of the prototype | DES-5, DES-7c, DES-19 |

## Permanent exceptions

| Date | Exception | Who | Why |
|---|---|---|---|
| 2026-10-08 | In Bubble Sounds, words a child reads move | Alex | The movement is the game |
| 2026-10-09 | Moon gold sits outside the palette | Alex | A moon must read as a moon |

## Open questions

- [ ] The moon's milestones: does the proposal on DES-17 suit the teacher?
- [ ] Can a grown-up unlock lessons ahead, behind the gate? Not asked for yet (PRG-7).
- [ ] Pearl Moon: tease it with a "?" on the shelf, or keep it a total secret? (PRG-4)
- [ ] Squishy odds (proposal: rare 1 in 8, super rare 1 in 40) (PRG-5)
- [ ] Are the soft green for "right" and the soft pink for "try again" OK inside a tan palette? (The teacher approved the boards, which use them.)
- [ ] Fraunces Soft for titles: confirmed by her approval of the boards, unless she says otherwise.
