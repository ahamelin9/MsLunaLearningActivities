# Trims the stray sound Kokoro adds around a word said on its own:
# a vowel after the final stop ("cup-ay") and a sound before the first
# consonant ("a-sheep", "a-green").
#   python edgetrim.py <jobs.json> <outdir>   jobs: [{id, wav, first, last}]
import sys, json, os, numpy as np, soundfile as sf

STOPS = set('pbtdkgʧʤ') | {'tʃ', 'dʒ', 'ɡ'}
VOICELESS_START = set('sʃfθhptkʧ') | {'tʃ'}
VOICED_STOP_START = set('bdgɡʤ') | {'dʒ'}

def analyze(x, sr, hop=0.005, win=0.025):
    h, w = int(hop * sr), int(win * sr)
    fr = []
    for i in range(0, max(1, len(x) - w), h):
        s = x[i:i + w]
        r = np.sqrt(np.mean(s ** 2)) + 1e-9
        zc = np.mean(np.abs(np.diff(np.sign(s)))) / 2 * sr
        s0 = s - s.mean()
        ac = np.correlate(s0, s0, 'full')[w - 1:]
        lo, hi = int(sr / 400), int(sr / 80)
        v = float(ac[lo:hi].max() / ac[0]) if ac[0] > 1e-9 else 0.0
        fr.append((i, 20 * np.log10(r), zc, v))
    return fr

def trim(x, sr, first, last):
    fr = analyze(x, sr)
    db = [f[1] for f in fr]; ref = max(db)
    V = [f[3] > 0.55 and f[1] > ref - 15 for f in fr]
    N = [f[2] > 3000 and f[1] > ref - 34 for f in fr]
    def run_from(flags, i):
        j = i
        while j < len(flags) and flags[j]: j += 1
        return j
    at = lambda i: fr[min(i, len(fr) - 1)][0]
    notes = []
    s0 = next(i for i, d in enumerate(db) if d > ref - 40)
    e0 = len(db) - next(i for i, d in enumerate(reversed(db)) if d > ref - 40)
    start, end = at(s0), min(len(x), at(e0) + int(0.02 * sr))
    # ---- the start
    if first in VOICELESS_START:
        n = next((i for i in range(len(fr)) if N[i] and run_from(N, i) - i >= 4), None)
        v = next((i for i in range(s0, n or 0) if V[i] and run_from(V, i) - i >= 4 and db[i] > ref - 12), None)
        if first != 'h' and n is not None and v is not None and v < n and at(v) < 0.1 * sr and at(n) - at(s0) < 0.15 * sr:
            start = max(0, at(n) - int(0.01 * sr)); notes.append(f'cut {round((start - at(s0)) / sr * 1000)} ms before the {first}')
    elif first in VOICED_STOP_START:
        v = next((i for i in range(s0, len(fr)) if V[i]), None)
        if v is not None and at(v) < 0.08 * sr:
            e = run_from(V, v)
            if max(db[v:e]) > ref - 6 and e - v >= 4:
                d = e
                while d < len(fr) and db[d] < ref - 8 and d - e < 30: d += 1
                if d - e >= 2:
                    start = at(e); notes.append(f'cut {round((start - at(s0)) / sr * 1000)} ms before the {first}')
    elif first in set('aeiouɑæɛɪʌʊɔəɜAIOWYɐ'):
        v = next((i for i in range(s0, len(fr)) if V[i] and db[i] > ref - 10), None)
        if v is not None and v - s0 > 3:
            start = at(v) - int(0.008 * sr); notes.append(f'cut {round((start - at(s0)) / sr * 1000)} ms before the vowel')
    # ---- the end
    if last in STOPS:
        loud = max(range(len(fr)), key=lambda i: db[i] if V[i] else -999)
        i = run_from(V, loud)
        c = next((k for k in range(i, min(len(fr), i + 30)) if db[k] < ref - 15), None)
        if c is not None:
            ce = c
            while ce < len(fr) and db[ce] < ref - 12: ce += 1
            if ce - c >= 3:
                t = next((k for k in range(ce, min(len(fr), ce + 12)) if V[k] and run_from(V, k) - k >= 4), None)
                if t is not None and at(t) > at(loud) + 0.08 * sr and at(e0) - at(t) < 0.2 * sr:
                    end = at(t) + int(0.005 * sr); notes.append(f'cut {round((at(e0) - end) / sr * 1000)} ms of vowel after the {last}')
                else:
                    a = run_from(N, ce)
                    if (a - ce) * 5 > 70:
                        end = at(ce) + int(0.05 * sr); notes.append(f'shortened the {last} release')
    if last in set('mnŋl'):
        runs, i = [], s0
        while i < e0:
            if V[i]:
                j = run_from(V, i); runs.append((i, j)); i = j
            else: i += 1
        long = [r for r in runs if r[1] - r[0] >= 8]
        if long and long[-1][1] < e0 - 4:
            end = at(long[-1][1]) + int(0.015 * sr); notes.append(f'cut {round((at(e0) - end) / sr * 1000)} ms after the {last}')
    y = x[start:end].copy()
    fi, fo = int(0.006 * sr), int(0.025 * sr)
    y[:fi] *= np.linspace(0, 1, fi); y[-fo:] *= np.linspace(1, 0, fo)
    return y, notes

jobs = json.load(open(sys.argv[1]))
os.makedirs(sys.argv[2], exist_ok=True)
log = {}
for j in jobs:
    x, sr = sf.read(j['wav'], dtype='float32')
    y, notes = trim(x, sr, j['first'], j['last'])
    sf.write(os.path.join(sys.argv[2], j['id'] + '.wav'), y, sr)
    log[j['id']] = notes
    print(j['id'].ljust(18), '; '.join(notes) or '(nothing to trim)')
json.dump(log, open(os.path.join(sys.argv[2], '_trim.json'), 'w'), ensure_ascii=False, indent=1)
