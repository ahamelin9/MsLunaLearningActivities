# Voice audit tools (VOX)

The working scripts from the 2026-10-28 voice audit, kept so the next round
doesn't start from nothing. They're rough: VOX-4 turns the scoring ones into
a proper check. Alex's picks live on the Sound Check page (an artifact; its
link is in Claude's memory, not here, since the repo is public), in its
`picks` collection: read them with the ArtifactData tool.

## Setup (once per Mac, outside the repo, about 2 GB)

The recognizer, Whisper and misaki need Python 3.12 (kokoro and misaki don't
install on 3.13):

```bash
conda create -y -p <scratch>/py312 python=3.12
<scratch>/py312/bin/pip install torch transformers soundfile librosa kokoro praat-parselmouth pyloudnorm
```

The Node scripts use the repo's own `kokoro-js` and `ffmpeg-static`. Run them
from the repo root (`node .claude/skills/know-how/voice-audit/<script>`), or
with `node --input-type=module -e "$(cat …)"` where a script says so.

## What each does

| Script | Does |
|---|---|
| `ab-render.mjs` | Renders `[{ id, text? , ps?, speed? }]` with Luna's voice: from text (kokoro-js's espeak path, as the app does) or from phonemes you give it. Run with `node --input-type=module -e "$(cat …)" <jobs.json> <outDir>`. |
| `proto-round1.mjs`, `proto-round2.mjs`, `proto-round2-blends.mjs` | Render takes of the letter sounds with the app's own recipes (`renderSound`) and new tunings. Round 2 added her real hiss held by overlapping grains (not synthetic noise), vowels said slowly instead of stretched, blends with the second sound held, and joined blends. |
| `edgetrim.py` | Trims the stray sound Kokoro adds around a word said alone: a vowel after a final stop ("cup-ay"), a sound before the first consonant ("a-sheep"), a burst after a final nasal. Alex picked trimmed versions in round 2. |
| `hear.py` | Phoneme recognizer (wav2vec2 espeak) and, for `words`, Whisper, on a list of clips. |
| `score.py` | The recognizer limited to English sounds: is the target there, is there a vowel after a stop, are both sounds of a blend there. It can't judge a vowel or a hiss on its own. |
| `formants.py`, `wordvowel.py` | Vowel formants of the sound clips, and of the same vowels inside Luna's words. |
| `compare-words.py` | Today's words against misaki renders: Whisper understood, phone distance. |
| `g2p.py` | misaki's phonemes for a word list. |
| `pack.mjs`, `pack2.mjs`, `pack3.mjs`, `page/` | Build the Sound Check page's audio and cards: rounds 1 and 2, and the research run's tab. |

Added by the research run of 2026-10-28 (`docs/voice/research-2026-10-28.md`):

| Script | Does |
|---|---|
| `libri-prep.mjs` | Picks LibriSpeech utterances and phonemizes their transcripts with espeak (en-us). |
| `align.py` | Lines a recording up with its phonemes (CTC forced alignment with the wav2vec2 phoneme model), then measures each sound: formants at 25/50/75%, the lowest F3 for R sounds, where a hiss's energy centres. Works on real speech and on Luna's own sentences or words. |
| `phonestats.py` | Per-sound medians from `align.py`'s output (`summary <phones.json> [F|M]`). |
| `measure_clips.py` | The same measures on isolated letter-sound clips, plus how long the voice runs after a stop's burst. |
| `holdspan.mjs` | Holds one measured stretch of a word (the L of "lip", the R of "red") with PSOLA and a natural wobble. Run from the repo root. |
| `whisperstop.py` | Kilpatrick's stop: the burst, then a whispered vowel instead of a voiced "uh". |
| `hisshold.py` | Her real F/TH hiss held with long overlapping grains, and a "softer" version. |
| `bakeoff.py`, `vctest.py` | Chatterbox (MIT) cloned to Luna from a Kokoro sample, and its voice converter turning a real reader into Luna. They need their own Python 3.11 env: `pip install chatterbox-tts "setuptools<81"` (Chatterbox pins torch 2.6, so keep it apart from the 3.12 env above). Its watermarker needs setuptools' `pkg_resources`. |

Added by the second pass of 2026-10-29 (same notes, "Second pass" section):

| Script | Does |
|---|---|
| `pieces.mjs` | Builds a take from measured pieces of one word: each piece copied, held with PSOLA (voiced, with wobble) or held with long grains (a hiss), at its own loudness, joined with crossfades. W, Y, J, NG, V, Z, voiced TH, SP and SM candidates were made this way. Skips a piece with no pitch to hold (a final V or Z that Kokoro devoiced). |
| `heldmeasure.py` | Measures any take: length, how much is voiced, formants over the voiced middle, and brightness in the 1–7.8 kHz band, so it compares fairly with LibriSpeech. |
| `agree.py` | Ranks each card's takes by the measures and reports where Alex's pick came, then tries the measures as a gate (throw out wrong takes) and counts how often it would have thrown out his pick. |
| `cutword.py` | Cuts a word out of a carrier phrase ("Say bed again.") using the aligner's spans. |
| `pack4.mjs`, `pack5.mjs` | Add the second pass's groups (round 3 candidates; the voice-blend test) to the Sound Check page's Research tab and rewrite the page's `RESEARCH` data in place. |
| `wscore.py` | Counts the words Whisper understood in `hear.py words` output, per voice (keys `<voice>:<word>`), accepting digits for numbers and homophones ("right" for "write"). Run as `python wscore.py <heard.json>...`. On the research run: Luna 360 of 450, Luna/Kore 50/50 393 (a stricter count gave 355 and 388 earlier). |
| `blend-render.mjs` | Renders text in a weighted blend of Kokoro voices (`{ af_heart: 0.7, af_kore: 0.3 }`) by averaging their style vectors and handing the result to the model directly; nothing in `node_modules` changes. At `{ af_heart: 1 }` it matches kokoro-js's own render sample for sample. |

Things learned:

- LibriSpeech is 16 kHz, so compare hisses in the same band (1–7.8 kHz).
- CTC alignment marks each phone with one frame; `align.py` takes a phone
  to last until the next one starts.
- Measure the formant track once per recording, not once per phone (it was
  50 times slower).
- Hugging Face's "xet" download stalled at 0 bytes; `HF_HUB_DISABLE_XET=1`
  downloads over plain HTTP.
- openslr.org is slow (about 100 KB/s). A partly downloaded `.tar.gz`
  still unpacks everything before the cut.

## What the rounds found

Round results and Alex's decisions are on the VOX tickets in
`kanban/epics/VOX.md`. Things to know before a round 3:

- A machine ear (wav2vec2, Whisper) hears every isolated vowel as "ah" and
  can't name a held hiss or hum, so vowels and held sounds are Alex's to judge.
  It is reliable for consonants: /d/ heard as /j/, a vowel after a stop, a
  blend's missing second sound.
- Kokoro devoices L, R and W after K, P, T and F, so those blends can't hold
  their own second sound; they're joined from a held L, R or W.
- Handing Kokoro a phoneme repeated ("mmmmmmmm") makes it babble, not hold.
- Grains of 40 ms at half overlap made /th/ sound like it was "vibrating"
  (round 2): try longer grains.
- **Brightness predicts "TV static".** A hiss up to about 35% brighter than
  real speech (1–7.8 kHz centroid) passed Alex's ear (S +19%, H +27%, SH
  +34%); Z at +42% was "still a bit static"; F, TH and V at +115–190% were
  "TV static". Compression doesn't change brightness (40 and 96 kbps measure
  the same), so the static comes from the recipe.
- **The measures work as a gate, not a judge.** On round 1, ranking takes
  by the measures put Alex's pick first 10 times in 20 (chance: 6). As a
  gate, "a vowel's F2 within 20% of Luna's own, an R's F3 under 2400 Hz"
  threw out 25 wrong takes and only one of his picks (the L he'd called
  "still a bit wrong", which measured as an "e"). The recognizer can't be a
  gate for blends or isolated stops: it scores nearly all of them near zero.
- **Kokoro opens short vowels in a word said alone.** Short i measures F1
  about 750 Hz alone (real: 483) but 605 inside "Say ___ again."; the
  recognizer hears it as "e" in 12 of 26 words alone, 1 in 26 in the phrase.
  Speed doesn't matter (slow, normal and quick measure the same), nor do
  `ᵻ` for `ɪ`, `e` for `ɛ`, "." or "!". Short e leans to "a" alone and
  further inside a phrase. Every Kokoro voice drifts (af_heart is among the
  clearest by Whisper); a blend of af_heart 70% / af_kore 30% raised
  Whisper's score on the 450 app words from 355 to 388.
- Formants and the machine ears can disagree on vowels: af_kore's short i
  measures exactly right, yet it's heard shifted more often. Judge a vowel
  fix by Whisper and Alex's ear, not by F1 alone.
- Measure the word's own vowel, never the carrier's: "again" has an `ɛ`,
  "I can say" an `æ`.
- A final V or Z said alone ("five", "buzz") has no pitch at all: Kokoro
  devoices it, so nothing there can be held.
