"""Loudness, brightness and length of every letter sound the app plays.

  ~/anaconda3/envs/luna-vc/bin/python .claude/skills/know-how/voice-audit/soundscan.py [KEYS] [--dir DIR]

Reads the rendered clips (`sound|<KEY>|normal` in the manifest), or with
--dir a folder of `sound__<KEY>.wav`, and gives for each: the loudness of
the sound itself (RMS of the frames within 30 dB of its peak, so silence
around it doesn't count), its spectral centroid (brightness), and its length.
Sounds side by side in a word should sit within a few dB of each other.
"""
import json, sys, subprocess
from pathlib import Path
import numpy as np, librosa

root = Path.cwd()
voice = root / 'public/voice/af_heart'
FF = str(root / 'node_modules/ffmpeg-static/ffmpeg')
SR = 24000
args = [a for a in sys.argv[1:] if not a.startswith('--')]
d = sys.argv[sys.argv.index('--dir') + 1] if '--dir' in sys.argv else None
if d: args = [a for a in args if a != d]
keys = args[0].split(',') if args else None


def load(p):
    raw = subprocess.run([FF, '-v', 'error', '-i', str(p), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def measure(y):
    rms = librosa.feature.rms(y=y, frame_length=1024, hop_length=256)[0]
    on = rms > rms.max() * 10 ** (-30 / 20)
    loud = 20 * np.log10(np.sqrt(np.mean(rms[on] ** 2)) + 1e-9)
    c = librosa.feature.spectral_centroid(y=y, sr=SR, n_fft=1024, hop_length=256)[0]
    return loud, float(np.median(c[on[:len(c)]])), on.sum() * 256 / SR


clips = json.load(open(voice / 'manifest.json'))['clips']
if d:
    files = {p.stem.split('__', 1)[1].replace('_alt', '+alt'): p for p in Path(d).glob('sound__*.wav')}
else:
    files = {k.split('|')[1]: voice / f for k, f in clips.items() if k.startswith('sound|') and k.endswith('|normal')}
rows = []
for k, p in sorted(files.items()):
    if keys and k not in keys:
        continue
    loud, cent, dur = measure(load(p))
    rows.append((k, loud, cent, dur))
    print(f'{k:8s} {loud:6.1f} dB   centroid {cent:5.0f} Hz   {dur:.2f} s')
if len(rows) > 2:
    l = [r[1] for r in rows]
    print(f'loudness: median {np.median(l):.1f} dB, from {min(l):.1f} to {max(l):.1f}')
