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

The voice converter (VOX-7's `convert-takes.py`) needs Python 3.11 and its
own env, since Chatterbox pins torch 2.6. It lives with conda's envs, not the
scratchpad, so a reboot keeps it (about 2–3 GB; the model itself is cached in
`~/.cache/huggingface`, so don't delete that):

```bash
~/anaconda3/bin/conda create -y -n luna-vc python=3.11
~/anaconda3/envs/luna-vc/bin/pip install chatterbox-tts "setuptools<81" soundfile
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
| `convert-takes.py` | VOX-7: Alex's takes from the recording page (`localhost:5199/?record`, saved in `scripts/voice/takes/`, which git ignores) trimmed, levelled and converted into Luna's voice. Run from the repo root as `~/anaconda3/envs/luna-vc/bin/python .claude/skills/know-how/voice-audit/convert-takes.py <outdir> [B,D,…]`; `<outdir>` must be outside the repo or ignored, and gets `<take>--his.wav`, `<take>--luna.wav` and `luna-ref.wav` (25 s of her lines it converts to). Only the `--luna` files go on the Sound Check page. |
| `pack-r5.py`, `page-r5.py`, `page-r5-check.mjs` | VOX-8's round 5 on the Sound Check page. `pack-r5.py <repo> <outdir>` (luna-vc python) packs each card's clips from `.voice-tmp/vox8/` into `audio-r5.json` (the app's clip today, the three takes as Luna, the word, and his own takes for breathy sounds), flagging a silent or cut-off take. `page-r5.py <index.html> <r5-cards.json>` adds the tab to a copy of the page (read the artifact first). `page-r5-check.mjs <repo> <pagedir> [width]` serves the copy and checks it headless before publishing. |
| `make-r6.py`, `pack-round.py`, `page-r6.py`, `page-r6-check.mjs` | Round 6 (VOX-8): second tries at what round 5 found no take for. `make-r6.py <convdir> <outdir>` (luna-vc) makes the R and SN candidates (each take raised 4 or 7 semitones before converting, whichever leaves the lower F3; the cut from the word; his take made higher; his own) and the SM/PL word cuts, plus `round6.json`. `pack-round.py <repo> <cards.json> r6 <audio-r6.json>` packs any round's cards (`today` from the manifest). `page-r6.py <index.html> <round6.json>` adds the tab, or on a second run only swaps the cards, so the re-recorded E, I, V, Z and the letter names can join. `page-r6-check.mjs <repo> <pagedir> [width]` checks the copy headless (each group in turn, Next, every clip). `add-r6-again.py <againdir> <round6.json>` adds the re-recorded E, I, V, Z and the letter names (VOX-9) to the cards and measures them; re-patch from the page before round 6 (`page-r6.py` swaps only the data, not the code). |
| `page-r7.py`, `page-r7-check.mjs` | Round 7 (ER, CR, DR recorded again): `make-r6.py <convdir> <outdir> ER,CR,DR round7.json` makes its cards, then `page-r7.py <index.html> <round7.json>` adds the tab, drawing round 6's card under the `r7` prefix. Careful: `list.map(r6Card)` hands the index in as the round, so map with `c => r6Card(c)`; the round 6 check caught it. |
| `apply-picks.mjs` | `apply-picks.mjs <r5|r6|r7> <picksDir> <takesDir> <cards.json> [overrides.json] [--dry]`. Copies the Sound Check picks (the `picks` collection saved with ArtifactData's `out_dir`) into `scripts/voice/recorded/`, one file for every key sharing the sound (K also feeds C and CK). An overrides file names a pick that isn't a plain take (another card's take, a sound cut from the word). `--dry` lists without copying. Then `npm run voice:render -- --only sound`. |
| `takeformants.py` | His raw take beside Luna's, per take: voiced share and F1–F3 (librosa LPC, runs in luna-vc). Shows what the converter lost: an R's low F3, a vowel pair too alike, a whispered V or Z. `--word` measures the sounded-out word. |
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
| `roughscan.py` | VOX-6: every rendered clip's pitch, tracked by autocorrelation (numpy and the repo's ffmpeg-static only, no conda env): how long it falls into a creak or growl, its wobble in cents, and pitch jumps, worst first. Run from the repo root as `python3 .claude/skills/know-how/voice-audit/roughscan.py <out.json> [normal,slow,quick] [text,word,name,sound]` (about a minute for all 11,000). On 2026-11-12 it found every clip clean: no low run past 110 ms, the same wobble at all three speeds. |
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
- **The converter (Chatterbox VC) loses R** (VOX-8, round 5). Alex's R
  dips F3 to about 1200 Hz; the converted take sits at 2800–3200, and Alex
  hears no R. Inside a word it keeps about half. Pitching his take up 7
  semitones first (`librosa.effects.pitch_shift`) brings a blend's R to about
  1900–2000, a lone R or ER only to 2200–2500. Measure his raw take first:
  if it's right there, recording again won't help.
- Before blaming the converter, measure the raw take: round 5's V and Z were
  whispered (0% voiced), and his E and I sat 50 Hz apart in F1.
- A final V or Z said alone ("five", "buzz") has no pitch at all: Kokoro
  devoices it, so nothing there can be held.
