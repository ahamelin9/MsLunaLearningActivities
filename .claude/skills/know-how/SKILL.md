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
  - bare `string[]` answers under `comprehensionQuestion.options` (BUG-5);
  - a fixed line handed straight to `speakText('…')`, `speakSentence('…')`
    or `soundManager.speak('…')` (BUG-15, 2026-10-10).
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
- **A letter's name sounds wrong** (*2026-10-10, BUG-23*): name clips are
  rendered from `letterNameSpeech` in `src/utils/phonics.ts` exactly as
  written, with no lexicon step. "ay" came out "eye" and "eff" was spelled
  "ee-eff-eff"; now "eigh" and "ef". After changing any of them, run them all
  through the phonemizer: bundle `phonics.ts` with esbuild and phonemize each
  `letterNameSpeech`. Every one should be its letter's name alone.
- **Past-tense "read" says "reed"** (*2026-10-10, GAME-1a*): espeak can't
  tell the tense, so "Luna read until…" comes out `ɹˈiːd`. Reword the line
  ("Luna kept reading…", "Luna learned about…"). The old story line "so she
  read three books" is BUG-22.
- **Check:** before rendering, run each line through the phonemizer that
  kokoro-js uses, and look for `ˈeɪ` where you meant "a", and `ɹˈiːd` where
  you meant the past:

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
  A second chat working at the same time uses **5198** instead.
- launches the installed Chrome via `puppeteer-core` with `--mute-audio` and
  **stubs `speechSynthesis`**. Without that, the macOS voice talks over Alex
  and any fallback goes unnoticed. With it, fallbacks land in
  `window.__browserSpoke`.
- logs every utterance by importing the app's own module in the page:
  `await import('/src/utils/pronunciation.ts')`. Under Vite that is the same
  instance the app uses. It then wraps `pronunciation.say`, whose second
  argument is the text.
- times every clip by wrapping `AudioBufferSourceNode.prototype.start/stop`.

Selectors that work (the shell's and the hub's classes went with DES-18b
and DES-18c): `[data-shot="open-reading"]` for the home icon;
`[data-shot="grade-card"]` (0 K, 1 1st, 2 2nd); lessons are
`[data-shot="lesson-tile"]` and games `[data-shot="game-tile"]`, a game
named by its `[data-shot="tile-title"]`; `[data-shot="play"]`;
`[data-shot="shell-play"]` / `[data-shot="shell-reward"]`; and
`[data-shot="round-pips"][aria-label]`, which changes each round.

Prove the check can fail: switch the fix off for a moment (for example, set
its constant to something huge), rerun, and watch it go ❌, then put the fix
back. A check that passes either way proves nothing. OPS-6 did this.

To test something the app can't trigger on demand, such as an old voice
index, intercept the request in puppeteer (`page.setRequestInterception`)
and serve your own response. `stale-index-check.cjs` is the example.

Pitfalls that cost time:

- **A puppeteer run prints its result but never exits** (*2026-10-10,
  GAME-1b*): copies of `speech-check.cjs` sometimes keep running after the ✅
  line. Their output is complete by then. Stop just that process by its script
  path (`pkill -f "scratchpad/<name>.cjs"`), and never with a bare
  `pkill -f vite`: that would also stop Alex's server on 5173. Cause not
  tracked down yet; `ui:shots` now ends with `process.exit` (DES-18a), and a
  copied check can do the same.
- **Class names stop working from DES-18b:** CSS modules rename them, so the
  selectors above break as each area moves. The stable hooks are `data-shot`
  names (DES-18a): `home`, `open-reading`, `grade-select`, `grade-card`, `hub`,
  `hub-rug`, `hub-tin`, `lesson-tile`, `game-tile`, `tile-title`,
  `shell-intro`, `shell-play`, `shell-reward`, `play`, `shell-back`,
  `round-pips`, `win-veil`, `lesson-choice`, `open-settings`, `settings`,
  `open-trophies`, `trophies`, `modal-close`. OPS-9 moves the checks in this
  folder onto them.
- **"Does it still fit?"** for a screen whose content grows by grade (Treasure
  Path's 2nd-grade passages): `ui:shots` only plays Kindergarten. Play the game
  at 2nd grade at 1024×768 (the smallest landscape iPad) and compare the
  stones' and choices' `getBoundingClientRect()` with the stage's.
  `treasure-fit.cjs` in this folder does that for Treasure Path, and
  `treasure-check.cjs` plays it at one grade and reports anything said or
  shown that gives an answer away.

- `.round-pips` disappears when a lesson ends, so treat a missing one as
  finished.
- A round advances only after the win delay. Detect a right answer from state
  (for example `.cookie.is-eaten`), not by waiting a fixed time.
- "Let's start Kindergarten!" plays before the first clip of anything opened
  from the hub.
- Word chips have no spaces between them in `textContent`. Join their texts
  with `' '`.
- Scan what a child can see with `document.querySelector('.game-shell').innerText`.

## Two screenshot runs of the same code don't match

*2026-10-11 · DES-18a*

- **Symptom:** `npm run ui:shots -- --diff a b` lists screens that differ
  although nothing changed: a whole screen (Grade Select caught with the app
  window half zoomed in), or 1–4 pixels at an edge (Luna's beak on the
  reward screen, a letter in Letter Jar), usually only at one size.
- **Cause:** anything that runs on the browser's real clock. Seeding
  `Math.random` and fixing `Date.now` aren't enough:
  - timers and Luna's real audio move the app on (Bubble Sounds' bubbles,
    What's Missing's countdown, Luna's talking pose);
  - CSS animations run on the compositor in real time. One finished from
    script is only on screen after the next paint, and a layer caught
    mid-animation can be rasterised at a slightly different scale, which
    shows up as a few changed edge pixels.
- **Fix:** all in `scripts/ui/shots.mjs`:
  - `installPageClock` puts the page on a clock the script moves (timers,
    `Date`, `performance.now`, `requestAnimationFrame`, silent clips that
    "end" after their length), and waits for fetches and decodes before each
    step;
  - `Animation.setPlaybackRate` 0 (DevTools protocol) keeps CSS animations
    standing still, so `holdAnimations` is the only thing that moves them;
  - `painted()` waits two real frames before the screenshot.
  - Not the fix: `--disable-gpu`. Software drawing made it worse (more
    edge pixels, and the zoom still caught).
- **Check:** three runs in a row, then `--diff` each pair: 0 changed screens
  at all 4 sizes. To prove the diff can fail, change a 1 px border's colour
  (the status bar's bottom line shows on 24 of 26 screens at y 47), or one
  pixel of a copied run with `pixel-poke.cjs` in this folder: 9 per channel
  shows up as 1 pixel, 8 doesn't.

## A move to CSS modules: proving nothing changed, even what no screenshot shows

*2026-10-11 · DES-18b, DES-18c*

- **Symptom:** `ui:shots --diff` says 0 changed screens, but the shots never
  reach some states: a loading badge, a "playing" pulse, a Button variant, a
  screen no shot visits (ComingSoonApp). A wrong `data-state` selector there
  would pass unseen.
- **Cause:** the diff only proves what the 26 screens show. Modules also break
  in ways a shot may miss: a `styles.x` with a typo is `undefined` (no class,
  no error), and a class or `@keyframes` that another file defined stops
  matching, because each module renames its own.
- **Fix:** before converting, find what crosses files, in both directions:
  - a class one file styles and another renders, and keyframes used outside
    their file (Trophy's backdrop and pop-in lived in `SettingsModal.scss`,
    the home bubbles in `App.scss`; GameShell centred a lesson with
    `> .lesson`, the lesson's own class);
  - CSS that now loads at a different time. A rule moved into a component
    loads when that component is first imported: SpeakChip's CSS now loads
    before `games.scss`, where the shell's used to load after it. That's
    only safe if no game rule of equal specificity targets the same element,
    so check the game rules on it first.

  Move each one to the file that uses it, or copy it with a comment naming
  the ticket that removes the copy. The changelog's DES-18b and DES-18c
  entries have the table of what becomes what.
- **Moving into folders:** `node .claude/skills/know-how/move-into-folders.mjs "$PWD" <moves.json>`
  moves each `.tsx` and `.module.scss` and repoints every import the move
  breaks: relative inside an app, `@/…` otherwise, and `@use` from `src/`.
- **Check:** three things.
  - `ui:shots --diff before after`: 0 changed screens, after the in-place
    conversion and again after the move into folders.
  - `node .claude/skills/know-how/module-refs-check.mjs "$PWD" <folders>`:
    every `styles.x` resolves and no `className="…"` is left. It fails on a
    folder not converted yet, and on a planted typo.
  - `git archive HEAD src | tar -x -C <scratch>/head`, then
    `node .claude/skills/know-how/css-rules-compare.mjs "$PWD" <scratch>/head <map.json>`:
    compiles every stylesheet then and now and compares all the rules as one
    whole, so a moved rule or a renamed file cancels out. The map's renames
    (`[["\\.toggle-on", "[data-state=on]"], …]`) apply only to sheets that
    became modules or went; a sheet still global is compared as it is, so
    its own edits show up. Without the map it fails, which proves it can.
    (Its first version paired files by name and called the renamed
    `ReadingHub.scss` → `Hub.module.scss` all new; it compares the whole
    tree since DES-18c.)

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

## A wrong answer is also right, or gives the answer away

*2026-10-10 · CNT-1a (BUG-3, BUG-4)*

- **Symptom:** K is "wrong" when Luna says the C sound; What's Missing offers
  something still on the desk; BOAT with ⛵ 🚗 ✈️ is solved by its first letter.
- **Cause:** each game picked its wrong answers its own way.
- **Fix:** pick them with `pickWrong` in `src/apps/reading/engine/distractors.ts`.
  Its `ruleBreaks` is the one list of rules (same sound, answer twice, on
  screen, same picture, first letter).
- **Check:** `node .claude/skills/know-how/distractor-check.mjs` plays every
  game 300 times at each grade and dial (seeded, so a failure repeats), reads
  every lesson, and exits 1 on any broken rule. Give it a folder holding
  another `src/` to judge older code by today's rules:
  `git archive HEAD src | tar -x -C <scratch>/head`, then pass `<scratch>/head`.
  A new game or lesson type fails until it has an adapter in the script. Its
  self-test plants one bad set per rule, so a rule that stops working fails too.
- **Pitfall:** a rule that never fires may mean the game never builds that
  round. W/WH never showed up because Bubble Sounds only asks for the first 12
  letters (BUG-21).
- **A wrong word that also fits a blank** (*CNT-1b*): code can't judge that,
  so every fill-in-the-blank item carries `alsoFits`, the words that would also
  make it true, written by hand. Pass it to `pickWrong` as
  `blank: { alsoFits }`. Same-type false words stay ("The sun is cold"). The
  check scans every item directly as well as playing the games, because
  `pickWrong` quietly skips a decoy that's on the list, so plays alone would
  never show a bad decoy in the data. A new kind of fill-in-the-blank goes in
  `FILL_INS` in the check. To prove it can fail, copy `src` to the scratchpad,
  put one decoy on its item's list and delete another item's list, and pass
  that folder. Make sure the planting script actually writes the file: a
  planted copy that passes usually means it didn't.
- **Treasure Path's passages** (*GAME-1a*): `node .claude/skills/know-how/passage-check.mjs`
  holds `PASSAGES` to their writing rules (6 per grade, sentences per grade,
  both statement types, no 4 words copied in a row, every blank's list, and
  no blank whose neighbouring words sit beside its answer in the passage). It
  takes a `<src-root>` the same way. Writing a blank, the easy trap is "the":
  "in the ___" beside "in the garden" gives the answer away, so put a
  different word next to the gap ("in her ___", "Luna's ___").

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
- **Splitting a ticket (2026-10-10, CNT-1):** the old ID leaves the board, so
  it needs a changelog line ("Won't do: split in two…"). That line must not
  name the new IDs (`CNT-1a`), or adding their board rows is refused as
  "already used in the Changelog". Order: new sections, the changelog line,
  the board rows, then delete the old section.

## Auto mode refuses to write a git hook file

*2026-10-10 · DES-25*

- **Symptom:** a shell command that creates `.githooks/pre-commit` (a heredoc
  plus `chmod +x`) is refused by Claude Code's auto-mode classifier as
  "Unauthorized Persistence".
- **Cause:** writing an executable into a hooks folder looks like setting up
  something that runs on its own later, whatever the ticket says.
- **Fix:** create the file with the Write tool, like any other repo file, and
  leave `chmod +x` and `git config core.hooksPath .githooks` to Alex as his
  one-time turn-on steps (the map's "How to…" lists both). Don't retry the
  shell version or look for another way to set the bit.
- **Check:** `sh .githooks/pre-commit` runs `npm run lint` and exits with its
  status, without needing the executable bit.

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
