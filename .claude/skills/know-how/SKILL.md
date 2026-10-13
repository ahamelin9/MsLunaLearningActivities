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
  `lessons/shared/lessonHooks.ts` and `feed()` in `games/FeedLuna/FeedLuna.tsx`. FB-1 will
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
  - **Pitfall, a second copy** (*2026-10-11, DES-15*): once Vite has
    hot-reloaded a module, the page loads it as `…/pronunciation.ts?t=…`, and
    the bare path imports a fresh second copy that nothing on screen listens
    to. A wrap or a call on it then does nothing, and the check fails for no
    reason. Import the URL the page actually loaded:
    `performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/pronunciation.ts'))`
    (as `kit-check.mjs` does), or restart Vite.
- times every clip by wrapping `AudioBufferSourceNode.prototype.start/stop`.

Selectors that work (the shell's and the hub's classes went with DES-18b
and DES-18c): `[data-shot="open-reading"]` for the home icon;
`[data-shot="grade-card"]` (0 K, 1 1st, 2 2nd); lessons are
`[data-shot="lesson-tile"]` and games `[data-shot="game-tile"]`, a game
named by its `[data-shot="tile-title"]`; `[data-shot="play"]`;
`[data-shot="shell-play"]` / `[data-shot="shell-reward"]`; and
`[data-shot="round-pips"][aria-label]`, which changes each round. Since DES-8
the header (`AppHeader`) carries `shell-back` (Library), `round-pips` and
`app-home` (Home, which leaves the app); the Trophy room opens from the home
screen only.

Prove the check can fail: switch the fix off for a moment (for example, set
its constant to something huge), rerun, and watch it go ❌, then put the fix
back. A check that passes either way proves nothing. OPS-6 did this.

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
- **`pkill -f "vite --port 5199"` killed my own command** (*2026-10-12*):
  `-f` matches whole command lines, so a status check whose own text held
  that string (`pgrep -fl "vite --port 5199|…"`) was killed with it (exit
  144). Keep the pattern out of other commands running at the same time.
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
- **Every clip carries the first line's label** (*2026-10-12, DES-12*): in
  a copy of `speech-check.cjs`'s harness, the clips after the first few all
  logged "Hi! Which grade are you in?", so a check matching a clip by its
  label saw 0 plays of a line that had played. Likely cause: `say` resolves
  before the clip is fetched and decoded, so its `finally` puts the real
  `playBuffer` back before the clip starts, and `__label` keeps whatever it
  last held. Count instead: the line in `pronunciation.say`'s log, plus one
  more `AudioBufferSourceNode.start`. OPS-9 can fix the label when it moves
  the harness onto `data-shot`.
- **A puppeteer press does nothing** (*2026-10-11, DES-5*): `page.mouse.down()`
  at a `boundingBox()` below the fold lands outside the viewport, so `:active`
  never applies and the check reads the resting style. Scroll the element into
  view first (`el.scrollIntoView({ block: 'center' })`), then take its box.
- **Class names stop working from DES-18b:** CSS modules rename them, so the
  selectors above break as each area moves. The stable hooks are `data-shot`
  names (DES-18a): `home`, `open-reading`, `grade-select`, `grade-card`, `hub`,
  `hub-rug`, `hub-tin`, `lesson-tile`, `game-tile`, `tile-title`,
  `shell-intro`, `shell-play`, `shell-reward`, `play`, `shell-back`,
  `round-pips`, `win-veil`, `lesson-choice`, `open-settings`, `settings`,
  `open-trophies`, `trophies`, `modal-close`, `app-home` (DES-8), `stage`
  (GameShell's stage, DES-10), and on the library `change-grade` (the
  header's grade) and `luna-mute` (the button beside her) (DES-21). OPS-9
  moves the checks in this folder onto them.
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

## Does the perch work? (Luna's line, the clue, the flash)

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
- **Check:** it passes at every grade today, and fails with GameShell's
  `.shell-stage { min-height }` set to 1400px for a moment.

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
- **Fix:** until DES-26 fixes the token, build the arch from the element's own
  width: `calc(width / 2) calc(width / 2) var(--radius-card) var(--radius-card)`
  (ListenCue's `--cue-radius`).
- **Check:** a close-up with `kit-sections.mjs` in this folder: the bottom
  corners are as round as a card's.

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
