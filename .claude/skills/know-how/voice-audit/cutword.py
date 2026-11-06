# Cuts a word out of a carrier phrase ("Say bed again.") using the aligner's
# spans: from the quiet just before the word to where "again" starts. A word
# said inside a phrase keeps its proper short vowel; said alone, Kokoro opens
# it (short i toward e, short e toward a). Run align.py on the phrases first.
#   python cutword.py <utts.json> <phones.json> <outDir> [carrierPhonesBefore=2] [after=4]
import sys, os, json, numpy as np, soundfile as sf
utts, phones, out = sys.argv[1:4]
pre = int(sys.argv[4]) if len(sys.argv) > 4 else 2
post = int(sys.argv[5]) if len(sys.argv) > 5 else 4
os.makedirs(out, exist_ok=True)
by = {}
for r in json.load(open(phones)): by.setdefault(r['utt'], []).append(r)
for u in json.load(open(utts)):
    ph = by.get(u['id'])
    if not ph or len(ph) < pre + post + 1: print(u['id'], 'not aligned'); continue
    x, sr = sf.read(u['wav'], dtype='float64'); h = int(0.005 * sr)
    e = np.array([np.sqrt(np.mean(x[i:i + h] ** 2)) for i in range(0, len(x) - h, h)])
    a, b = ph[pre]['t0'], ph[-post]['t0']
    # back up to the quietest point in the 70 ms before the word (a stop's closure, a breath)
    i0 = int(a / 0.005); lo = max(0, i0 - 14)
    a = (lo + int(np.argmin(e[lo:i0 + 1]))) * 0.005 if i0 > lo else a
    y = x[int(a * sr):int((b - 0.005) * sr)].copy()
    fi, fo = int(0.008 * sr), int(0.025 * sr)
    y[:fi] *= np.linspace(0, 1, fi); y[-fo:] *= np.linspace(1, 0, fo) ** 2
    sf.write(f"{out}/{u['word']}.wav", y / (np.abs(y).max() + 1e-9) * 0.6, sr)
print('cut', len(json.load(open(utts))))
