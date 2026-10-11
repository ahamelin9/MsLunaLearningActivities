# Colour

How colour works in Ms. Luna: the palette, the roles screens use, light and
dark, illustrations and contrast. The values themselves live only in
`src/styles/tokens/` (from DES-3). Until then, the frozen prototype's
`gen.py` holds them. The Kit page shows them live (DES-20).

## Rules

1. **Use a role, never a raw colour.** Write `color: var(--ink)`, not a hex,
   `rgb()` or a colour name. Raw colours exist in two files only:
   `_primitives.scss` and `_illustration.scss`.
2. **Pick a role by its job, not its look.** A card is `--card` even if another
   role happens to have the same brown. If they ever diverge, the screen stays
   right.
3. **Every role has a light and a dark value.** Add both or neither; the build
   fails if one is missing.
4. **Text passes 4.5:1 in both modes.** A role that carries text lists its
   pairs next to it, and `npm run lint` checks every pair (DES-19).
5. **Right and wrong never differ by colour alone.** Right also pops and glows;
   wrong also wobbles. Try again is a soft clay, never alarm red.
6. **Moon gold is only for the moon.**
7. **Illustrations take colours from the illustration palette** (`--illo-*`),
   set through classes in their module, never `fill="#…"` in the markup.
8. **No gradient washes and no rainbow.** Flat colour, paper grain, and the
   occasional soft glow.
9. **Something new that doesn't fit an existing role?** Go down the ladder in
   [fitting-in.md](fitting-in.md). A new role needs Alex's OK; a new palette
   colour needs his OK too, and the teacher's if the look changes.

## The palette, in words

Sand and cocoa, as the teacher chose (2026-10-09):
- **Day:** cream cards on oat paper, sand edges, latte planks, caramel accents, a
  toffee main button with a walnut ledge, cocoa text and softer mocha.
- **Night:** espresso cards on a night-cocoa ground, bark edges, loam planks,
  milk text, and caramel buttons that turn light with dark text.
- **Answers:** a soft sage for right and a soft clay for try again, in both modes.
- **The moon:** moon gold, the one colour outside the palette.

The primitives give each colour a plain name (oat, cream, sand…). Screens never
use those names; they use roles.

## The roles

| Role | Its job |
|---|---|
| `--ground` | Page background, under the paper grain |
| `--grain`, `--grain-2` | The two dot layers of the paper texture |
| `--card` | Cards, panels, answer choices, speech bubbles |
| `--edge` | Borders and the hard ledge under cards |
| `--well` | Chips, wells, empty slots, locked lessons |
| `--soil`, `--soil-deep` | Planks, shelves and arches |
| `--ink` | All main text |
| `--ink-soft` | Quiet text: captions, "about 5 min" |
| `--accent` (with `-ink`, `-edge`) | Stars, Luna's Pick, highlights |
| `--accent-soft`, `--accent-text` | Soft accent fills and the text on them: "Up next", the prompt pill, the revealed answer |
| `--action` (with `-ink`, `-edge`) | The main button on a screen. `--action-edge` is its "pressed" ledge, an edge only, never text |
| `--right` (with `-ink`, `-edge`, `-glow`) | A right answer, the "Lesson done!" mark |
| `--right-soft`, `--right-text` | Soft right fills and their text: "took 4 min", a found ListenCue |
| `--try-again-soft`, `--try-again-edge`, `--try-again-text` | A wrong answer: a soft tint and an edge, never red |
| `--rare-soft`, `--rare-edge`, `--rare-text` | A rare squishy colour's tag |
| `--super-rare-soft`, `--super-rare-edge`, `--super-rare-text` | A super-rare squishy colour's tag |
| `--picture-1` … `--picture-5` | Soft tints behind the pictures on Play Shelf tiles |
| `--focus` | The keyboard focus ring |
| `--shade`, `--shade-deep` | The soft colour of shadows, for card and lifted |
| `--shine` | Highlights on pressable things |

Elevation is also made of roles: card, lifted, the ledges and the glow ring all
carry colour, so their colours change with the mode
([foundations.md](foundations.md)). Some roles share a value today (well and
ground in light, try again and rare). They stay separate because they do
different jobs.

## Light and dark

- **How it works:** every role is defined twice, once for light and once for
  dark, and the `data-theme` attribute on `<html>` picks one. All of a role's
  pieces are defined in both blocks, so even combined roles like shadows switch.
- **Until DES-16, the app stays light.** Following the iPad's setting while
  screens are only half moved would show half-dark screens. DES-16 then follows
  the iPad, and lets a grown-up pick Light, Dark or "Match the iPad" behind the
  gate.
- **Dark isn't inverted.** The browns get deeper, text becomes milk, and the
  main button flips to a light caramel with dark text. Right and try again keep
  their meaning with lighter text on deeper tints.
- **The teacher prefers light,** but dark has to be just as good.
- **Check both, every time:** the Kit page's side-by-side view, and screenshots
  with dark forced.
- **No `light-dark()`.** It needs a newer iPadOS than some classroom tablets
  have, so plain custom properties do the job.

## Illustrations

`_illustration.scss` holds the colours of things that are drawn:
- **Characters and objects, the same in both modes:** Luna (caramel feathers,
  black round frames), the milestone moon (moon gold), squishies in their usual,
  rare and super-rare colours, cookies, roses and petals.
- **Scenery with a day and a night value:** the home sky, the dunes, the
  pampas, and the plants' leaves and stems.

**Why a separate palette:** a character has to look like herself in both modes,
and a moon has to read as a moon. Roles change with the mode; illustrations
mostly don't.

**What to stick to:**
- Illustration colours stay in the sand-and-cocoa family, with soft natural
  touches (sage leaves, blush cheeks, rose petals).
- Only the moon wears moon gold. A pale moon on tan disappears; moon gold on a
  dark sky reads instantly.
- A new illustration colour goes in this file, and Alex OKs it on the Kit page.

## Contrast

- Every text pair passes **4.5:1 in both modes**, large display text included.
  Children are learning to read, so there's no 3:1 allowance.
- **Where the pairs live:** next to the roles in `_roles.scss`. `npm run lint`
  runs `scripts/design/contrast.mjs`, which builds the tokens and checks every
  pair in light and dark (DES-19). The Kit page shows each ratio.
- **The tightest pair** is the main button's text in light mode. Any change to
  `--action` or `--action-ink` must be rechecked.
- **Not the prototype's numbers:** the Look board's ratios were typed in by
  hand, and two of its swatches aren't the real roles (2026-10-10 audit). The
  check replaces them.
