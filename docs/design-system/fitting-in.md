# Fitting something in

What to do when you need a value, a look or a piece that the standards don't
seem to have, and what happens when something truly doesn't fit.

## Rules

1. **Values live only in the token files.** Need a value? Find its token. Never
   type it.
2. **Go down the ladder and stop at the first step that works:** reuse, then a
   component token, then a new role, then a primitive, then an exception.
3. **A step that needs sign-off waits for it.** Each sign-off is logged in
   [decisions.md](decisions.md).
4. **Exceptions are visible.** A `design-exception(ID): why` marker sits on the
   line or just above it, naming the ticket. A permanent one also gets a line in
   `decisions.md`.
5. **Never raise the baseline.** While the legacy styles go away, the design
   check's baseline may only shrink.

## The ladder

| Step | What you do | Who signs off | What you record |
|---|---|---|---|
| 1. **Reuse** | Use an existing role, radius, type role, motion role or kit component | No one | Nothing |
| 2. **Component token** | In a kit component, add a token mapped to an existing role (`--tile-picture-bg: var(--picture-2)`) | No one | The component's header comment |
| 3. **New role** | Add it to `_roles.scss` with a light **and** a dark value and its text pairs. It must pass the contrast check | Alex | A line in `decisions.md` |
| 4. **Primitive** | Add or change a palette colour or a step on a scale | Alex, and the teacher if the look visibly changes | A line in `decisions.md` |
| 5. **Exception** | Mark it in code with the ticket that justifies it | Alex | A line in `decisions.md` if it's permanent |

Illustrations have their own path: a new drawn colour goes in
`_illustration.scss`, and Alex OKs it on the Kit page ([colour.md](colour.md)).

## Examples

- **"This border needs a slightly darker brown."** Try `--edge`, then
  `--soil-deep`, then `--action-edge`. If none of them is right, ask whether the
  border needs to differ at all. Only then is it a new role (step 3).
- **"The prototype has a 14px gap."** Snap it to the scale: 16px is
  `--space-4`. The prototype was drawn on a 2px grid; the app uses 4px steps.
- **"A new game needs water for its scenery."** It's an illustration colour.
  Add it to `_illustration.scss` with a day and a night value, and Alex OKs it.
- **"A tile on the Play Shelf needs a different picture tint."** A component
  token on `Tile` pointing at one of the `--picture-*` roles (step 2).
- **"Bubble Sounds' words move."** The motion rule says words a child reads
  never move. Bubble Sounds is the documented exception
  ([decisions.md](decisions.md)), because the movement is the game.
- **"The squishy shelf's arch is much wider than the standard arch."** A
  component token on the shelf with its own radius, made from the arch's parts
  if possible. If it needs a new radius, that's a primitive (step 4).

## Exception markers

In SCSS:

```scss
// design-exception(DES-22b): the bubble's wobble path is the game itself
```

In TSX:

```tsx
{/* design-exception(DES-15): the owl's drawing coordinates */}
```

- **How the check reads it:** the marker covers its own line and the next one.
  The ID must be on the board or in `kanban/CHANGELOG.md`. Closed tickets stay
  in the changelog, so a marker stays valid after its ticket closes.
- **What to write:** keep the reason short and specific. "Because the design
  says so" isn't a reason.
- **To see them all:** `npm run design:status` counts the markers.

## The baseline, while the legacy styles go away

- **What it is:** today's code has hundreds of raw values. The design check
  (DES-19) records how many each file has in `scripts/design/baseline.json`.
- **How lint uses it:** `npm run lint` fails if any file goes **up**, or if a
  new file has any violation at all.
- **When a ticket moves an area onto the system:** that area's count drops.
  `node scripts/design/check.mjs --update` writes the new, lower baseline. It
  refuses to write a higher one.
- **To see what's left:** `npm run design:status` shows the count per area.
  The map's status table follows it.
- **The end:** DES-24 deletes the baseline. From then on the check is strict:
  zero violations, no allowances.

## When the check complains

| It says | Do this |
|---|---|
| Raw colour | Use the role for that job. If none fits, step 3 |
| A px, rem or ms value | Use the space scale, a radius, type, motion or target role |
| `@keyframes` outside the motion folder | Use a shared animation (`var(--motion-…)`). If none fits, add it to `src/styles/motion/` (Alex OKs a new shared animation) |
| Primitives used outside the tokens | Use the role built on that primitive |
| A kit folder with no `.kit.tsx` | Add one that shows every state |
| Unknown ID in an exception marker | Name a real ticket, or remove the exception |
| Contrast below 4.5 | Change the role's value (step 3 or 4), never the rule |
