#!/usr/bin/env python3
"""Rough-voice scan (VOX-6): which of Luna's clips drop into a creak or a growl?

    python3 .claude/skills/know-how/voice-audit/roughscan.py <out.json> [speeds=normal,slow] [kinds=text,word,name]

Needs only numpy and the repo's ffmpeg-static (no Praat, no librosa). Run from
the repo root. Every clip is decoded to 16 kHz mono, and its pitch tracked by
autocorrelation in 40 ms frames every 10 ms. Luna's voice sits near 200 Hz; a
"demon" sound is her pitch falling an octave or more (vocal fry, a doubled
period) or jumping about. Per clip it reports:
  - median: her median pitch, Hz
  - low: the share of voiced frames below 0.62 x her median or 120 Hz
  - lowRun: the longest run of such frames, ms (a growl you hear is a run)
  - jumps: pitch jumps over 5 semitones between neighbouring voiced frames
  - wobble: the median pitch change from one voiced frame to the next, in
    cents, within runs of voicing (a shaky, warbling voice is high)
  - trem: how much her loudness swings 4-12 times a second while voiced
    (a tremolo), as a share of its mean
and a score (lowRun first, then low), worst first. The teacher heard it, so
the score is a guide to what to listen to, not a verdict.
"""
import json
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np

ROOT = Path.cwd()
VOICE = ROOT / 'public/voice/af_heart'
FFMPEG = ROOT / 'node_modules/ffmpeg-static/ffmpeg'
SR = 16000
FRAME, HOP = 640, 160  # 40 ms, 10 ms
FMIN, FMAX = 60, 500


def decode(path: Path) -> np.ndarray:
    raw = subprocess.run(
        [str(FFMPEG), '-v', 'quiet', '-i', str(path), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32)


def pitch_track(x: np.ndarray):
    """f0 per frame (0 where unvoiced), by normalized autocorrelation, and each frame's loudness."""
    if len(x) < FRAME:
        return np.zeros(0), np.zeros(0)
    n = 1 + (len(x) - FRAME) // HOP
    frames = np.lib.stride_tricks.as_strided(x, (n, FRAME), (x.strides[0] * HOP, x.strides[0])).copy()
    frames -= frames.mean(axis=1, keepdims=True)
    energy = np.sqrt((frames ** 2).mean(axis=1))
    loud = energy > energy.max() * 10 ** (-30 / 20)
    spec = np.fft.rfft(frames * np.hanning(FRAME), 2 * FRAME, axis=1)
    acf = np.fft.irfft(np.abs(spec) ** 2, axis=1)[:, :FRAME]
    acf /= np.maximum(acf[:, :1], 1e-12)
    lo, hi = SR // FMAX, SR // FMIN
    seg = acf[:, lo:hi]
    lag = seg.argmax(axis=1) + lo
    peak = seg.max(axis=1)
    f0 = np.where(loud & (peak > 0.45), SR / lag, 0.0)
    return f0, energy


def measure(track):
    f0, energy = track
    voiced = f0 > 0
    if voiced.sum() < 5:
        return None
    med = float(np.median(f0[voiced]))
    low = voiced & ((f0 < 0.62 * med) | (f0 < 120))
    run = best = 0
    for v, l in zip(voiced, low):
        if l:
            run += 1
            best = max(best, run)
        elif v:
            run = 0
    v = f0[voiced]
    jumps = int((np.abs(np.diff(np.log2(v))) > 5 / 12).sum())
    # within runs of voicing only: neighbours both voiced
    both = voiced[1:] & voiced[:-1]
    steps = np.abs(np.diff(np.log2(np.where(voiced, f0, 1.0))))[both] * 1200
    wobble = float(np.median(steps)) if steps.size else 0.0
    # tremolo: loudness swings at 4-12 Hz across the longest voiced run
    trem = 0.0
    edges = np.flatnonzero(np.diff(np.r_[0, voiced.astype(int), 0]))
    runs = list(zip(edges[::2], edges[1::2]))
    a, b = max(runs, key=lambda r: r[1] - r[0])
    if b - a >= 25:
        e = energy[a:b]
        spec = np.abs(np.fft.rfft((e - e.mean()) * np.hanning(len(e))))
        freqs = np.fft.rfftfreq(len(e), HOP / SR)
        band = (freqs >= 4) & (freqs <= 12)
        trem = float(spec[band].max() * 2 / (np.hanning(len(e)).sum() * max(e.mean(), 1e-9)))
    return {
        'wobble': round(wobble, 1),
        'trem': round(trem, 3),
        'median': round(med),
        'low': round(float(low.sum() / voiced.sum()), 3),
        'lowRun': best * 10,
        'jumps': jumps,
    }


def main():
    out = Path(sys.argv[1])
    speeds = (sys.argv[2] if len(sys.argv) > 2 else 'normal,slow').split(',')
    kinds = (sys.argv[3] if len(sys.argv) > 3 else 'text,word,name').split(',')
    clips = json.loads((VOICE / 'manifest.json').read_text())['clips']
    jobs = {}
    for key, file in clips.items():
        parts = key.split('|')
        kind, speed = parts[0], parts[-1]
        if kind in kinds and speed in speeds:
            jobs.setdefault(file, {'file': file, 'kind': kind, 'speed': speed, 'text': '|'.join(parts[1:-1])})

    def one(job):
        try:
            m = measure(pitch_track(decode(VOICE / job['file'])))
        except subprocess.CalledProcessError:
            m = None
        return {**job, **(m or {'median': 0, 'low': 0, 'lowRun': 0, 'jumps': 0, 'wobble': 0, 'trem': 0})}

    with ThreadPoolExecutor(8) as pool:
        rows = list(pool.map(one, jobs.values()))
    rows.sort(key=lambda r: (r['lowRun'], r['low']), reverse=True)
    out.write_text(json.dumps(rows, indent=1))
    for speed in speeds:
        mine = [r for r in rows if r['speed'] == speed]
        runs = np.array([r['lowRun'] for r in mine])
        print(f'{speed}: {len(mine)} clips; low run >= 100 ms in {(runs >= 100).sum()}, >= 200 ms in {(runs >= 200).sum()}')
    for speed in speeds:
        mine = [r for r in rows if r['speed'] == speed and r['median']]
        w = np.array([r['wobble'] for r in mine]); t = np.array([r['trem'] for r in mine])
        print(f'{speed}: wobble median {np.median(w):.0f} cents, 95th {np.percentile(w, 95):.0f}; tremolo median {np.median(t):.2f}, 95th {np.percentile(t, 95):.2f}')
    for key in ('lowRun', 'wobble', 'trem'):
        print(f'-- worst by {key}')
        for r in sorted(rows, key=lambda r: r[key], reverse=True)[:12]:
            print(f"{r['lowRun']:4d} ms  wob {r['wobble']:5.1f}  trem {r['trem']:.2f}  med {r['median']:3d}  {r['speed']:6s} {r['kind']:5s} {r['text'][:64]}")


if __name__ == '__main__':
    main()
