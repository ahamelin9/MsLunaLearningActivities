# BUG — Bugs

### BUG-31 · American spelling: "Memorize", "color"
Bug · P1 · S · needs: — · confirmed
- **Why:** the teacher (2026-11-12): "some of that spelling is a little off"; Alex: "memorise" is British. Found in what the screens show: What's Missing? says "Memorise!" and "Memorise Luna's desk…" (`WhatsMissing.tsx`); the done screen says "Rare colour: …" and "comes in a rare colour" (`DoneScreen.tsx`); the shelf says "Usual colours", "Rare colours", "a usual colour" and "a rare colour" (`Shelf.tsx`), and its read-aloud labels say "colours found" (`ShelfRows.tsx`).
- **How:** respell what the screens show and Luna says in American English. Names in the code (`colour` props, `SquishyColour`, the `'grey'` dot) can stay. A small check in `npm run lint` fails on British spellings (colour, favourite, memorise, organise, recognise, practise, centre, grey and the like) in what screens show and Luna says. Re-render any line that changed.
- **Blocked:** built, waits for Alex's OK (`screenshots/review/bug31-spelling.png`). The check also found a spoken line: Luna's "Bleh! That one is the wrong flavour." is now "flavor", re-rendered.
- **Complete when:** no screen or line uses a British spelling, and the check passes (it failed before the fix); changed lines are re-rendered and `voice:audit` passes; build and lint pass; shots of What's Missing?'s start and the shelf.
