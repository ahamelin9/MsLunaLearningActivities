# VOX — Luna's voice: letter sounds and words

Every letter sound, letter name and word Luna says should sound like a teacher
saying it. From the voice audit of 2026-10-28: every clip was run through a
phoneme recognizer (wav2vec2, English sounds only), Whisper and a formant
tracker, and fixes were rendered to hear side by side on the **Sound Check**
page (an artifact; Alex's picks are saved in its `picks` collection, read with
the ArtifactData tool). The audit kept Kokoro: it is one of very few good
voices that takes exact phonemes, which phonics needs, and the problems are
in how we cut the letter sounds and how it ends a word said alone.

### VOX-1 · Letter sounds retuned by ear
Story · P0 · M · needs: —
- **Why:** the audit measured today's letter sounds:
  - /d/ is heard as /j/ (96% sure), /ch/ as /sh/, X as a plain /s/;
  - 15 of the 20 blends lose their second sound (BL, BR, GL, PL… are heard as "b", "k", "t");
  - /b/, /k/ and /g/ end in "uh" (55–73%), and /w/, /y/ and /kw/ end in a vowel;
  - long A lasts 171 ms against short A's 512; long E and long I start with the h of "he" and "high"; /l/ is cut from the end of "bell", so it sounds like "ull";
  - /z/, /v/ and the voiced TH are heard as hums;
  - /f/ is about 4 dB quieter than the rest by ear (LUFS).
- **How:**
  - Alex's picks on the Sound Check page's Letter sounds tab become entries in `scripts/voice/overrides.json`. Where a pick needs a recipe the overrides can't express yet (a clear /l/ or /r/ held from a word's start, a blend built from its two sounds), extend `scripts/voice/phonemes.mjs` only as far as that pick needs.
  - A sound marked "None are right" gets a new round of takes on the same page until it has a pick. The audit's takes were made with the app's own recipes (`renderSound`), so a pick carries over exactly.
  - Level every sound by perceived loudness (LUFS) instead of raw level.
  - **Round 1 (Alex, 2026-10-28):** settled short a (from "cat"), e ("egg"), i ("it"), o ("dot"), u (today's) and X (today's); 19 were close with one thing off, 34 had none right. His notes changed the methods for round 2: the hisses held from her real hiss (round 1's synthetic noise was "TV static"), long vowels said slowly instead of stretched (the stretching was "robotic") and with no h or k in front ("core" came out like a rude word), the blends' second sound held with no "uh" ("bllll", not "bluh"), and softer, slightly longer stops.
  - **Round 2 (Alex, 2026-10-28):** 16 more picked: /ch/ (today's), long E and long O (said on their own, slowly), /h/ (330 ms), /m/ and /n/ (held with a natural wobble), /p/ (from "pup", softer), /s/ (450 ms), /sh/ (420 ms), SK and ST (a short s, then the stop), SL and SN (the second sound held longer), and, with a note each, FL ("needs the f a bit more"), R (today's, "but shorter") and TR (joined, "the r a bit weird, less on top of one another"). Still none right: 37, among them the other stops (b, d, g, t, k), f, th ("tooth almost right but vibrating"), v, z ("still a bit TV static"), l, ng, j, w, y, kw, long A ("sounds right, but a th in front"), long I, oo, you, ar and er ("today's best, still too fast"), or, and the blends bl, br, cl, cr, dr, fr, gl, gr, pl, pr, sm, sp ("ssspuh"), sw and tw. His patterns: trim the edges, and the natural wobble on many more sounds. The tools that made both rounds are in `.claude/skills/know-how/voice-audit/`.
  - Then `npm run voice:render -- --only sound` and `npm run voice:audit`.
- **Complete when:**
  - every sound on the Sound Check page has Alex's pick, and the rendered clip of each is that pick;
  - VOX-4's sound check passes: /d/ not heard as /j/, /ch/ heard as /ch/, X heard as /k/ + /s/, both sounds heard in every blend, no stop with a vowel after it above the check's line, and every sound within ±2 LU of the set;
  - `voice:audit`, build and lint pass;
  - Alex has listened in the app (Bubble Sounds, Feed Luna, a Blend and Read lesson) and OKed.

### VOX-2 · Words said alone end cleanly
Story · P1 · S · needs: —
- **Why:** about 1 in 8 words said on their own (59 of 451) gain a little sound before or after. Whisper hears "cup" as "copy", "pup" as "Poppy", "nest" as "Naster", "sheep" as "a sheep", "stops" as "it stops", and many of them are the short words children sound out. On 30 such words, rendered with a full stop after the word ("nest."), Whisper understood 17 against 8 today.
- **Round 1 (Alex, 2026-10-28):** the full stop alone didn't fix it: 10 of 16 words were wrong both ways ("cup-ay" in both). Round 2 tries trimming the stray sound from today's clips instead (a vowel after a final stop's release, a sound before the first consonant, a burst after a final nasal). Whisper understood 7 of 19 problem words trimmed, against 2 today; slower renders picked up new stray sounds in front ("a jump").
- **Round 2 (Alex, 2026-10-28):** trimmed won 9 of 19: today's trimmed for cup, pup, green, hen, moon and stops (cup and pup "cut off a bit abruptly at the end, but much better"), a little slower with a full stop and trimmed for ball, bed and key. Still wrong: cook, eat, her, hop, hopped, jump, leaf, peach, popped, sheep. Letter names: P took the slower, trimmed version; B, CH, E and N are still wrong.
- **How (as planned before round 1):** render `word` clips with a full stop after the word in `scripts/voice/render.mjs` (it's part of what Kokoro is handed, so it's part of the clip's fingerprint and every word re-renders once). Check it against Alex's picks on the Words tab's "Word endings" first.
- **Complete when:** word clips are rendered with the full stop; VOX-4's word check counts fewer words with an extra sound at an edge than today's 59, and Whisper understands at least today's 359 of 451; Alex's Word endings picks favour it; `voice:audit`, build and lint pass.

### VOX-4 · A sound check that can fail
Task · P1 · S · needs: —
- **Why:** the audit's measurements live in a scratch folder. Without them, a retune can quietly undo itself, and a sound can't be judged except by ear.
- **How:** move the audit's scripts into `.claude/skills/know-how/`: a sound check (target heard, a vowel after a stop, both sounds of a blend, /d/ not /j/, loudness in LUFS) and a word check (Whisper understood, an extra sound at an edge). They need a Python 3.12 env with torch and transformers (about 2 GB, outside the repo): write the one-line setup in the know-how entry. Keep them out of `npm run voice:audit`, which must stay light.
- **Complete when:** both run from the know-how folder against `public/voice/af_heart`; each fails on today's clips (/d/ as /j/, the blends, the word edges) and passes once VOX-1 and VOX-2 are in; the know-how entry says how to set up and run them.

### VOX-3 · Words and lines in Kokoro's own phoneme spelling, as far as it helps
Story · P2 · M · needs: VOX-2
- **Why:** kokoro-js hands Kokoro espeak's IPA (`eɪ`, `oʊ`, `dʒ`, the length mark `ː`, `ɜː` with no R), not misaki, the spelling Kokoro v1.0 learned for American English. 62% of Luna's words and 94% of her lines carry such symbols, and "her" and "bird" lose their R before the voice sees them. But a misaki render measured even on single words (Whisper understood 359 of 451 today, 357 with misaki). For letter names it helped: F, N and S got their "e" back, and Q, garbled today, came out much closer to "cue".
- **Decided by round 1 (Alex, 2026-10-28):** Luna's lines take misaki's spelling (it won 4 of 12 sentences and lost none); single words keep today's spelling except J and CH, misaki's `ʤ`/`ʧ` (chick, giraffe, jam won; today's won 14 of 36 words, the fix 4); each letter name keeps whichever won: misaki for D, G, J, NG, T, V and W, today's for A, C, F, H, I, K, O, Q, SH, TH and Z, either for the rest. B, CH, E, N and P were wrong both ways and go through VOX-2's edge fix. Still open: the word "a" tapped on its own ("ay" today, "uh" in a sentence), for Alex and the teacher.
- **How (as planned before round 1):** Alex's picks on the Letter names, Words and Sentences tabs decide the path:
  - **misaki wins:** a committed pronunciation table (`scripts/voice/pronunciations.json`), built once by misaki and fixable by hand, handed to Kokoro as phonemes (`generate_from_ids`, as the carriers already are). `speakable()`'s respellings ("eigh", "uh") and `letterNameSpeech`'s ("ef", "jee") become phoneme entries. A word not in the table falls back to espeak plus misaki's own conversion, with a warning;
  - **mixed:** keep espeak, add misaki's conversion in Node so R words, J and CH come out right, and give only the letter names a phoneme table;
  - Alex's calls on "Ms." (said "Miss" today, "Miz" by misaki) and on "a" tapped alone ("ay" today, "uh" by misaki).
  - Then one full `npm run voice:render` (about an hour on the Mac). VOX-2 goes first, since both re-render the words.
- **Complete when:** the chosen path is in place; `voice:audit` fails any line handed to Kokoro with a symbol outside its American set, and passes; every letter name is heard as its name by VOX-4's check; what ships matches Alex's picks; build and lint pass.
