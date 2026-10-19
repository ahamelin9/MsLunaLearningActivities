# Components: the kit

The kit is the set of pieces every screen is built from. It lives in
`src/components/kit/`, one folder per component, with `kit/index.ts` as the
list. Restyling the app means changing these, not every screen. The Kit page
(`npm run dev`, then `/?kit`) shows each one in every state, light and dark
(DES-20).

## Rules

1. **If the kit has it, use it.** Don't restyle a kit component from a screen.
   A different look is a new variant, made in the kit.
2. **Twice makes a component.** A pattern used in two places becomes a kit
   component, or a variant of one. A one-off stays in its screen's folder.
3. **Three files per component**, in `src/components/kit/<Name>/`:
   - `<Name>.tsx`, opening with the header comment (template below);
   - `<Name>.module.scss`;
   - `<Name>.kit.tsx`, which shows every state on the Kit page.

   Export it from `kit/index.ts`.
4. **Component tokens come first.** The top of the module declares the
   component's tokens (`--button-bg: var(--action)`), each mapped to a role.
   Variants swap only those tokens. Nothing in a component uses a raw value.
5. **States go in `data-state`** (`data-state="wrong"`), never in class names
   built from strings.
6. **A kit root never sets its own outer margin or position.** A screen may pass
   a `className` for layout only (margin, grid area, alignment).
7. **Check it in both modes:** every state on the Kit page, light and dark,
   then `npm run lint`.

## What's in the kit

| Component | What it is | Variants and states | Ticket |
|---|---|---|---|
| `Icon` | The drawn icon set: round-capped strokes in `currentColor`, no colour of its own | check, clock, lock, unlock, chevron and arrow left/right, home, speaker, mute, ear, replay, gear, info, book, dice, play, star, sparkle, close, trophy, lightbulb, sun and moon (home's day/night button, DES-16); sizes 16, 20, 24, 32, 40 (the ListenCue's ear) and 96 (the done screen's mark); filled | DES-7a (done), 96 DES-22d, sun and moon DES-16 |
| `ChunkyButton` | The pressable button with a hard ledge | action, accent (Luna's own: "Hear my clue", Luna's Pick), secondary, quiet (dashed), icon; sizes 48 and 64; an icon before or after the words; pressed, disabled, selected (`aria-pressed`: the picked one in a pick-one row takes the action look, DES-9b); prompt (the Round board's pill a game puts by its text, "Say it again", "Read it to me": the soft accent, round ends, no ledge, the reading type in bold, a speaker icon; disabled while the child should try first; DES-22b); hold (`onHold`: the grown-up gate, SET-1. It opens only after a press held for `--dur-hold`, while a ring of the action colour fills round it; a quick tap only shows a small "Grown-ups: press and hold" note. On the home screen's gear, the library's gear and the library's grade button, and muting Luna beside her in the library, SET-2; `holdNoteAt="start"` lines the note up with the button's left edge, for a button near the screen's left) | DES-7a (done), accent DES-7b, prompt DES-22b, hold SET-1, holdNoteAt SET-2 |
| `PaperCard` | The card surface | flat, card, lifted; reward (the done screen's panel for a new reward: flat, a thick dashed accent border, as on the Done board) | DES-7a (done), reward DES-22d |
| `Chip` | A small pill: tag, count or time | time ("about 5 min"), took ("took 4 min"), accent ("Up next", "12 min today"), count (stars), rare and super-rare (a squishy's colour tag, with `shimmer`); `ground="well"` for a chip on a well. `TimeChip` is a preset: `minutes`, `took`, `highlight` | DES-7a (done), rarity tags DES-7c |
| `Tile` | A card with a picture area and a name | the Play Shelf's games; picture tints 1–5; pressed; picked (`aria-pressed`: the picked one in a pick-one set takes the action look, its picture keeping its tint and ink; Grade Select, DES-9c) | DES-7a (done), picked DES-9c |
| `Modal` | A lifted card over a dimmed screen, with a 48px close button | grown-up screens (Settings, trophies); open, closed. A kit root with its own position (fixed), like `Petals`; not in a portal, so it keeps its screen's mode | DES-7a (done) |
| `Choice` | **The only answer button** | letter, word, phrase (a few words in the reading type, an answer tall: Story Corner's answers, DES-22c), picture × idle, pressed, wrong, right, revealed, faded/disabled. Controlled: the screen sets `state` and clears `wrong` with `afterMotion('emphasis', …)`. A picture's `caption` is passed only once solved where the picture is the target (What's Missing? names every choice from the start: its target is the one that's gone) | DES-7b (done), phrase DES-22c |
| `ListenCue` | The "?" arch that holds the target's place | waiting (a slow glow), tapped (the glow once, as a ripple), found (with the Round board's burst of five sparks; none under reduced motion); a letter or a word; a `picture` in the "?"'s place for "the first letter of 🐱". It renders its `answer` only when found | DES-7b (done), burst and picture DES-22b |
| `SpeechBubble` | Luna's line in a card with a tail | tail left or bottom; optional "Hear my clue" button (`onClue`); no tail, for a perch with no owl (a game with its own Luna), its line then a 48px button that says it again (`onLine`) | DES-7b (done), no tail DES-22a |
| `StarRow` | 0 to 3 stars | 24 or 48; still, or landing one by one (`animate`); earned stars in `--illo-star` | DES-7b (done) |
| `ProgressBar` | One bar in segments | lessons (with "N of M lessons done"), rounds (thin, for a lesson's top bar and the up-next card). `done` and `total` come from the data; the fill grows with the soft spring | DES-7c (done) |
| `LessonCard` | A lesson on the library | done (check badge, "took N min"), up next (glowing border, a centred "Up next" tag, "about N min", a rounds bar once started), locked (dashed on the well, lock badge, wobbles on tap and doesn't sink); pressed; no time (`minutes` left out: no chip, until PRG-6 measures them); opened (the lesson that just opened pops in once, then glows; none under reduced motion). Its state comes from `lessonStates` (PRG-7) | DES-7c (done), no time and opened DES-13 |
| `Squishy` | A collectible squishy | ball, cat, bunny, bear, butter block, peach, cloud, little moon; oat, caramel, toffee, cream (usual), blush, butter (rare, a sparkle), honey (super rare, a gold sparkle); sizes 64, 96, 128; squishes on tap; ghost (its shape, greyed) and "?" slot wobble; `SquishyDots` for the colours found and still to find. Its colours come only from `_illustration.scss` | DES-7c (done) |
| `Switch` | An on/off setting for grown-ups: a 48px target with a sliding knob | off, on (the action colour), disabled; `role="switch"`, named by `label`. Settings' sound effects, Ms. Luna's voice and Less Motion | DES-9b (done) |
| `Luna` | Ms. Luna, the owl the teacher picked (round 2, owl 1) | 8 moods (idle, happy, cheer, think, oops, surprise, listen, sleepy), each a pose of one drawing; blinks in idle, happy, think and listen; talking follows the voice by itself (her beak moves only while a clip plays; `talking={false}` keeps her quiet while someone else speaks); `float` for screens where nothing is being played; any `size`; tappable with `onClick`. Her colours come only from `--illo-luna-*` | DES-15 (done) |
| `Flower` | A flower in its mound of soil: the garden a won round grows (never progress) | daisy, red rose, blush rose; small, medium, large (56, 64, 84px wide); still, or `grow` (the shared grow-in on its `step`, a little after the step before, then the shared sway). Its colours come only from `_illustration.scss`; the soil is `--soil` | DES-11 |
| `Petals` | Petals drifting down instead of confetti | at once (a won round) or `delayed` (the done screen, once it has arrived); `count` (30). Each falls once; mount it again with a new `key` to drop them again. It fills its nearest positioned parent on `--z-celebrate` and places itself, as the Modal does; it never takes a tap. None under reduced motion | DES-11 |
| `MilestoneMoon` | The crescent moon in Luna's round black glasses, who visits for big milestones (round 2 Ms. Luna board, moon 6) | happy (open eyes that blink, a small smile), cheer (smiling eyes, a wide smile, rosier cheeks); she rocks gently; talking follows the voice by itself (her mouth moves only while a clip plays); any `size`. Her colours come only from `--illo-moon-*`. The done screen's `MoonVisit` brings her in (DES-17) | DES-17 (done) |

## One answer language

Every answer button is a `Choice`, so a right and a wrong answer look the same
in every game and lesson (DES-11).

| State | What it looks like | When |
|---|---|---|
| idle | A card with an edge ledge | Waiting |
| pressed | Sinks, the ledge shrinks | While touched |
| wrong | Try-again tint and edge, a wobble; clears when the wobble ends | A wrong tap |
| right | Right fill, a pop and a glow ring | The right tap |
| revealed | A dashed accent ring with a soft accent fill | After repeated misses, the app points at the answer (FB-2). The one time it does so unprompted |
| faded / disabled | Faded, can't be tapped | The other choices once the round is solved |

**Game pieces aren't Choices** (bubbles, cookies, bugs, memory cards, word
tiles): their shape is the game. They live in their game's folder but use the
same `data-state` values, the same state roles and the same motion, so right
and wrong still look alike everywhere (DES-11; the games take them on in
DES-22b, DES-22c and DES-23):

| `data-state` | Roles | Motion |
|---|---|---|
| `wrong` | fill `--try-again-soft`, edge `--try-again-edge` | `--motion-wobble`; the screen clears the state with `afterMotion('emphasis', …)` |
| `right` | fill `--right`, ink `--right-ink`, edge `--right`, ledge `--right-edge`, plus `--glow-ring` | `--motion-pop` |
| `revealed` | fill `--accent-soft`, a dashed `--accent-edge` edge; still tappable | none |
| `faded` | the piece at 0.4 opacity; it can't be tapped | none |

A piece with no fill of its own (a bubble, a cookie) takes the edge, ledge,
glow and motion, and keeps its drawn colours.

**`revealed` is "show me" (FB-2):** from the third miss in a round the shell
calls the game's `reveal`, and the answer's piece takes `revealed` until it's
chosen: Letter Jar's letters still to catch, Bubble Sounds' bubbles with the
sound, Letter Cookies' cookie and the jar letters (edge only, keeping their own
colours), Muddled Cards' pair tried again (face down), the next word's tile in
Words Off the Page, the hunted word in Story Corner, and the right Choice in
What's Missing?, Treasure Path, Story Corner's question and every lesson
(`choiceState(…, revealed)`). Luna says a reveal line instead of another
"try again".

**The stage speaks the same language** (GameShell, `data-flash`): a miss turns
its edge `--try-again-edge`, a win `--right` with the `--right-edge` ledge and
`--glow-ring`, as a wrong and a right Choice do.

**A won round** (DES-11): the answer pops, the stage's edge turns right, and a
little garden grows from the stage's bottom corners, as on the Round board: a
daisy, a rose and a daisy on each side (`Flower`, one `step` apart, then
swaying). It grows behind the round's pieces, so it never covers an answer,
and it leaves with the round. `Petals` drift down over the stage and the
perch and keep falling into the next round's first second. The done screen
drops the same petals once it has arrived. None of it takes a tap; under
reduced motion the flowers are simply there and no petals fall.

## Luna on screen

**One Luna per screen** (DES-12), and no owl emoji beside her: a child reads
any owl as Luna. A game that draws her on its own stage sets `ownLuna` on its
definition (Letter Cookies), and the shell's perch then shows her line with no owl
and no tail; tapping the line says it again. `layout-audit.mjs` (know-how)
fails a screen with two. While the milestone moon visits (DES-17), Luna stays
with `talking={false}` and only the moon talks.

Where space is tight (the library), her line is spoken with no bubble and
tapping her says it again (DES-21). Beside her there, a kit icon button mutes
and unmutes her: the same setting as Settings' "Ms. Luna's voice".

Her moods, each a pose of the one drawing (`Luna.tsx`'s `POSES`). Pick one by
what's happening, and let the line and the mood agree:

| Mood | What it's for | Where it's used today |
|---|---|---|
| `happy` | Her everyday face: hello, a start screen, a calm "well done" | the library (and most of its greetings; each greeting line carries its own mood), Grade Select, start screens, the perch's default, Letter Cookies waiting |
| `cheer` | A right answer to celebrate, a streak, a finished game or lesson | the perch after a win, the done screen, Letter Cookies chewing |
| `think` | Let's look again: a second miss, a clue. Never a telling-off | the perch from the second miss, with the spoken hint |
| `oops` | A little slip: a first miss, a wrong cookie, her own mishaps (lost glasses). It's about the moment, never the child | the perch on a first miss, Letter Cookies spitting out a wrong cookie, the library's greeting "I dusted the shelves AND lost my glasses" |
| `surprise` | Something found or a fun fact: a reveal, a streak, "letters are hiding!" | the perch on a reveal or a streak, the library's greetings that tease ("some letters are hiding"), Luna's Pick |
| `listen` | Asking the child to listen again | the perch's "Let's listen one more time" |
| `idle` | Resting, nothing going on | not used yet (Treasure Path's walker was the last, gone in DES-12) |
| `sleepy` | Night, or a long pause | not used yet; there if DES-16's night or a wait wants her |

## Anatomy of a kit component

The header comment opens every kit `.tsx`:

```tsx
/**
 * ChunkyButton: the pressable button with a hard ledge.
 *
 * Props:  variant: 'action' | 'secondary' | 'quiet' | 'icon' (default 'secondary')
 *         size: 48 | 64 (default 48) · icon?: IconName · onClick · children
 * States: idle · pressed (:active) · disabled
 * Tokens: --button-bg, --button-ink, --button-edge, --button-ledge, --button-radius
 * Reads:  --action, --action-ink, --action-edge, --card, --ink, --edge,
 *         --radius-tile, --press-depth, --motion-tap
 * Board:  Library header, the Done screen's actions
 */
```

The module declares its tokens at the top, and variants only swap them:

```scss
@use 'styles/mixins' as *;

.root {
  --button-bg: var(--card);
  --button-ink: var(--ink);
  --button-edge: var(--edge);
  // …layout and the rest read only the tokens above, roles and the space scale
}
.root[data-variant='action'] {
  --button-bg: var(--action);
  --button-ink: var(--action-ink);
  --button-edge: var(--action-edge);
}
```

`<Name>.kit.tsx` renders every variant and state, so the Kit page picks it up
without being edited. Its default export is a component with no props; the
page shows it under the folder's name, once per mode. Lay the states out with
`Specimens` and `Specimen` from `src/dev/KitPage/Specimen.tsx`, so every
component reads the same way (`onCard` for pieces that sit on cards, `frame`
for an overlay). A pressed state is held with `data-state="pressed"`, which the
`press` mixin treats like `:active`.

## Adding a component

1. **Check it's really new.** Is it a variant of something in the table above?
   Then add the variant to that component instead.
2. **Make the folder:** `src/components/kit/<Name>/` with the three files and
   the header comment.
3. **Declare its tokens** at the top of the module, mapped to existing roles. If
   no role fits, go down the ladder in [fitting-in.md](fitting-in.md).
4. **Export it** from `kit/index.ts`.
5. **Check it:** open `/?kit` and look at every state in light and dark, then
   run `npm run lint`.
6. **Record it:** add it to the table above and, if it came from a ticket,
   update the map's status row.

## Changing a component

Change its tokens or its module, and every screen follows. Check the Kit page in
both modes, and take before and after screenshots of the screens that use it.
If a change alters how something looks to a child, Alex OKs it (the teacher too
if the direction changes).
