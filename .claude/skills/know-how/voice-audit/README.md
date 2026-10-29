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
| `pack.mjs`, `pack2.mjs`, `page/` | Build the Sound Check page's audio and cards for rounds 1 and 2. |

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
