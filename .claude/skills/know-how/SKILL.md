---
name: know-how
description: Ms. Luna's solved problems and how-tos, so they never need troubleshooting twice. Read it before troubleshooting anything here, especially when Luna sounds like the robot/browser voice, a clip is missing, speech overlaps or is cut off, or a fix has to be proven in a real browser (silent checks that log every clip). Add an entry after solving anything that took troubleshooting; the know-how hook reminds you when a ticket closes.
---

# Ms. Luna know-how

Problems we have already beaten, and how. **Check here before troubleshooting.**
If the answer is here, use it. If it isn't, and solving it took real
troubleshooting, add an entry when you're done.

## Adding an entry

Add one when getting to the fix took a wrong first theory, a check you had to
build, or a tool that misbehaved. Skip routine fixes.

- Put it under the closest heading, or start a new one named after the
  **symptom** as Alex would describe it ("sounds like the robot voice"), not
  after the code.
- Four short parts: **Symptom**, **Cause**, **Fix**, **Check**. Name files and
  commands. Add the date and the ticket ID if there is one.
- Rewrite an entry that turns out wrong; don't add a second one beside it.
- Reusable scripts go in this folder next to this file, not in the scratchpad,
  which is deleted after the session.

---

## Luna sounds like the robot (browser) voice

*2026-10-09 · BUG-5, BUG-18*

- **Symptom:** a line plays in the flat built-in browser voice instead of Luna's.
  In Alex's Firefox each browser-voice line also ends in a loud electric
  ping or pop, which can be all he notices ("a pop where the word should be").
  **A ping or pop right after a voice:render means a stale tab, not a bad clip:**
  don't go analysing the audio files (2026-10-10, BUG-6 lost an hour to that).
- **Cause 1, the most common:** a stale tab. The app loads the voice index
  (`public/voice/af_heart/manifest.json`) when the page loads. Vite hot-reloads
  changed text into an open tab but not the index, so every new or changed line
  has no clip there. `voice:render` also prunes clips for old lines, so those
  404 in a stale tab too.
  - **Since OPS-6 (2026-10-10)** a line missing from the index makes
    `voiceClips.get()` fetch the index again (at most once every 5 s per
    voice), so a stale tab picks up new lines by itself. A line tapped in
    the first 5 s after the tab loaded, or again within 5 s of the last
    refetch, can still fall back once. Pruned clips are still a stale-tab
    problem: their keys are in the old index, so nothing refetches.
  - **Fix:** if it still falls back, reload the tab. After any
    `voice:render`, tell Alex to reload, plainly and first, before asking him
    to listen to anything. Alex usually has `npm run dev` open on port 5173,
    in Firefox.
  - **Check:** `stale-index-check.cjs` in this folder serves an old index
    (one line removed) and then the real one, and proves the line plays a
    clip without a reload. It runs against Vite on port 5198.
- **Cause 2:** a speech path that neither `scripts/voice/inventory.ts` nor
  `scripts/voice/audit.mjs` reads, so the line never got a clip and the audit
  still passes. Seen so far:
  - `lunaLine: '…'` literals handed to `api.win/miss/tick` (BUG-18);
  - bare `string[]` answers under `comprehensionQuestion.options` (BUG-5).
  - **Fix, in this order:** teach the audit to see the path and watch it
    **fail**, then add it to the inventory, `npm run voice:render`, and
    `npm run voice:audit` passes. Fixing the inventory first proves nothing.
- **Check:** confirm the index is whole (every entry's file exists):

  ```bash
  node -e 'const fs=require("fs");const m=JSON.parse(fs.readFileSync("public/voice/af_heart/manifest.json","utf8"));const miss=Object.values(m.clips).filter(f=>!fs.existsSync("public/voice/af_heart/"+f));console.log(Object.keys(m.clips).length,"keys,",miss.length,"missing")'
  ```

  Then run `npm run voice:audit`. In a browser check (below), any line that
  falls back shows up in `window.__browserSpoke`.
- **Not the cause:** `voice:render` pruning. It only removes clips no line uses
  any more. Diff the old and new index keys
  (`git show HEAD:public/voice/af_heart/manifest.json`) to prove it.

## A new line says "ay" for "a", or needs a clear pause

*2026-10-10 · BUG-6*

- **Symptom:** a new prose line comes out wrong: "I see **ay**…" instead of
  "I see uh…", or a pause you wrote with "..." is too short to hear.
- **Cause:** Kokoro reads prose through espeak, which decides stress from the
  punctuation around a word. An "a" right before a comma, "..." or "—" is
  stressed into the letter name. And punctuation alone never gives more than
  about 0.3 s of quiet, whatever you write ("...", "… …", "; ...").
- **Fix:**
  - "a" before "...": `speakable()` in `scripts/voice/lexicon.mjs` respells
    it "uh" in the audio only.
  - A longer pause: say the line as parts with `{ pause: ms }` between them
    (`SpeechPart`, played by `speakSequence`). Treasure Path's gap is the
    example: `readWithGap` in `engine/content.ts`.
- **Check:** before rendering, run each line through the phonemizer that
  kokoro-js uses, and look for `ˈeɪ` where you meant "a":

  ```bash
  node --input-type=module -e "import { phonemize } from 'phonemizer'; for (const t of ['I see a...','I see uh...']) console.log(t, (await phonemize(t,'en-us')).join(' | '))"
  ```

  To measure a pause, use the timed browser check (below): the gap between
  one clip's end and the next one's start.

## Two voices at once, or a line cut off

*2026-10-09 · BUG-19 (and BUG-1)*

- **Symptom:** after an answer, two things seem to talk at once, or Luna's
  cheer starts and dies.
- **Cause:** a game speaks and calls `api.win()`/`api.miss()` in the same
  moment. The shell starts Luna's reaction, then the game's line `stop()`s it a
  few hundred ms in. Every new utterance stops the previous one, so "overlap"
  is usually a cut-off burst, not two clips playing together.
- **Fix:** take turns. Say the game's line, then call `api.win/miss` from its
  `onEnd`, with a watchdog timer (in case `onEnd` never fires) and a busy ref
  that ignores taps meanwhile. Two working examples: `useAnswer` in
  `components/lessonHooks.ts` and `feed()` in `games/FeedLuna.tsx`. FB-1 will
  move every game onto one `api.answer()`.
- **Check:** measure, don't guess. `speech-check.cjs` in this folder times
  every clip and marks the ones that were cut. Fixed looks like
  `little@8–550 | ell@670–1113 | <cheer>@1235–2698`, with nothing marked `(cut)`.

## Proving a fix in a real browser, silently

*2026-10-09*

Copy `speech-check.cjs` from this folder and edit its scenario. It already:

- starts nothing itself. Run your own server on **port 5199**
  (`node_modules/.bin/vite --port 5199 --strictPort`, in the background) and
  leave Alex's 5173 alone. Stop it afterwards with `pkill -f "vite --port 5199"`.
- launches the installed Chrome via `puppeteer-core` with `--mute-audio` and
  **stubs `speechSynthesis`**. Without that, the macOS voice talks over Alex
  and any fallback goes unnoticed. With it, fallbacks land in
  `window.__browserSpoke`.
- logs every utterance by importing the app's own module in the page:
  `await import('/src/utils/pronunciation.ts')`. Under Vite that is the same
  instance the app uses. It then wraps `pronunciation.say`, whose second
  argument is the text.
- times every clip by wrapping `AudioBufferSourceNode.prototype.start/stop`.

Selectors that work: `.ipad-reading-app-card`; `.grade-card-item` (0 K, 1 1st,
2 2nd); lessons are `.hub-lessons .game-thing` and games are
`.hub-rug .game-thing:not(.nook)`, both named by `.thing-title`;
`.play-button`; `.game-shell.phase-play` / `.phase-reward`; and
`.round-pips[aria-label]`, which changes each round.

Pitfalls that cost time:

- `.round-pips` disappears when a lesson ends, so treat a missing one as
  finished.
- A round advances only after the win delay. Detect a right answer from state
  (for example `.cookie.is-eaten`), not by waiting a fixed time.
- "Let's start Kindergarten!" plays before the first clip of anything opened
  from the hub.
- Word chips have no spaces between them in `textContent`. Join their texts
  with `' '`.
- Scan what a child can see with `document.querySelector('.game-shell').innerText`.

## A hook test says nothing, but the hook is fine

*2026-10-09*

- **Symptom:** piping a sample payload into a hook script gives no output,
  though the script looks right.
- **Cause:** zsh's `echo` turns `\n` inside the JSON into real line breaks, so
  `JSON.parse` fails and the hook exits quietly, as it is meant to on bad
  input.
- **Fix:** pipe with `printf '%s' '<json>' | node .claude/hooks/<hook>.mjs`.
- **Check:** to prove a hook fires inside Claude Code, prefix its command in
  `.claude/settings.json` with `echo "$(date) hook fired" >> <scratch>/hook-check.txt;`,
  trigger it, read the file, and then remove the prefix.

## Checking every lesson's text without a browser

*2026-10-09 · BUG-5*

Bundle the curriculum and scan it in plain Node:

```bash
node_modules/.bin/esbuild src/data/readingCurriculum.ts --bundle --format=esm --platform=node --outfile=<scratch>/curriculum.mjs
```

Import `READING_CURRICULUM` from that file and walk the
skills → lessons → questions. Run the scan against the last commit too
(`git show HEAD:src/data/readingCurriculum.ts`): a scan that finds nothing in
the old version either proves nothing.

## A page of raw code pops up in Alex's browser

*2026-10-09 · DES-2*

- **Symptom:** a broken-looking page opens on its own: CSS as plain text,
  `%%PLANT …%%` placeholders and unstyled buttons, at a `file:///private/tmp/…`
  address.
- **Cause:** the desktop app opens any `.html` file Claude writes in the
  browser. A partial file (a fragment, a template piece) looks broken on its own.
- **Fix:** give files that aren't whole pages a non-HTML extension (`.frag`,
  `.part`, `.txt`). Tell Alex the page is a scratch file and safe to close.
- **Check:** writing the file opens nothing.

## The prototype doesn't follow the canvas's light/dark button

*2026-10-09 · DES-2*

- **Symptom:** the style sample canvas's own light/dark button changes the
  canvas but not the screens on it.
- **Cause:** each board is its own page in a frame, and only follows the theme
  if its script listens. The canvas passes the theme three ways: a
  `data-theme="dark|light"` attribute on the board's page, `?theme=dark` in its
  address, and a `{ type: '__dc_theme', theme }` message when the button is
  pressed. Its runtime only uses them to colour the background.
- **Fix:** the board reads the attribute or the address on load, and listens
  for the message, changes to the attribute, and the device setting
  (`prefers-color-scheme`). See `THEME_JS` in
  `.claude/skills/luna-design/prototype/gen.py`. Signed-out viewers don't see
  the canvas's button, so the prototype keeps its own Light/Dark button as well.
- **Check:** in the built-in browser (signed out is fine), open the canvas and
  set the colour scheme to light, then dark (`resize_window` with
  `colorScheme`). The open board switches without a reload, and after a reload
  it matches the canvas.

## The backlog guard refuses a command that doesn't change the backlog

*2026-10-09 · OPS-4*

- **Symptom:** "Backlog guard: change the backlog (kanban/) with the Edit or
  Write tool, not the shell" on a command that only reads `kanban/`, or on a
  script that never touches it.
- **Cause:** the guard can't see inside a script, so a command that names
  `kanban/` **and** runs `node`, `python` or `ruby` (or uses `rm`, `mv`, `cp`,
  `mkdir`, `touch`, `sed -i`, `tee` or a redirect) counts as a write. Putting
  `ls kanban` and `rm …` in one command trips it too.
- **Fix:**
  - Give reads (`grep`, `cat`, `ls`) a command of their own.
  - Run scripts without naming `kanban/` on the command line: pass the repo
    root (`"$PWD"`) and let the script build the paths.
  - Make real changes with Edit or Write, where the guard can check them.
  - Don't edit the guard to get past it. If it's genuinely wrong, fix the rule
    and rerun `node .claude/skills/backlog/guard-check.mjs "$PWD"`.
- **Check:** the split command runs, and the guard check still shows every
  case as expected.

## Lint suddenly fails with dozens of errors in `.d.ts` files nobody wrote

*2026-10-10 · OPS-5*

- **Symptom:** `npm run lint` (or the guard closing a ticket) fails with ~49
  `no-empty-object-type` errors in `.claude/mods/luna-board/.claude-plugin/types/…/index.d.ts`.
- **Cause:** since the board loads straight from its repo folder
  (`CLAUDE_CODE_PLUGIN_DIRS`), Claude Code writes its API typings into the
  mod's `.claude-plugin/types/` on every load, and ESLint lints them.
- **Fix:** `eslint.config.js` ignores `.claude/mods/*/.claude-plugin/types`,
  and `.gitignore` does too. The mod's small `tsconfig.json` that extends them
  is also written by the load and is harmless.
- **Check:** `npm run lint` is clean.

## A luna-board mod test can't find the file it reads

*2026-10-09 · OPS-4*

- **Symptom:** in `claude plugin test .claude/mods/luna-board`, an `fs.read`
  mock keyed by `kanban/README.md` returns nothing, so the board is empty and
  no epic files are read.
- **Cause:** the test engine hands the mock absolute paths
  (`<mod folder>/kanban/README.md`). It resolves the mod's relative paths
  against the mod's own folder; in a real session they resolve against the
  project.
- **Fix:** match on the end of the path, as `fileAt` in
  `tests/board.test.tsx` does.
- **Check:** `claude plugin test .claude/mods/luna-board` passes, and its
  assertions show the README, each linked epic file and the changelog were read.
