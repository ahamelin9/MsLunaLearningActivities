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
    or `soundManager.speak('…')` (BUG-15, 2026-10-10);
  - a line passed as a component prop that speaks it later: Grade Select's
    Mascot took `speechText="Welcome! …"` (DES-9c, 2026-10-12; deleted with
    it). Write a fixed line as a `{ text: '…' }` part instead: the inventory
    reads those wherever they sit.
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
  ("Luna kept reading…", "Luna learned about…"); respelling only the audio
  would still leave a tapped "read" saying "reed". `read-tense-check.mjs`
  lists every spoken "read" with its sound and flags the past tense (BUG-22
  reworded "The Rainy Day Plan").
- **Check:** before rendering, run each line through the phonemizer that
  kokoro-js uses, and look for `ˈeɪ` where you meant "a", and `ɹˈiːd` where
  you meant the past:

  ```bash
  node --input-type=module -e "import { phonemize } from 'phonemizer'; for (const t of ['I see a...','I see uh...']) console.log(t, (await phonemize(t,'en-us')).join(' | '))"
  ```

  To measure a pause, use the timed browser check (below): the gap between
  one clip's end and the next one's start.

## A letter sound sounds wrong ("buh", "TV static", robotic)

*2026-10-28 · VOX-1*

- **Symptom:** a phonics sound has an "uh" after it, sounds like static or a
  robot, starts with a breath ("h-ee"), or a blend loses its second sound.
- **Cause:** how `scripts/voice/phonemes.mjs` makes it. Round 1's hisses were
  synthetic noise shaped like her hiss (`resynthNoise`): "TV static". Held
  vowels and hums stretched by PSOLA at a flat pitch sound robotic. Vowels cut
  from "he", "high" or "core" keep the h or k breath in front. Kokoro
  devoices L, R and W after K, P, T and F, so a blend cut from a word has no
  voiced second sound to hold.
- **Fix:** see the VOX tickets for what Alex picked, and
  `voice-audit/README.md` in this folder for the tools: her real hiss held by
  grains, vowels said slowly, `human: true` for a natural wobble, a blend's
  second sound held (`holdSecond`, `noVowel`) or joined, and `edgetrim.py` for
  a word's stray edges.
- **Check:** your ear first (the Sound Check page; a machine ear can't judge
  vowels or held sounds), then `voice-audit/score.py` for the consonants.

## Two voices at once, or a line cut off

*2026-10-09 · BUG-19 (and BUG-1)*

- **Symptom:** after an answer, two things seem to talk at once, or Luna's
  cheer starts and dies.
- **Cause:** a game speaks and calls `api.win()`/`api.miss()` in the same
  moment. The shell starts Luna's reaction, then the game's line `stop()`s it a
  few hundred ms in. Every new utterance stops the previous one, so "overlap"
  is usually a cut-off burst, not two clips playing together.
- **Fix (FB-1, 2026-10-18):** there is one answer path. A game calls
  `api.answer({ correct, say, hint, lunaLine, delay })`; the shell says `say`
  whole, then reacts from its `onEnd` (with a watchdog: 2.5 s for a miss, 7 s
  for a right answer, whose read-back can be a sentence), and `api.locked` is
  true meanwhile, so taps wait. `api.tick({ say })` does the same for a small
  beat. `win`/`miss` aren't on `GameApi` any more, so a game can't react over
  its own line again; lessons' `useAnswer` is a thin wrapper over `answer`.
  A game line that isn't an answer (a tick's letter, a flip) is still said
  with `pronunciation` directly.
- **Check:** measure, don't guess. `answer-check.mjs` in this folder plays all
  8 games (`--only <title words>` for one) and checks that every answer's
  sequence ended by itself (its `onEnd` came, so no watchdog) with no clip cut
  meanwhile. `speech-check.cjs` times every clip and marks the cut ones, but it
  still finds things by the old class names (OPS-9).
- **Pitfall, two answers in one moment:** `api.locked` reaches a game only on
  its next render, so a tap that is also a click (Feed Luna's pointer-up, then
  its button's `onClick`, BUG-2) answered twice, and the second `speakSequence`
  cut the first. The shell guards with a ref (`saying`), not only the
  `answering` state.
- **Pitfall, StrictMode:** in dev React mounts, cleans up and mounts again. A
  "still mounted" ref set `false` in a cleanup must be set `true` again in the
  effect, or everything it guards stops (the shell never reacted to an answer).
- **Pitfall, Story Corner's words:** they're spans in its lines while it hunts
  (`[data-state="huntable"] > span`), not buttons.
- **Pitfall, a round's own data:** Words Off the Page's right order isn't on
  screen (it's heard). A check reads it from React: from a tile button up the
  fiber (`__reactFiber…`, then `.return`) to the props holding `round.words`.
  Starting from the stage walks the wrong way: the game is below it.

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
  - **Pitfall, a second copy** (*2026-10-11, DES-15*): once Vite has
    hot-reloaded a module, the page loads it as `…/pronunciation.ts?t=…`, and
    the bare path imports a fresh second copy that nothing on screen listens
    to. A wrap or a call on it then does nothing, and the check fails for no
    reason. Import the URL the page actually loaded:
    `performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/pronunciation.ts'))`
    (as `kit-check.mjs` does), or restart Vite.
  - **Pitfall, a check spoiled by your own edits** (*2026-10-19, BUG-28*):
    while a check runs against Vite, an edit to any `src` file the app
    imports hot-reloads it mid-play, and any `.html` saved anywhere in the
    repo (a review page under `.claude/`, say) reloads the whole page
    (`vite.log`: "page reload …html"). During a long loop of runs, edit only
    files the app doesn't import yet, and keep sample pages in the scratchpad
    until it's done.
- times every clip by wrapping `AudioBufferSourceNode.prototype.start/stop`,
  each labelled with the line it was fetched for (it wraps `fetchClip` and
  keeps each decoded clip's line; OPS-9).

Selectors that work: only `data-shot` names and `data-state` (OPS-9; CSS
modules rename every class). `[data-shot="open-reading"]` for the home icon;
`[data-shot="grade-card"]` (0 K, 1 1st, 2 2nd); lessons are
`[data-shot="lesson-tile"]` and games `[data-shot="game-tile"]`, either
found by its text (a game's name is its `[data-shot="tile-title"]`; a
lesson's tile has its number too); `[data-shot="play"]`;
`[data-shot="shell-play"]` / `[data-shot="shell-reward"]`; and
`[data-shot="round-pips"][aria-label]`, which changes each round. Since DES-8
the header (`AppHeader`) carries `shell-back` (Library), `round-pips` and
`app-home` (Home, which leaves the app); in the library the header's stars
are `open-trophies` (PRG-5a), the Squishy Shelf card's arrow `open-shelf`
(the shelf is `shelf`, its count `shelf-count`), and a done screen's new
squishy `done-squishy` with `see-shelf` beside Play again. A game's answers are the stage's Choices,
`[data-shot="stage"] button[data-kind]`, right once
`[data-state~="right"]`. Game pieces: Letter Cookies' `cookie` (its letter
in `aria-label`, eaten as `right`); Treasure Path's `treasure-passage`,
`treasure-claim` or `treasure-sentence`, `treasure-gap` (`filled` once
solved) and `read-to-me`; Bubble Sounds' bubbles by
`[aria-label^="bubble "]`.

Prove the check can fail: switch the fix off for a moment (for example, set
its constant to something huge), rerun, and watch it go ❌, then put the fix
back. A check that passes either way proves nothing. OPS-6 did this.
To swap several files back to the commit for one run, keep copies, `git show
HEAD:<file> > <file>`, run, copy back and `cmp` each. **Pitfall, zsh:** the
shell here is zsh, which doesn't split `$FILES` into words: a loop over it
runs once on the whole string, every `cp` fails, and the check quietly runs
on the new code (PRG-1, 2026-10-19). Use an array,
`files=(a b c); for f in "${files[@]}"`, and confirm the swap before
trusting a pass.

To check the app still works offline (fonts and all, as on a classroom iPad
with no Wi-Fi), run `offline-check.mjs` from this folder (DES-4): it blocks
every request that leaves the machine and reports the font faces that loaded
and anything the app tried to fetch outside. "blocked requests: none" is the
pass.

To test something the app can't trigger on demand, such as an old voice
index, intercept the request in puppeteer (`page.setRequestInterception`)
and serve your own response. `stale-index-check.cjs` is the example.

Pitfalls that cost time:

- **A check passes on old code for the wrong reason** (*2026-10-12,
  PRG-7*): "no 'Next lesson' when the next is locked" passed against the
  commit before, because it looked for a `data-shot` that commit didn't have,
  so it never saw the button at all. When proving a check can fail, read
  each ✅ the old code still gets and ask why. Find things by what a child
  sees (a button's words) when the hook may not exist in the code compared.
- **Two checks on one Vite, or a Vite left running for hours** (*2026-10-13,
  DES-22d*): the grade 2 layout audit crashed with "Attempted to use detached
  Frame" while other browser checks used the same server on 5199, and a
  rerun then timed out on its very first page load ("Navigation timeout of
  30000 ms"), on a Vite that had been up and hot-reloading all session. Run
  one browser check at a time, and if a first load times out, restart Vite
  (`pkill -f "vite --port 5199"`, then start it again). Grade 2's audit takes
  over 10 minutes since it plays Lesson 1 to its done screen, so run it in
  the background.
- **A check run with `node -e` can't import a file next to it** (*2026-10-17,
  OPS-10*): `offline-check.mjs` runs as `node --input-type=module -e "$(cat …)"`,
  so `import … from '../../../scripts/chrome-path.cjs'` resolved from the
  current folder and failed with `ERR_MODULE_NOT_FOUND` for
  `/Users/scripts/chrome-path.cjs`. Under `-e` find repo files from the repo
  root instead: `createRequire(join(process.cwd(), 'package.json'))('./scripts/chrome-path.cjs')`.
  Packages (`puppeteer-core`, `vite`) still import by name.
- **Two Kit page rows with the same heading** (*2026-10-18, DES-22b*): a new
  kit-check line found "the Try it row" by a heading starting "Try it", and
  read Choice's ("Try it: the answer is M") instead of ListenCue's ("Try it:
  tap the arch"), so it saw no burst. Match a heading in full. And a Try it
  row an earlier line left toggled (found, not waiting) has no "Found it"
  button: put it back to its start inside the check before using it.
- **Review shots mid-play** (*2026-10-18, DES-22b*): ui:shots stops the clock
  at a round's start, so it never shows a game being played. `game-shot.mjs`
  next to this file opens a game, plays a little and shoots: Bubble Sounds'
  bubbles up in the water, two Muddled Cards turned over, a wrong and a
  caught Letter Jar letter, a wrong cookie. Add a game's own moments to it
  the same way (`untilState` taps pieces until one takes a `data-state`).
- **`pkill -f "vite --port 5199"` killed my own command** (*2026-10-12*):
  `-f` matches whole command lines, so a status check whose own text held
  that string (`pgrep -fl "vite --port 5199|…"`) was killed with it (exit
  144). Keep the pattern out of other commands running at the same time.
  The same trap waits forever (*2026-10-18, DES-23*): `until ! pgrep -f
  "layout-audit.mjs 5199"; do sleep 20; done` finds its own shell, whose
  command line holds the pattern, so it never ends, and a pile of such
  loops sat in the background for hours. Run the long check itself in the
  background and let its own end notify you, or wait on a file it writes.
- **A puppeteer run prints its result but never exits** (*2026-10-10,
  GAME-1b*): copies of `speech-check.cjs` sometimes keep running after the ✅
  line. Their output is complete by then. Stop just that process by its script
  path (`pkill -f "scratchpad/<name>.cjs"`), and never with a bare
  `pkill -f vite`: that would also stop Alex's server on 5173. Cause not
  tracked down yet; `ui:shots` now ends with `process.exit` (DES-18a), and a
  copied check can do the same.
- **A check copied to the scratchpad can't find puppeteer-core** (*2026-10-11,
  DES-20*): Node looks for packages next to the script, and the scratchpad has
  none. Run it from the repo instead: `node --input-type=module -e "$(cat <scratch>/check.mjs)" <args>`.
  Under `-e` the arguments shift by one (the first is `process.argv[1]`, not
  `[2]`), so a script reading `argv[2]` starts Vite in the wrong folder and
  every selector times out. Use `process.cwd()` for the repo root.
- **A screen's opening line is "said" twice** (*2026-10-12, DES-9c*): under
  Vite, React's StrictMode runs a mount effect twice, so a line spoken from
  `useEffect` shows up twice in `pronunciation.say`'s log. The second call
  stops the first before its clip loads, so only one clip plays. Count clips
  (`AudioBufferSourceNode.start`), not `say` calls; the production build
  says it once.
- **Every clip carries the first line's label** (*2026-10-12, DES-12; fixed
  2026-10-18, OPS-9*): in `speech-check.cjs`'s old harness, the clips after
  the first few all logged "Hi! Which grade are you in?". Cause: it swapped
  `playBuffer` for a one-off wrapper per line, and when two lines overlapped
  the second captured the first's wrapper, which then stayed in place for
  good. The harness now wraps `fetchClip` once and keeps each decoded clip's
  line (a `WeakMap` from buffer to `req.text`), and `start` reads it there.
  A copy of an older harness still has the bug: count instead (the line in
  `say`'s log, plus one more `start`).
- **A puppeteer press does nothing** (*2026-10-11, DES-5*): `page.mouse.down()`
  at a `boundingBox()` below the fold lands outside the viewport, so `:active`
  never applies and the check reads the resting style. Scroll the element into
  view first (`el.scrollIntoView({ block: 'center' })`), then take its box.
- **Class names stop working from DES-18b:** CSS modules rename them, so the
  selectors above break as each area moves. The stable hooks are `data-shot`
  names (DES-18a): `home`, `open-reading`, `grade-select`, `grade-card`, `hub`,
  `hub-rug`, `hub-tin`, `lesson-tile`, `game-tile`, `tile-title`,
  `shell-intro`, `shell-play`, `shell-reward`, `play`, `shell-back`,
  `round-pips`, `win-garden` (a won round, DES-11), `petals`, `lesson-choice`, `open-settings`, `settings`,
  `open-trophies`, `trophies`, `modal-close`, `app-home` (DES-8), `stage`
  (GameShell's stage, DES-10), and on the library `change-grade` (the
  header's grade) and `luna-mute` (the button beside her) (DES-21). Since
  SET-1, `open-settings` and `change-grade` open only on a 1.5s hold, and the
  Kit page's hold to try is `kit-hold`. The checks in this folder use only
  these (OPS-9).
- **"Does it still fit?"** for a screen whose content grows by grade (Treasure
  Path's 2nd-grade passages): `ui:shots` only plays Kindergarten. Play the game
  at 2nd grade at 1024×768 (the smallest landscape iPad) and compare the
  stones' and choices' `getBoundingClientRect()` with the stage's.
  `treasure-fit.mjs` in this folder does that for Treasure Path (give it an
  out folder and it saves each stone, light or dark: review shots at 1st and
  2nd grade, GAME-1c), and
  `treasure-check.cjs` plays it at one grade and reports anything said or
  shown that gives an answer away.

- `[data-shot="round-pips"]` disappears when a lesson ends, so treat a
  missing one as finished.
- A round advances only after the win delay. Detect a right answer from state
  (for example `[data-shot="cookie"][data-state~="right"]`), not by waiting a
  fixed time.
- "Let's start Kindergarten!" plays before the first clip of anything opened
  from the hub.
- Word chips have no spaces between them in `textContent`. Join their texts
  with `' '`.
- Scan what a child can see with `document.querySelector('[data-shot="shell-play"]').innerText`.

## When does Luna greet on the library, and does her mute work?

*2026-10-12 · DES-21*

- **Symptom:** you need to know she greets only when the library opens from
  home (not after Grade Select, not back from a game), that a tap repeats the
  line, that the header's grade leads to Grade Select, and that the button
  beside her mutes and unmutes her. That's too many paths to listen for.
- **Fix:** with Vite on 5199, `node .claude/skills/know-how/greeting-check.mjs 5199`
  walks them all, logging what `pronunciation.say` was asked and counting
  clip starts per step. It fails on the commit before DES-21, and its mute
  steps fail when the button is made to do nothing.
- **Pitfall, a line in parts:** "Shh… some letters are hiding" plays as two
  clips ("shhh", then the rest), so comparing what was said with the line's
  text misses it. Match by words (the check's `norm()`), or compare one
  step's said parts with another's.
- **Pitfall, a fresh line each visit:** the library picks her greeting as it
  mounts, so after a game a tap says that visit's line, not the one said
  from home. Tap her straight after the greeting to test "says it again".

## Does the grown-up gate hold? (SET-1)

*2026-10-18 · SET-1*

- **Symptom:** you need to know a child tapping around can't open Settings
  or change the grade: the home gear, the library gear and the grade button
  open only after a 1.5s press and hold, a quick tap shows "Grown-ups: press
  and hold", and the ring fills, under reduced motion too.
- **Fix:** with Vite on 5199, `node .claude/skills/know-how/gate-check.mjs 5199`
  (add `--reduced-motion` for the second pass). It taps, holds 1s and holds
  2.3s on each, reading `--hold-progress` halfway. `kit-check.mjs` checks the
  kit's hold mode on the Kit page.
- **A check that has to get past the gate:** hold, don't click. With a real
  clock, mouse down, wait 2.3s, mouse up (`greeting-check.mjs`'s and
  `lesson-order-check.mjs`'s `hold()`). On `ui:shots`' page clock, mouse down,
  then `until()` the thing it opens, which moves the clock on (its `hold()`).
- **Pitfall, off the screen:** a mouse press at a button's box only lands
  when the button is in view. The Kit page's "try it" gate sits below the
  fold, so scroll it into view first, or the press reaches nothing and the
  check reads "opened" as never.
- **Pitfall, two browsers at once:** `greeting-check.mjs` failed its "from
  home" step once while `kit-check.mjs` ran beside it, and passed alone. Run
  the timing-sensitive checks one at a time.

## Does the app follow light and dark? (DES-16)

*2026-10-18 · DES-16*

- **Symptom:** you need to know the app opens dark on an iPad set to dark
  (with no light flash first), turns light again when the iPad does without a
  reload, that Settings and the home screen's sun/moon button override the
  iPad and survive a reload, and that home shows the moon and stars at night.
- **Fix:** with Vite on 5199, `node .claude/skills/know-how/theme-check.mjs 5199`.
  It sets the browser's own setting with
  `page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }])`,
  which is what `ui:shots --theme dark` does too, and reads `data-theme` on
  `<html>` at `readyState` "interactive", before any module runs, to prove the
  inline script in `index.html` set it.
- **Pitfall, hidden by a parent:** the moon's own `display` stays `block`
  while its night layer is `display: none`, so "is it showing?" read from
  `getComputedStyle(el).display` says yes by day. Use `el.checkVisibility()`.
- **Pitfall, two places set the mode:** `index.html`'s inline script (before
  the first paint) and `src/utils/theme.ts` (after) both turn the saved choice
  into a mode. Change one, change the other.

## Does the milestone moon visit when she should? (DES-17, BUG-25)

*2026-10-18 · DES-17; rule changed 2026-10-19 · BUG-25*

- **Symptom:** you need to know the moon comes when the rule says (Alex's,
  BUG-25: all of a grade's lessons and the first lesson ever, once each; a
  lesson with 3 stars, every time; a game's first 3 stars, once per game),
  never otherwise; that only she talks while she's there; and that she
  leaves by herself.
- **Fix:** with Vite on 5199, `node .claude/skills/know-how/moon-check.mjs 5199`
  (and `--reduced-motion`). It plays for real, answering each round right the
  first time or after one miss (the answer read from React: a lesson's
  `question.options`, `isCorrect` or Rhyme Matcher's `isRhyme`; Letter
  Cookies' `round.answer`), sets `completedLessons` in the save to reach the
  last lesson quickly, and watches `[data-shot="moon-visit"]`: the done
  screen's Luna (`data-shot="done-luna"`) must never be `talking`, and the
  moon's mouth must be. The rule is `engine/milestones.ts`; once-only visits
  are claimed in `unlockedAchievements` (`moon-first-lesson`,
  `moon-all-<grade>`, `moon-3-stars-<gameId>`), so clear those to see her
  again.
- **Pitfall, frames alone miss her:** sampling only on
  `requestAnimationFrame` missed a visit now and then under reduced motion
  (her line was said, the check never saw her). It samples on a 40 ms timer
  and a MutationObserver too.
- **Pitfall, a fresh save:** opening Reading on a fresh save lands on Grade
  Select, not the library. Click a grade card before waiting for `hub`.
- **Pitfall, `ui:shots`:** its run finishes Lesson 1 on a fresh save, so its
  done screen (`26-reward`) may show the moon mid-visit, or not: on the shots'
  frozen page clock no clip plays, and when her clip hasn't started she leaves
  after 3 s (`MOON_WAIT_MS`), sometimes before the shot. After LVL-1 she was
  gone by then. Judge the moon with `moon-check.mjs`, not the shots.

## A tap counts twice, or a drag let go anywhere still counts (BUG-2)

*2026-10-18 · BUG-2*

- **Symptom:** in Feed Luna one wrong tap was two misses (the hint came after
  the first mistake), and a cookie dragged and let go far from Luna's beak was
  still fed to her.
- **Cause:** the cookie fed on pointer-up (tap or drop) *and* on the button's
  `onClick`. A tap is also a click; and with `setPointerCapture`, a drag's
  release lands on the same button, so the browser fires a click for it too,
  wherever it was let go.
- **Fix:** `onClick` feeds only when `e.detail === 0`: a keyboard or
  assistive click. Mouse and touch go through pointer-up alone.
- **Check:** `feed-check.mjs` (a tap, Enter, a tap on the right one, a drag to
  the beak, a drag let go elsewhere), counting misses by wrapping
  `soundManager.playTryAgain`. With the old `onClick` it fails two of them.
- **Pitfall, checks that leaned on the bug:** `perch-check.mjs` reached "Hear
  my clue" by trying cookies in turn; one tap used to be two misses. It now
  picks wrong cookies from the round's answer in the game's props.

## Pieces that move every frame, and proving React isn't (GAME-3)

*2026-10-18 · GAME-3*

- **Symptom:** Bubble Sounds' bubbles moved by a `setState` every 60 ms (170
  React commits in 10 s), jerky, and could overlap or rise in from below the
  water ("(stage) cut off" in the layout audit).
- **Fix:** a `requestAnimationFrame` loop writes each bubble's transform to its
  element (a `.slot` wrapper, so the bubble inside keeps its pop and wobble);
  React hears only when a bubble comes, goes or is popped. No overlap by
  construction: lanes a bubble and a bit wide, one speed per round, a new
  bubble only in a lane whose last one has risen clear, arrivals spaced evenly
  (crossing ÷ lanes), and the round starts part full at staggered heights.
  Bubbles come in inside the water and fade out under its top.
- **Check:** `bubble-check.mjs` samples every frame for 20 s: overlaps, boxes
  outside the water, a target on screen, the answer's share (GAME-7), and
  React commits, counted by a stub
  of `window.__REACT_DEVTOOLS_GLOBAL_HOOK__` installed before the page loads
  (`onCommitFiberRoot` counts). Counting style changes or child changes isn't
  enough: the old code passed both.
- **Pitfall, the purity lint:** `performance.now()` in a click handler tripped
  `react-hooks/purity`; the click event's `timeStamp` is on the same clock.
- **Pitfall, a poor shuffle:** `sort(() => Math.random() - 0.5)` laid the
  first bubbles out as a staircase; use `sample`/`shuffle` from
  `engine/content.ts`.

## A share that holds in a short play, not just on average (GAME-7)

*2026-10-18 · GAME-7*

- **Symptom:** Bubble Sounds' water was about half the answer at every tier
  (each bubble 38% the answer, topped up to two answers), and all answer while
  a child popped fast.
- **Cause:** the top-up to two answers replaced the regular bubble, so every
  answer popped brought another in its place, and 38% was the same at every
  tier.
- **Fix:** each bubble on the regular rhythm is dealt from a shuffled bag per
  tier (2 in 7, 1 in 6, 1 in 10), and when no answer is left the next bubble
  is the answer, at once if it isn't time for one: an extra outside the rhythm,
  so popping never speeds the answers up.
- **Pitfall, coin flips:** a per-bubble chance lands on the aim over an hour
  and still gave 27–66% in a 20 s kindergarten play (streaks). Judge a share
  over short stretches too; a bag keeps the worst 20 s within about 10 points.
- **Pitfall, top-ups:** forcing an answer in place of the regular bubble, or
  topping up to a minimum, pushes the share up the faster the child pops.
- **Check:** `bubble-share-sim.mjs` (no browser) checks each tier's share,
  popping and the worst 20 s stretch, and fails with `--before` and `--chance`;
  `bubble-check.mjs` measures the share in the real game. Keep the sim's
  lanes (6 at every iPad size) and crossing times in step with the game.

## Testing time: a clock you can move and a tab you can hide (PRG-6)

*2026-10-19 · PRG-6, BUG-12*

- **Symptom:** you need to know a minute counts, or doesn't, without waiting
  a minute; or that a hidden tab pauses a timer.
- **Fix:** in `evaluateOnNewDocument`, wrap `Date.now` to add
  `window.__skip` (the app times plays with `Date.now`), and define
  `Document.prototype.hidden` / `visibilityState` as getters on
  `window.__hidden`; to hide, set it and dispatch `visibilitychange` on
  `document`. For dates (the streak, Today), `page.emulateTimezone()` plus a
  `Date` subclass whose no-argument constructor reads `window.__now`
  (`streak-check.mjs`).
- **Check:** `time-check.mjs` (2 minutes on screen, 1 hidden: it must count
  2; since PRG-11 also a lesson left after a minute and finished after
  another: Today +1 on leaving, "took 2 min" and Today +2 in all),
  `streak-check.mjs`.
- **Pitfall:** `localDay(new Date())` is unaffected by `__skip`, which only
  moves `Date.now`; a check that crosses midnight needs the subclass.

## Settings saves over and over when offline (BUG-10)

*2026-10-19 · BUG-10*

- **Symptom:** with the voice index unreachable, Settings saved thousands of
  times a second while open; the page still felt fine.
- **Cause:** an index that didn't load read as "no voices", so the saved
  voice looked gone; the picker's effect corrected it with `onChange`, which
  is a new function on each render and re-renders Settings through the save.
- **Fix:** "no voices" means "don't know", and the correction runs once per
  open (a ref).
- **Check:** `settings-offline-check.mjs` blocks `/voice/*/manifest.json` by
  request interception and counts `setItem` on the progress key. **Pitfall:**
  count from before Settings opens; a one-off save right at the open is
  missed otherwise.

## A sight word on screen in Luna's own words (CUR-3, BUG-27)

*2026-10-19 · CUR-3, BUG-27*

- **Symptom:** in the sight-word lesson the word to find was on screen
  before it was found: in the prompt ("Find **the** word…"), Luna's opening
  line ("…when we **see** them") and, at random, her reactions ("Are you
  **a** wizard?" staying up into the "a" round).
- **Fix:** the prompt and her opening line were reworded (CUR-3). A game or
  lesson can name a round's heard-only word (`hiddenWord` on its GameDef);
  the shell then asks `lunaSay(kind, id, avoid)` for a line without it:
  this round's after a miss, the next round's after a win. Every kind of
  line keeps at least two for each word.
- **Check:** `sight-check.mjs` reads the whole play screen (perch included)
  at each round's start and after two misses; `--runs 20`, because the lines
  are random and one run can miss it. A stage-only read missed the perch.

## A game that reads its own answer aloud (GAME-4)

*2026-10-19 · GAME-4*

- **Symptom:** Muddled Cards at tier 2+ could be won by ear: flipping a word
  card read it, so a child matched the sound to the picture's.
- **Fix:** a word card is silent until its pair is found (pictures and
  letters are still said), and the repeat hint names the picture, or says
  "Turn over a picture first, then find its word." when two word cards were
  tried.
- **Check:** `muddled-check.mjs` logs every line asked for and reads the cards
  from the round (buttons follow `round.cards`); it fails on the commit
  before.
- **Pitfall, the clue never came:** only a repeated pair counts as a miss in
  this game, and "Hear my clue" shows from the second miss: try the same
  two cards three times before tapping it.

## A game never asks for some letters (BUG-21)

*2026-10-18 · BUG-21*

- **Symptom:** over many plays, some letters of a tier's pool are never the
  target (Bubble Sounds: only the pool's first 12).
- **Cause:** round *i* took its letter from slots `i*3` to `i*3+2`, and a play
  has 4 rounds.
- **Fix:** `sample(pool, count)` from `engine/content.ts`: distinct letters
  from the whole pool.
- **Check:** `bubble-letters-check.mjs` (no browser; 400 plays per grade ×
  dial; give it a `src-root` from `git archive HEAD src` to judge old code).
- **Pitfall, the shots then all differ:** `ui:shots` runs on one seeded random
  stream, so a game drawing its numbers differently changes what every later
  game deals. Check that only content moved, not layout.

## A screen plays the wrong speed (BUG-8)

*2026-10-18 · BUG-8*

- **Symptom:** with Beginner (or Quick) picked in Settings, something still
  plays at Normal.
- **Cause:** a `rate` passed to a `pronunciation.speak*` call picks the clip's
  speed bucket by itself (`bucketFor`: below 0.85 slow, up to 1.05 normal,
  above that quick). The story lesson passed 0.9 and 0.85, both Normal.
- **Fix:** leave `rate` out, so the setting decides. `grep -rn "rate: [01]\."
  src` finds any left.
- **Check:** `story-speed-check.mjs` logs the bucket of every clip asked for
  (`req.bucket` in a `pronunciation.say` wrapper) at each speed.

## Does "show me" point at the answer? (FB-2)

*2026-10-18 · FB-2*

- **Symptom:** you need to know every game and lesson reveals the answer on
  the third miss in a round, with a reveal line, and that the round can then
  be finished.
- **Fix:** with Vite on 5199, `node .claude/skills/know-how/reveal-check.mjs 5199`
  (`--only <title words>` for one; `SHOTS=<dir>` saves a picture of each
  revealed state, `THEME=dark` for dark). It misses on purpose, choosing wrong
  pieces from the round in the game's props, counts misses by the shell's
  try-again sound, and looks for `[data-state~="revealed"]`.
- **Pitfall, Muddled Cards:** a mismatch is only a miss when that pair was
  tried before, so it takes four tries for three misses; and flips need about
  0.9 s apart, or one lands while the last match is still settling.
- **Pitfall, headless Chrome is dark now:** since DES-16 the app follows the
  browser's light/dark setting, and headless Chrome follows the Mac's. A check
  that takes review pictures should set
  `page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])`.

## Does the perch work? (Luna's line, the clue, the flash, the win)

*2026-10-12 · DES-22a*

- **Symptom:** you need to know the start screen's Luna perches with a tailed
  bubble and says the mission; that a game with its own Luna (Feed Luna) gets
  a perch with no owl and no tail whose line says itself again; that "Hear my
  clue" shows from the second miss, plays the hint and goes on a win; and
  that the stage's edge turns try-again or right. A miss's flash lasts 500ms,
  too quick to catch by eye.
- **Fix:** with Vite on 5199, `node .claude/skills/know-how/perch-check.mjs 5199`.
  It plays Feed Luna at Kindergarten, logs what `pronunciation.say` was asked
  and counts clips, and records every `data-flash` the stage takes with a
  MutationObserver. 13 of 13; 6 of 11 fail on the commit before DES-22a.
- **Pitfall, a colour read mid-change:** the stage's edge changes over
  `--dur-quick`, so its colour read the moment `data-flash` appears is still
  the old one. Read it 300ms later (the check's observer does).
- **Pitfall, a borrowed label:** `kit-check.mjs` finds ListenCues by
  `aria-label="Hear it again"`. SpeechBubble's new tappable line first used
  the same default label, so three ListenCue checks failed on a component
  nobody had touched. Give a new tappable thing its own label (the bubble's
  is "Hear Ms. Luna again"), and when an untouched check fails, look for a
  new element its selector now also matches.
- **A won round (DES-11, 2026-10-17):** the same check also wins a round and
  looks for the garden (six flowers, `data-shot="win-garden"`, behind the
  pieces on z-index -1), 30 petals (`data-shot="petals"`) that never take a
  tap, no sparkle, the garden gone and petals still falling once the next
  round starts, and petals over the done screen. ui:shots never wins a round,
  so for review shots of the win use `win-shot.mjs` next to this file: it
  plays Feed Luna to a win and shoots 350, 900, 1500 and 2300ms after it
  (`DONE=1` adds the done screen); the flowers have all grown by about 1.2s.
- **Pitfall, a finished petal still "shows":** a petal's fall ends at 0.6
  opacity just below the bottom edge (`forwards`), so "opacity > 0" counted
  all 30 as still falling 2s after the win. Count only petals whose top is
  still above the layer's bottom. For the same reason ui:shots, which finishes
  every one-shot animation before a shot, never shows the done screen's
  petals.

## Do lessons open in order?

*2026-10-12 · PRG-7*

- **Symptom:** you need to know only the right lessons open (a fresh save, a
  finished lesson, an old save done out of order), that a locked tap says the
  right line, and that "Next lesson" never leads into a locked one.
- **Fix:** with Vite on 5199, `node .claude/skills/know-how/lesson-order-check.mjs 5199`.
  It reads each card's `data-state` (done, locked, or neither for the one up
  next), plays lessons through by trying each `lesson-choice` in turn (as
  `ui:shots` does), seeds old saves in `localStorage`, and checks that
  `FINISH_FIRST` has a line for every lesson a grade can have up next. It
  takes about two minutes, and fails 9 of 11 on the commit before PRG-7.
- **Check:** 11 of 11. A grade given more lessons (CUR-4) fails its first
  line until the new "Let's finish Lesson N first!" is added and rendered.
- **Shots of a lesson past the first** (*2026-10-19, CUR-5*): `ui:shots`
  plays only Lesson 1. `node .claude/skills/know-how/lesson-shot.mjs <lesson
  number> <outPrefix> [light|dark] [grade 0|1|2]` marks the grade's lessons
  done, opens that one and shoots its first round at 1180 and 744 wide.
  A game's done screen (PRG-9): `game-done-shot.mjs <outPrefix> [light|dark]
  [kind:colour …]` plays Letter Cookies from a save holding those squishies,
  shoots its done screen at all four sizes and fails if a button or the shelf
  runs off screen.

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
- **Pitfall, the route deals the rounds** (*2026-10-12, DES-9b*): every
  mount of the library draws the next seeded random numbers (Luna's
  greeting, the word of the day), so a run that goes home and back into
  Reading one time fewer deals different letters in every game after it.
  `ui:shots` always makes that home round trip after the Trophy room, wherever
  the Trophy room's button lives, so game shots stay comparable when the
  route to it changes.
- **Pitfall, a random draw removed** (*2026-10-12, DES-21*): taking the word
  of the day off the library removed its `pick()`, so every game after it
  dealt different letters, and `--diff before after` called every game's play
  screen changed though no game was touched. Prove it by shooting the last
  commit with only that draw taken out: `git archive HEAD | tar -x -C <scratch>/head`,
  link `node_modules`, swap the draw for a constant (DES-21:
  `useMemo(() => ({ word: 'cat', emoji: '🐈' }), [])`), run
  `node scripts/ui/shots.mjs --label before-rng` there (and `--theme dark`),
  copy the folders into `screenshots/`, and `--diff before-rng after`: only the
  screens the ticket touched should differ. A draw added does the same.
- **Check:** three runs in a row, then `--diff` each pair: 0 changed screens
  at all 4 sizes. To prove the diff can fail, change a 1 px border's colour
  (the status bar's bottom line shows on 24 of 26 screens at y 47), or one
  pixel of a copied run with `pixel-poke.cjs` in this folder: 9 per channel
  shows up as 1 pixel, 8 doesn't.

## Proving no screen changed when nobody took a "before"

*2026-10-11 · DES-7a*

- **Symptom:** a ticket that shouldn't change any screen (a new kit component,
  a mixin edit) is already built, and there's no `screenshots/before/` from
  the last commit to diff against.
- **Cause:** `ui:shots` shoots the tree it lives in, so it can't shoot the old
  code once the working tree has moved on. `git stash` would do it, but Claude
  doesn't touch git state.
- **Fix:** shoot an unpacked copy of the last commit, and borrow the repo's
  `node_modules`:

  ```bash
  git archive HEAD | tar -x -C <scratch>/head
  ln -s "$PWD/node_modules" <scratch>/head/node_modules
  (cd <scratch>/head && node scripts/ui/shots.mjs --label before)
  cp -R <scratch>/head/screenshots/before screenshots/before
  npm run ui:shots -- --label after
  npm run ui:shots -- --diff before after
  ```

  Running them one after the other is safe: each run starts its own Vite on a
  free port.
- **Check:** "0 changed screens at 4 sizes". The kit's own behaviour (press,
  Modal, focus ring) is `kit-check.mjs` in this folder, against Vite on 5199.
  Pitfall in a focus check: after a dialog closes and focus falls back to
  `<body>`, Tab carries on from where the dialog was, not from the top of the
  page, and a click elsewhere earlier in the script moves focus too. Read
  `document.activeElement` straight after the step you're testing.

## Luna's beak moves when no clip is playing (or stops mid-sentence)

*2026-10-11 · DES-15*

- **Symptom:** her beak flaps before a line is heard, keeps going after it,
  or stops while she's still talking.
- **Cause:** screens used to switch `talking` on before the clip had loaded,
  and off on their own 3.6–3.8s timers; Feed Luna moved it while she chewed.
- **Fix:** don't drive it from a screen. The clip player reports when one of
  her clips starts and when the last one ends (`pronunciation.onSpeaking`,
  fired in `playBuffer` and `stop()`), and the kit's `Luna` follows it through
  `useSpeaking()`. A screen passes `talking={false}` only to keep her quiet
  while someone else speaks (the moon, DES-17).
- **Check:** `node .claude/skills/know-how/luna-talk-check.mjs 5199` (Vite on
  5199) logs every clip start and end and samples her every 20ms while she
  speaks on the library, a start screen and a round. It fails if she talks
  with no clip playing, allowing one frame either side.
- **Pitfall, proving it can fail:** the last commit passed it too, because
  the old timers mostly erred the other way: they stopped her early (179 of
  523 clip samples), which this check doesn't flag. Prove it by switching
  the fix off instead: delete the `setSpeaking(false)` in `playBuffer`'s
  `finish`, and her beak runs on for seconds after the clips.
- **Pitfall, "do these two look different?":** element screenshots of two
  specimens never match byte for byte, even with the same pose, because each
  sits at a different sub-pixel. `kit-check.mjs` compares her moods by their
  SVG markup, where every pose lives, and fails when happy is made the same
  as idle.

## Does every screen fit on every iPad?

*2026-10-11 · DES-10*

- **Symptom:** you need to know that nothing scrolls mid-round, the library's
  first screenful shows the next lesson and Luna's Pick, and no tap target is
  small, overlapping or in the edge band, at 4 sizes and 3 grades. That's
  too many screens to judge by eye.
- **Fix:** with Vite on 5199, run
  `node .claude/skills/know-how/layout-audit.mjs 5199 <0|1|2>` once per grade.
  Its "(stage)" lines are the games' and lessons' own pieces inside
  `data-shot="stage"`; they're listed for DES-22b/c, DES-23 and GAME-3 and
  don't fail the run. Since DES-21 a Play Shelf title on its picture fails
  it (proved against the commit before DES-21, which shows the five).
- **Pitfall, locked lessons** (*2026-10-12, PRG-7*): since lessons open in
  order, a fresh save opens only Lesson 1, and a tap on the others never
  reaches a start screen. The audit marks every lesson of the grade done in
  `localStorage` (importing `lessonsFor` in the page) and comes back in from
  home before its lesson pass; done lessons stay open. Any new check that
  visits every lesson needs the same.
- **Pitfall, scroll isn't the only way not to fit:** the first version only
  looked for scrolling, and a stage made 1,400px tall still passed. GameShell's
  root has `overflow: hidden`, so a stage too tall for the screen is cut off,
  not scrolled. The audit now also fails anything mid-round (the shell, the
  stage, any button) that runs past the screen. A game's own piece coming in
  from off screen is listed, not failed: Bubble Sounds' bubbles rise from
  below.
- **Pitfall, the library scrolls:** a card ending at the fold isn't hugging the
  edge, so the bottom band isn't judged there.
- **Pitfall, decoration that hangs off a scroller** (*2026-10-12, DES-22a*):
  the stage's soft blobs sit half outside it. On a lesson the stage scrolls
  (`overflow-y: auto`, for long stories), so the low blob gave every lesson
  128px of scroll ("scrolls: stage by 128px"); on games, `overflow: hidden`
  had hidden it. Keep decoration on a parent that clips and never scrolls,
  and put the content on an inner layer that does the scrolling (GameShell's
  `.stage` and `.inside`).
- **Pitfall, a tilted target overlaps its neighbours** (*2026-10-18, DES-22b*):
  Letter Jar's bugs were 64px buttons rotated by up to 25°, and the audit
  measures a box with `getBoundingClientRect`, which grows round a rotated
  square (about 85px), so neighbours "overlapped" at 1024×768 though the round
  bugs didn't touch. Keep the button upright and answer-sized and tilt only
  what's inside it, with the `rotate` property (the wobble and pop animate
  `transform`, so the two don't cancel). Pieces placed on a grid fixed by the
  round fit one screen and not another: shape the grid from the measured
  field instead (`gridFor` in `LetterHunt.tsx`, with a ResizeObserver).
- **Pitfall, a fit check that can't fail** (*2026-10-18, DES-22c*): measuring
  "everything inside the stage" said every Treasure Path stone fitted
  exactly, because the stage's own layers (`.inside`, the garden, the
  blobs) fill it edge to edge. Measure the game's own pieces instead: its
  first and last things (the path of stones, the answers). The layout audit
  plays only round 1, so a game whose content grows by round needs its own
  check: `treasure-fit.mjs` next to this file plays all 5 stones.
- **Check:** it passes at every grade today, and fails with GameShell's
  `.shell-stage { min-height }` set to 1400px for a moment.

## A card's row of pictures is squeezed, or slides under its buttons (PRG-5a)

*2026-10-19*

**Symptom:** the library's Squishy Shelf card looked fine with no squishies
(three empty spots), but with three on it they slid under the arrow and
"My trophies", and at 1024 wide the buttons overlapped each other. The empty
spots had shown it already: they were thin dashed bars, squeezed by flex.

**Cause:** a flex row whose middle (`flex: 1; min-width: 0`) holds
fixed-size pictures. When the buttons beside it take the room, the middle
shrinks below its pictures' width and they overflow. A fresh save never shows
it, so `ui:shots` didn't either.

**Fix:** give the card less to hold (the board's card has no trophies
button; the Trophy room moved to the header's stars), and let the row show
only what fits: `flex-wrap: wrap`, a row gap bigger than the slack, a fixed
height of one row and `overflow: hidden`, with each item `flex: none`, newest
first. Extra pictures wrap onto a row that's cut off, never squeezed.

**Check:** shoot the card with a save that fills it, at 1180, 1024 and 744
wide: `node .claude/skills/know-how/hub-card-shot.mjs <outPrefix> light
bear:toffee cat:butter bunny:honey` (Vite on 5199). Look at every size, not
just the widest.

## New chrome changed every screen: did the screen under it move?

*2026-10-11 · DES-8*

- **Symptom:** a change to the header or another frame piece makes
  `ui:shots --diff` call every screen changed, so it can't say whether the
  library or a game under the frame changed too.
- **Cause:** the content moved up or down as a whole (DES-8: the chrome above
  the library went from 102px to 64px), so every pixel is compared with the
  one 38 rows away.
- **Fix:** line the two shots up by their own top edges and compare from there:
  `node .claude/skills/know-how/shifted-compare.mjs <before.png> <after.png> <topBefore> <topAfter> [rows] [out.png]`.
  Take the tops from the shots or a `getBoundingClientRect()`. Compare only the
  rows both show; DES-8's "before" also lost 28px at the bottom to the home
  strip. A shadow the old chrome cast shows up as the first few rows (DES-8:
  rows 0–2), so start a few rows lower to judge the rest.
- **Check:** DES-8's library at 1180×820: `106 68 686` passes, and `106 69 686`
  (one row off) fails with 80,000 pixels, so it can fail. A screen whose own
  height changed (a game stage that grew) can't be lined up this way; judge
  it by eye.

## An arch comes out with square bottom corners

*2026-10-11 · DES-7b (DES-26)*

- **Symptom:** something given `border-radius: var(--radius-arch)` has its
  round top, but its bottom corners look almost square.
- **Cause:** the token is `999px 999px 22px 22px`. When two neighbouring
  corners add up to more than the box's side, the browser shrinks every corner
  by the same factor, so the 22px comes out about 2px. The round 2 board's "?"
  cue has the same flaw.
- **Fix (DES-26, 2026-10-19):** the token is gone. Use the `arch()` mixin
  (`styles/_mixins.scss`): `@include arch(var(--my-width))` when the
  component knows its width (ListenCue), or `@include arch` on a box that
  fills a parent given `@include arch-host` (container units; the shelf's
  cabinet). A box with no container host gets the viewport's width and the
  old flaw back.
- **Check:** `kit-check.mjs` hit-tests just inside each Kit page arch's bottom
  corners and top corners (`elementFromPoint` follows the rounded shape):
  outside the curve at 192 and 400 wide. A close-up with `kit-sections.mjs`
  shows them too.

## In the Kit page shots, a right answer looks smaller than it is

*2026-10-11 · DES-7b*

- **Symptom:** a right Choice or a found ListenCue shows at 90% size in
  `screenshots/<label>/kit/`.
- **Cause:** the shots stop every animation at its first frame (so they match
  run to run), and the shared pop starts at scale 0.9.
- **Fix:** `shootKit` in `scripts/ui/shots.mjs` jumps one-off animations to
  their end (`currentTime = endTime`) and leaves loops at their start.
  `kit-sections.mjs` (close-ups of named Kit page sections, light and dark)
  does the same.
- **Check:** a right Choice is the same size as an idle one in the shot.

## A reduced-motion check says animations still run, but nothing moves

*2026-10-11 · DES-6*

- **Symptom:** `npm run ui:shots -- --reduced-motion` lists animations as still
  moving, each shown as `0ms × 1`, and it keeps listing them even with the
  reduced-motion reset taken out.
- **Cause:** two things at once. The run freezes CSS animations
  (`Animation.setPlaybackRate` 0), so even a 0ms animation never reaches
  "finished". And GameShell's own older `prefers-reduced-motion` block sets
  `0.01ms`, which prints as 0 once rounded and wins over the global reset's
  `0ms` (both `!important`, and GameShell's is more specific).
- **Fix:** judge what can move, not the play state. `stillMoving()` in
  `scripts/ui/shots.mjs` counts an animation only if it loops or lasts a frame
  (16ms) or more, and prints its exact duration.
- **Check:** the run passes with `base/_reduced-motion.scss` loaded, and fails
  at all four sizes with its `@use` taken out of `global.scss` for a moment.

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
- **Pitfall: the tools outside Vite** (*BUG-24*). `npm run voice:audit`,
  `voice:render` and the know-how `distractor-check.mjs` and
  `passage-check.mjs` bundle `src/` with esbuild, not Vite. DES-18c's first
  `@/` import in a game broke all four ("Could not resolve "@/utils/cx""),
  and nobody noticed because no speech had changed. They now carry the same
  alias as `vite.config.ts`. After any move or new import style, run
  `npm run voice:audit` and the two checks too, not only build and lint.
  The audit's utterance count moves by a few dozen between runs (it samples
  random rounds), so a different count alone isn't a change.
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

## The build says a breakpoint "isn't a valid CSS value"

*2026-10-11 · DES-3*

- **Symptom:** after adding or changing a breakpoint in `$breakpoints`
  (`src/styles/tokens/_primitives.scss`), the build fails inside `bp()` with
  "(max-width: 899px) isn't a valid CSS value".
- **Cause:** written bare inside a Sass map, `(max-width: 899px)` is read as a
  nested map (key `max-width`), not as a media feature.
- **Fix:** write each one as a string: `narrow: '(max-width: 899px)'`. `bp()`
  interpolates it without the quotes.
- **Check:** compile a one-line module with sass-embedded
  (`compileStringAsync("@use 'styles/mixins' as *; .a { @include bp(narrow) { color: red } }", { loadPaths: ['<repo>/src'] })`)
  and look for `@media (max-width: 899px)` in the output. An unknown name
  fails with "No breakpoint called …".

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

Since CNT-4 (2026-10-18) `npm run voice:audit` also runs the content rules:
`distractor-check.mjs` (wrong answers, also-fits lists), `passage-check.mjs`
(Treasure Path's passages; a claim never copies 4 words of its passage) and a
picture rule (one picture per word in the bank; CNT-3's stand-ins stay gone).
A planted bad item of each kind fails it. A planted wrong word that has no
clip also fails the voice part, so to see which rule caught it, run the two
checks on their own.

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

## Lint says a click handler calls `Math.random` "during render"

*2026-10-12 · DES-13*

- **Symptom:** `npm run lint` fails with `react-hooks/purity` ("Cannot call
  impure function during render") on `Math.random` inside a handler such as
  ReadingApp's `handleSurprise`, which only runs on a tap, and which passed
  lint the day before.
- **Cause:** the handler had started calling a helper (`begin`) declared
  further down the component. The React compiler's lint then reads the
  handler as if it ran while rendering.
- **Fix:** declare the helper above every handler that calls it. Don't
  silence the rule.
- **Check:** `npm run lint` is clean with the helper moved up, and fails
  again with it moved back below.

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
