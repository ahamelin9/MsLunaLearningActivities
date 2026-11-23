# VOX — Luna's voice: letter sounds and words

Every letter sound, letter name and word Luna says should sound like a teacher
saying it. From the voice audit of 2026-10-28: every clip was run through a
phoneme recognizer (wav2vec2, English sounds only), Whisper and a formant
tracker, and fixes were rendered to hear side by side on the **Sound Check**
page (an artifact; Alex's picks are saved in its `picks` collection, read with
the ArtifactData tool). The audit kept Kokoro: it is one of very few good
voices that takes exact phonemes, which phonics needs, and the problems are
in how we cut the letter sounds and how it ends a word said alone. Since
2026-11-23 every letter sound and letter name is Alex's own take, converted
into Luna's voice (VOX-7, VOX-8, VOX-9 in the changelog); words and lines are
still Kokoro's.

### VOX-6 · Where Luna sounds shaky, "like a demon"
Bug · P0 · M · needs: — · likely, not reproduced yet (it needs her whiteboard)
- **Blocked (2026-11-12):** built and checked; waits for the teacher to hear Luna on her whiteboard with the new engine, and Alex's OK. The engine's first version is live in `0a0b409`; its hardening (a refused new context keeps the old one, a stopped clock isn't a wrong rate, and `voice:audit` runs again: the first version touched `document` as it loaded, which the audit's Node has none of) is live too, in `921ddad`. All of its Complete when is met but the whiteboard: `audio-engine-check`, the 8 voice checks, `voice:audit`, build and lint pass. `audio-engine-check` passes in Firefox too (`browser=firefox`, Gecko), as well as in Chrome (Chromium: Edge, Chromebooks and most whiteboards). Safari's engine (WebKit, which every iPad browser uses) can't be driven from here unless Alex turns on Safari's remote automation. If she still hears it, ask which screen, game and voice speed, and whether the whiteboard plays through its own speakers or the room's. A one-tap Sound test in the Teacher's corner (it would show what a device's audio is doing) was offered and set aside (Alex, 2026-11-12: "Not now"); it's the next step if her answers don't settle it.
- **Where (Alex, 2026-11-12):** on her classroom whiteboard screen, not the iPads. It's an old problem that went away and came back there.
- **Decided (Alex, 2026-11-12):** "if there is ANY possible cause we probably want to mediate that": build the playback fix, and guard every other way the voice could come out deep, shaky or doubled.
- **Built (2026-11-12):** `src/utils/audioEngine.ts`, the one audio engine for voice and effects (`audio-engine-check.mjs`, 13 failures on the code before):
  - one context, not two; none made before a tap (clips decode on an offline context, so the playing one is made on the speakers in use at the first tap);
  - a fresh one at the next tap after the output device changes (a whiteboard, a TV, AirPlay, Bluetooth), the page comes back, the system suspends or interrupts it, or its clock runs at the wrong speed against the page's (a stopped clock is left alone; at most once a minute); a refused new one keeps the old;
  - bigger buffers (`latencyHint: 'playback'`) against stutter on a slow machine, and a limiter so a cheer over a line never clips;
  - one of Luna's clips at a time; Words Off the Page's read-back stops when something cuts in (it used to read on under the sentence: two Lunas at once);
  - a tab left open past a voice render finds the clip that replaced a removed one, instead of the browser's voice; and the browser's voice, if ever reached, is a woman's (on Windows it was the first US voice, David, deep).
- **Found (2026-11-12):** the clips are clean. `voice-audit/roughscan.py` tracked the pitch of all 11,003 clips (words, lines, names and sounds, at all three speeds): none falls into a creak or growl longer than 110 ms (a phrase's natural end), the wobble is alike at every speed (median 26 to 29 cents), so Beginner speed isn't the cause, and no clip peaks past 85% of full scale. So "sometimes, in certain places" points at playback on the iPad, not at a take. The likely cause there: the app runs two Web Audio contexts (Luna's voice in `pronunciation.ts`, the sound effects in `audio.ts`), and on iPads a context can come up at a different sample rate than the speaker, or come back from an interruption (a call, Siri, the screen locking, another app's sound) that way, which plays everything slowed, deeper and crackly.
- **Why:** the teacher (2026-11-12): "her voice is a little off, sounds like a demon a bit"; Alex: shaky in certain places. Nobody has said which clips yet. Likely causes, from the audit's notes: a held sound stretched at one flat pitch (PSOLA, which Alex called "robotic"), a line rendered at Beginner speed (Kokoro at 0.75), or a take where her voice drops into a creak or a buzz.
- **How:**
  - **Where, first:** ask the teacher which game or lesson, and which voice speed the Teacher's corner was on. Meanwhile, scan every rendered clip for the marks of a rough voice (pitch falling into creak, jitter, a buzz, a sudden drop in pitch) with the audit's tools (`.claude/skills/know-how/voice-audit/`), and put the worst on a page for Alex to hear beside a clean one.
  - Fix each by its kind: a line or word gets a new take, speed or override (`scripts/voice/overrides.json`); a letter sound is now Alex's recording (`scripts/voice/recorded/`), so it gets a new take of his.
  - `npm run voice:render`, then `npm run voice:audit`.
- **Complete when:** the scan finds no rough clip (done: none); `audio-engine-check.mjs` passes and fails on the code before; the voice checks (`luna-talk-check`, `greeting-check`, `perch-check`, `read-first-check`, `lesson-order-check` and the rest that listen to her) pass; `voice:audit`, build and lint pass; the teacher hears Luna clean on her whiteboard, and Alex OKs it.

### VOX-5 · Single words in a blend of Luna and Kore
Story · P1 · M · needs: —
- **Why:** said on its own, a word's short vowel drifts in every Kokoro voice: short i toward e ("chick" heard as "check"), short e toward a ("bed" as "bad"), and the "oo" of "book" is lost. Those are the pairs phonics drills, and among the hardest for ESL learners. Half Luna, half Kore (`af_kore`) moves the vowels back (short e 732 Hz; a real one is 731), and Whisper understood 393 of the app's 450 words against 360 in Luna's voice: 53 fixed, 20 broken (`docs/voice/research-2026-10-28.md`, "Luna's short vowels" and "Alex's listen"). Alex heard it as still Luna and picked half and half on 7 of 8 cards, her lines included (2026-10-29). It also clears some of VOX-2's stray edge sounds ("A sheep"), so it goes first.
- **How:**
  - **Alex's call first:** single words only, or her lines too. Letter sounds and letter names stay as they are either way: they're Alex's recordings converted into Luna's voice (`scripts/voice/recorded/`), which the render plays instead of Kokoro.
  - In `scripts/voice/render.mjs`, render `word` clips (and `text` clips, if Alex says so) from a blended style instead of `{ voice: VOICE }`: average `af_heart`'s and `af_kore`'s style tables half and half and hand the result to the model, as `.claude/skills/know-how/voice-audit/blend-render.mjs` does (at 100% Luna it matches kokoro-js sample for sample). Put the mix in each clip's fingerprint so those clips re-render once. The folder stays `public/voice/af_heart`, which the app loads.
  - Check the words the blend broke on the research run (luna, kitten, coat, foot, feet; helped, water and stretched gained a stray "it") by Whisper and Alex's ear. A word still wrong keeps Luna's own voice through an entry in `scripts/voice/overrides.json` (`word|luna`).
  - Then `npm run voice:render` (every word at all three speeds) and `npm run voice:audit`. Whisper's count: `voice-audit/hear.py words`, then `voice-audit/wscore.py`.
- **Complete when:**
  - word clips (and lines, if Alex chose them) are rendered from the half-and-half blend; letter sounds and names are not;
  - Whisper understands more of the app's words than in Luna's voice today (360 of 450 by `wscore.py` on the research run), and hears "bed", "net", "chick", "pin", "six" and "book" as themselves;
  - every word kept in Luna's voice says itself;
  - `voice:audit`, build and lint pass;
  - Alex has listened in the app (a Blend and Read lesson, words tapped in a story) and OKed.

### VOX-2 · Words said alone end cleanly
Story · P1 · S · needs: —
- **Why:** about 1 in 8 words said on their own (59 of 451) gain a little sound before or after. Whisper hears "cup" as "copy", "pup" as "Poppy", "nest" as "Naster", "sheep" as "a sheep", "stops" as "it stops", and many of them are the short words children sound out. On 30 such words, rendered with a full stop after the word ("nest."), Whisper understood 17 against 8 today.
- **Round 1 (Alex, 2026-10-28):** the full stop alone didn't fix it: 10 of 16 words were wrong both ways ("cup-ay" in both). Round 2 tries trimming the stray sound from today's clips instead (a vowel after a final stop's release, a sound before the first consonant, a burst after a final nasal). Whisper understood 7 of 19 problem words trimmed, against 2 today; slower renders picked up new stray sounds in front ("a jump").
- **Round 2 (Alex, 2026-10-28):** trimmed won 9 of 19: today's trimmed for cup, pup, green, hen, moon and stops (cup and pup "cut off a bit abruptly at the end, but much better"), a little slower with a full stop and trimmed for ball, bed and key. Still wrong: cook, eat, her, hop, hopped, jump, leaf, peach, popped, sheep. Letter names: since 2026-11-23 they're Alex's recordings (VOX-9), so they're out of this ticket.
- **Research, second pass (2026-10-29):** Luna's short vowels drift in a word said alone (short i heard as e, short e as a, the "oo" of "book" lost), in every Kokoro voice. A blend of Luna 70% / Kore 30% (`blend-render.mjs`) raised Whisper's score on all 450 words from 355 to 388, and cleared many stray edge sounds on the way ("A sheep", "It stops"). VOX-5 (the blend) goes first and may shrink this ticket: recount its edge sounds after it. **Alex's listen (2026-10-29):** it still sounds like her, and he prefers half Luna, half Kore (7 of 8 cards, her lines included); on all 450 words that gains as much as 70/30 (33 more understood, 53 fixed, 20 broken, "luna" among them).
- **How (as planned before round 1):** render `word` clips with a full stop after the word in `scripts/voice/render.mjs` (it's part of what Kokoro is handed, so it's part of the clip's fingerprint and every word re-renders once). Check it against Alex's picks on the Words tab's "Word endings" first.
- **Complete when:** word clips are rendered with the full stop; VOX-4's word check counts fewer words with an extra sound at an edge than today's 59, and Whisper understands at least today's 359 of 451; Alex's Word endings picks favour it; `voice:audit`, build and lint pass.

### VOX-4 · A sound check that can fail
Task · P1 · S · needs: —
- **Why:** the audit's measurements live in a scratch folder. Without them, a retune can quietly undo itself, and a sound can't be judged except by ear.
- **Research, second pass (2026-10-29):** tested against Alex's round 1 picks, the measures work as a gate, not a judge (`docs/voice/research-2026-10-28.md`, "Do the measures agree"). Limits that held: a hiss fails over +35% brightness against real speech (every "TV static" was over +40%, every pass under +35%); a vowel fails with F2 more than 20% from Luna's own, an R with F3 over 2400 Hz (that gate cut 25 wrong takes and one pick, an L he'd flagged). The recognizer can't check "both sounds of a blend": it scores right and wrong blends alike, near zero. So the blend check needs another measure, or Alex's ear. Predictions for the Research tab are written in the notes, to check the gate against his round 3 picks.
- **Since 2026-11-23:** every letter sound is Alex's recording (VOX-7, VOX-8; VOX-1 closed on them), so the sound check now guards the recordings: it should pass on them and fail on the generated sounds they replaced. `takeformants.py` (the R's low F3, E against I, a whispered V or Z) is a start.
- **How:** move the audit's scripts into `.claude/skills/know-how/`: a sound check (target heard, a vowel after a stop, both sounds of a blend, /d/ not /j/, loudness in LUFS) and a word check (Whisper understood, an extra sound at an edge). They need a Python 3.12 env with torch and transformers (about 2 GB, outside the repo): write the one-line setup in the know-how entry. Keep them out of `npm run voice:audit`, which must stay light.
- **Complete when:** both run from the know-how folder against `public/voice/af_heart`; the sound check passes on today's recorded sounds and fails on the generated ones from before VOX-8 (/d/ as /j/, the blends), the word check fails on today's word edges and passes once VOX-2 is in; the know-how entry says how to set up and run them.

### VOX-3 · Words and lines in Kokoro's own phoneme spelling, as far as it helps
Story · P2 · M · needs: VOX-2
- **Why:** kokoro-js hands Kokoro espeak's IPA (`eɪ`, `oʊ`, `dʒ`, the length mark `ː`, `ɜː` with no R), not misaki, the spelling Kokoro v1.0 learned for American English. 62% of Luna's words and 94% of her lines carry such symbols, and "her" and "bird" lose their R before the voice sees them. But a misaki render measured even on single words (Whisper understood 359 of 451 today, 357 with misaki).
- **Decided by round 1 (Alex, 2026-10-28):** Luna's lines take misaki's spelling (it won 4 of 12 sentences and lost none); single words keep today's spelling except J and CH, misaki's `ʤ`/`ʧ` (chick, giraffe, jam won; today's won 14 of 36 words, the fix 4). Letter names were decided here too, but since 2026-11-23 they're Alex's recordings (VOX-9), so they're out of this ticket. Still open: the word "a" tapped on its own ("ay" today, "uh" in a sentence), for Alex and the teacher.
- **How (as planned before round 1):** Alex's picks on the Words and Sentences tabs decide the path:
  - **misaki wins:** a committed pronunciation table (`scripts/voice/pronunciations.json`), built once by misaki and fixable by hand, handed to Kokoro as phonemes (`generate_from_ids`, as the carriers already are). `speakable()`'s respellings ("eigh", "uh") become phoneme entries. A word not in the table falls back to espeak plus misaki's own conversion, with a warning;
  - **mixed:** keep espeak, and add misaki's conversion in Node so R words, J and CH come out right;
  - Alex's calls on "Ms." (said "Miss" today, "Miz" by misaki) and on "a" tapped alone ("ay" today, "uh" by misaki).
  - Then one full `npm run voice:render` (about an hour on the Mac). VOX-2 goes first, since both re-render the words.
- **Complete when:** the chosen path is in place; `voice:audit` fails any line handed to Kokoro with a symbol outside its American set, and passes; what ships matches Alex's picks; build and lint pass.
