# The round 2 prototype (archived)

**Frozen on 2026-10-10.** This is the approved reference: what the teacher
signed off. Since DES-3, the app's token files (`src/styles/tokens/`) are the
source of every value, and `gen.py`'s copy stays as it was approved. Rebuild
and republish only to fix the record (a broken board, say), never to change the
design. A new design round starts from the token files instead.

- **Canvas:** <https://claude.ai/artifact/Gr1ngbrVdGS6xE4pALyWsm>, page "Round 2 ·
  Teacher's picks". The link opens on the Look board.
- **Boards:** Look, Home, Library, Progress (wide), Round, Done, Squishies, Ms.
  Luna (wide). Round 1 (options A to D, 8 Lunas) stays on its own pages.

## What's here

- `gen.py` assembles the boards. It holds the shared tokens (`.t-light` /
  `.t-dark`), the owl (`%%OWL 108%%`), plants (`%%PLANT rose:red 84 98 sway fh%%`),
  includes (`%%INCLUDE homebg%%`), the nav and the theme code.
- `frag/<Board>.frag`: one per board, in three parts (`<!--CSS-->`,
  `<!--BODY-->`, `<!--LOGIC-->`). Shared bits are `frag/_<name>.part`.
- `check.py` checks that tags balance, no placeholder is left and the script
  parses. It needs `node`.
- `project/` holds the built boards (gitignored).

## Rebuilding and publishing a board

1. **Read the live canvas first:** `project/canvas.json`, and any board someone
   may have edited by hand (Artifact `read`). If a board was hand-edited, copy
   those edits into its fragment.
2. **Edit the fragment.** Use role tokens (`var(--card)`), never raw hex, except
   inside illustrations.
3. **Build and check:**
   `cd .claude/skills/luna-design/prototype && python3 -I gen.py R2Library`, then
   `python3 -I check.py project/R2Library.dc.html`.
4. **Publish** to the canvas URL:
   - `root` is `prototype/` and the board is `project/<Board>.dc.html`.
   - Send `canvas.json` only when adding, moving or removing a board, and re-read
     it just before.
   - The first publish in a conversation is refused until the artifact itself has
     been read (`read` with just the `url`).
   - `file_path` must be an absolute path to one built board, with the rest in
     `files` and `root` absolute too.
5. **Look at it in the built-in browser:**
   - It opens signed out, which is fine. Use a 1440×1000 viewport, and reset it
     when done.
   - A board takes about 8 seconds to appear. Move between boards with the
     board's own nav bar.
   - Use the colour-scheme setting to check dark mode.
   - Wide boards look clipped at 1440×1000. With the viewport reset, the canvas
     fits the whole board in the pane.

## What we learned

- **Light/dark:** the canvas tells each board its theme three ways:
  `data-theme` on the page, `?theme=` in the URL, and a `__dc_theme` message
  when its button is pressed. Boards listen for all three plus the device
  setting. Signed-out viewers don't see the canvas's button, so the prototype
  keeps its own Light/Dark button.
- **Fragments are not `.html`:** the desktop app opens `.html` files Claude
  writes, and a fragment on its own looks broken.
- **SVG colours:** use `style="fill: var(--x)"`. `var()` in `fill=""`
  attributes isn't reliable.
- **SVG transforms:** a CSS animation's transform replaces an SVG `transform=""`
  attribute, so wrap the shape in a `<g>` and animate the `<g>`.
- **Each board keeps its own state.** Moving between boards is only through
  `<a href="Other.dc.html">`, never from script.
- **Moons:** a pale moon on tan disappears; moon gold on a dark sky reads
  instantly. A glow drawn as a full circle behind a crescent makes it look full,
  so glow the crescent itself.
- **Small squishies:** under 64px the moon shape turns into a squiggle. Use
  round, simple kinds (bear, cat, peach).
- **`rose` must not match `rosebud`** in `gen.py`'s `head()`, or buds draw as
  full roses.
- **Changing the nav** (`SCREENS`/`JUMP` in `gen.py`) bakes into every board,
  so rebuild and republish all the round 2 boards.
- **Repeats:** `<sc-for list="{{ lessons }}" as="l">` with per-item handlers and
  state classes keeps a 24-card board short.

## Known glitches (not to copy into the app)

Found in the audit on 2026-10-10 and recorded in
`docs/design-system/decisions.md`:
- the glow keyframes have the light action colour typed in, so they stay light
  in dark mode;
- the "Up next" tag moves off-centre with reduced motion;
- the Look board's contrast numbers are typed in by hand, and its Right and Try
  again swatches aren't the real tokens;
- a round has 4 parts on the Round and Done boards but 5 on Progress.
