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
| `Icon` | The drawn icon set: round-capped strokes in `currentColor`, no colour of its own | check, clock, lock, unlock, chevrons, arrows, home, speaker, ear, replay, gear, info, book, dice, play, star, sparkle | DES-7a |
| `ChunkyButton` | The pressable button with a hard ledge | action, secondary, quiet (dashed), icon; sizes 48 and 64; pressed, disabled | DES-7a |
| `PaperCard` | The card surface | flat, card, lifted | DES-7a |
| `Chip` | A small pill: tag, count or time | time ("about 5 min"), took ("took 4 min"), accent ("Up next"), count (stars). `TimeChip` is a preset | DES-7a |
| `Tile` | A card with a picture area and a name | the Play Shelf's games | DES-7a |
| `Modal` | A lifted card over a dimmed screen, with a 48px close button | grown-up screens (Settings, trophies) | DES-7a |
| `Choice` | **The only answer button** | letter, word, picture × idle, pressed, wrong, right, revealed, faded/disabled | DES-7b |
| `ListenCue` | The "?" arch that holds the target's place | waiting, tapped (ripple), found | DES-7b |
| `SpeechBubble` | Luna's line in a card with a tail | tail left or bottom; optional "Hear my clue" button | DES-7b |
| `StarRow` | 0 to 3 stars | still, animating in | DES-7b |
| `ProgressBar` | One bar in segments | lessons (with "N of M lessons done"), rounds (thin, for a lesson's top bar) | DES-7c |
| `LessonCard` | A lesson on the library | done, up next (with a rounds bar once started), locked (wobbles on tap) | DES-7c |
| `Squishy` | A collectible squishy | the kinds on the boards; usual, rare, super rare; squish; ghost; "?" slot; colour dots | DES-7c |
| `Luna` | Ms. Luna, the owl | 8 moods (idle, happy, cheer, think, oops, surprise, listen, sleepy); blink; talking | DES-15 |
| `MilestoneMoon` | The crescent moon with glasses who visits for big milestones | happy, cheer, talking | DES-17 |

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
and wrong still look alike everywhere.

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
without being edited.

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
