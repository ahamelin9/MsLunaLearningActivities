# Round 8's "words sounded out" (VOX-10): Alex couldn't judge the sounds one
# at a time ("unless we put it next to other sounds": in a lesson, ship's sh,
# i and p sounded like three voices). Each word is played as a lesson plays
# it: every sound, 100 ms apart (SOUND_GAP_MS), then the whole word.
#   today  the app's rendered clips now
#   a, b   each sound's version A or B from repitch.py where it has one,
#          else its recording as it is, put through the render's own trim
#          and level (trimSilence, normalize at -20 dB): what the app would
#          play. F is levelled at -20 too: its old -27 (overrides.json) was
#          for Kokoro's synthetic F, and left Alex's F 8 dB under the rest.
# Then prepends the word cards (group "words") to round8.json.
#   p      (with a third argument, onepass.py's folder) every sound from the
#          one-pass conversion, for the words it has all the sounds of;
#          those words come first
#   ~/anaconda3/envs/luna-vc/bin/python .claude/skills/know-how/voice-audit/make-r8-words.py <repitch outdir> <round8.json> [onepass dir]
import json, os, subprocess, sys
import numpy as np, soundfile as sf

new, cards_path = sys.argv[1], sys.argv[2]
onepass = sys.argv[3] if len(sys.argv) > 3 else None
ROOT = os.getcwd()
VOICE = os.path.join(ROOT, 'public/voice/af_heart')
REC = os.path.join(ROOT, 'scripts/voice/recorded')
FF = os.path.join(ROOT, 'node_modules/ffmpeg-static/ffmpeg')
OUT = os.path.join(os.path.dirname(cards_path), 'words')
RATE, GAP_MS = 24000, 100
clips = json.load(open(os.path.join(VOICE, 'manifest.json')))['clips']
tune = json.load(open(os.path.join(ROOT, 'scripts/voice/overrides.json')))

WORDS = [  # (word, its sounds as recording keys), as the lessons split them
    ('ship', 'SH I P'), ('fish', 'F I SH'), ('map', 'M A P'), ('dog', 'D O G'), ('sun', 'S U N'), ('bed', 'B E D'),
    ('hen', 'H E N'), ('leg', 'L E G'), ('web', 'W E B'), ('jam', 'J A M'), ('van', 'V A N'), ('zip', 'Z I P'),
    ('ring', 'R I NG'), ('cup', 'C U P'), ('moon', 'M OO N'), ('kite', 'K I_alt T'), ('tree', 'TR EE'),
    ('star', 'ST AR'), ('frog', 'FR O G'), ('drum', 'DR U M'), ('plum', 'PL U M'), ('clap', 'CL A P'), ('glad', 'GL A D'),
]


def load(p):
    raw = subprocess.run([FF, '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', str(RATE), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def trim_silence(x, floor_db=-42, pad_ms=8):  # scripts/voice/dsp.mjs trimSilence
    limit = np.abs(x).max() * 10 ** (floor_db / 20)
    on = np.nonzero(np.abs(x) >= limit)[0]
    if len(on) < 2:
        return x
    pad = int(RATE * pad_ms / 1000)
    return x[max(0, on[0] - pad): on[-1] + pad + 1]


def normalize(x, target_db=-20, ceiling_db=-1.5):  # dsp.mjs normalize
    p = np.abs(x).max()
    if p < 1e-6:
        return x
    g = x[np.abs(x) >= p * 0.05]
    gain = 10 ** (target_db / 20) / np.sqrt(np.mean(g ** 2))
    gain = min(gain, 10 ** (ceiling_db / 20) / p)
    return x * gain


def sound_id(key):
    import re
    src = open(os.path.join(ROOT, 'scripts/voice/phonemes.mjs')).read()
    m = re.search(r"'?%s'?: '([a-z]+)'" % re.escape(key.replace('_alt', '+alt')), src[src.index('export const KEY_TO_SOUND'):])
    return m.group(1)


def as_app(path, key):
    t = tune.get(f'sound|{sound_id(key)}', {})
    db = -20 if key == 'F' else t.get('targetDb', -20)
    return normalize(trim_silence(load(path)), db)


def version(key, v):
    if v == 'p':
        return as_app(os.path.join(onepass, f'sound__{key}.wav'), key)
    for name in (f'sound__{key}.wav',):
        p = os.path.join(new, v.upper(), name)
        if os.path.exists(p):
            return as_app(p, key)
    return as_app(os.path.join(REC, f'sound__{key}.wav'), key)


def today(key):
    return load(os.path.join(VOICE, clips[f"sound|{key.replace('_alt', '+alt')}|normal"]))


gap = np.zeros(int(RATE * GAP_MS / 1000), np.float32)
cards = []
for word, keys in WORDS:
    keys = keys.split()
    whole = load(os.path.join(VOICE, clips[f'word|{word}|normal']))
    takes = []
    versions = [('today', 'In the app today', 'each sound as it plays now, then the word'),
                ('a', 'At her pitch, converted again', "each sound's version A"),
                ('b', "At her pitch, today's clips", "each sound's version B")]
    if onepass and all(os.path.exists(os.path.join(onepass, f'sound__{k}.wav')) for k in keys):
        versions.append(('p', 'New: one pass, at her pitch', 'every sound converted together, so one voice'))
    for v, label, small in versions:
        parts = []
        for k in keys:
            parts += [today(k) if v == 'today' else version(k, v), gap]
        y = np.concatenate(parts + [gap, whole]).astype(np.float32)
        os.makedirs(os.path.join(OUT, v), exist_ok=True)
        path = os.path.join(OUT, v, f'{word}.wav')
        sf.write(path, y, RATE)
        takes.append({'id': v, 'label': label, 'small': small, 'path': os.path.relpath(path, ROOT)})
    cards.append({'sid': f'w-{word}', 'key': word, 'kind': 'word', 'keys': [], 'word': word, 'group': 'words',
                  'title': word, 'sub': ' · '.join(k.replace('_alt', ' long').lower() for k in keys), 'takes': takes})
    print(word, '·', ' '.join(keys))

cards.sort(key=lambda c: not any(t['id'] == 'p' for t in c['takes']))  # the one-pass words first
old = [c for c in json.load(open(cards_path)) if c['group'] != 'words']
json.dump(cards + old, open(cards_path, 'w'), indent=1)
print(len(cards), 'words added to', cards_path)
