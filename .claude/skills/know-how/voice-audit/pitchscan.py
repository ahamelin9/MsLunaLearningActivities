"""Pitch of every recorded sound and letter name beside Luna's own words.

  ~/anaconda3/envs/luna-vc/bin/python .claude/skills/know-how/voice-audit/pitchscan.py [out.json]

Measures the median pitch (pYIN, voiced frames only) of each file in
scripts/voice/recorded/ and of a sample of Luna's rendered word clips (the
manifest's `word|…|normal` keys), and lists each recording's distance from
Luna's median in semitones. A breath (f, h, s, sh…) has no pitch and is
listed as unvoiced.
"""
import json, sys, random, subprocess
from pathlib import Path
import numpy as np, librosa

root = Path(__file__).resolve().parents[4]
rec = root / 'scripts/voice/recorded'
voice = root / 'public/voice/af_heart'
SR = 24000

def load(p):
    if p.suffix == '.wav':
        y, _ = librosa.load(p, sr=SR, mono=True)
        return y
    raw = subprocess.run([str(root / 'node_modules/ffmpeg-static/ffmpeg'), '-v', 'error', '-i', str(p), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)

def pitch(y):
    f0, vflag, _ = librosa.pyin(y, fmin=80, fmax=500, sr=SR, frame_length=1024)
    v = f0[vflag & ~np.isnan(f0)]
    if len(v) < 4:
        return None, 0.0
    return float(np.median(v)), len(v) / max(1, len(f0))

man = json.load(open(voice / 'manifest.json'))['clips']
words = [k for k in man if k.startswith('word|') and k.endswith('|normal')]
random.seed(1)
luna = []
for k in random.sample(words, 80):
    f, _ = pitch(load(voice / man[k]))
    if f: luna.append(f)
ref = float(np.median(luna))
print(f'Luna words: median {ref:.0f} Hz (n={len(luna)}, 10-90%: {np.percentile(luna,10):.0f}-{np.percentile(luna,90):.0f})')

rows = []
for p in sorted(rec.glob('*.wav')):
    f, share = pitch(load(p))
    st = None if f is None else 12 * np.log2(f / ref)
    rows.append({'file': p.stem, 'hz': f, 'semitones': st, 'voiced': share})
for r in sorted(rows, key=lambda r: -abs(r['semitones']) if r['semitones'] is not None else 99):
    if r['hz'] is None:
        print(f"{r['file']:22s}  unvoiced")
    else:
        print(f"{r['file']:22s}  {r['hz']:5.0f} Hz  {r['semitones']:+5.1f} st  voiced {r['voiced']:.0%}")
if len(sys.argv) > 1:
    json.dump({'luna_hz': ref, 'rows': rows}, open(sys.argv[1], 'w'), indent=1)
