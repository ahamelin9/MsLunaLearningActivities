# Formants and voicing of converted takes, his raw take beside Luna's, so a
# sound the converter loses (an R's low F3, E against I, a buzz in V and Z)
# shows as numbers. librosa only (LPC formants), so it runs in the luna-vc env:
#   ~/anaconda3/envs/luna-vc/bin/python takeformants.py <takesDir> FILE[,FILE…] [--word]
# FILE is the take's key as convert-takes.py names it (R, E_alt, BR…).
# Prints, per take: voiced share, F1/F2/F3 medians over the voiced frames,
# and the lowest F3 (an R dips under ~2000 Hz in a man, ~2400 in a woman).
import sys, glob, os
import numpy as np, librosa

d, files = sys.argv[1], sys.argv[2].split(',')
word = '--word' in sys.argv


def formants(y, sr):
    y = librosa.resample(y, orig_sr=sr, target_sr=11025); sr = 11025
    y = np.append(y[0], y[1:] - 0.97 * y[:-1])
    f0, voiced, _ = librosa.pyin(y, fmin=70, fmax=400, sr=sr, frame_length=1024, hop_length=110)
    frame, hop = int(0.03 * sr), 110
    rows = []
    for i, v in enumerate(voiced):
        a = i * hop
        seg = y[a:a + frame]
        if not v or len(seg) < frame or np.abs(seg).max() < 1e-3: continue
        seg = seg * np.hamming(len(seg))
        try: A = librosa.lpc(seg, order=12)
        except Exception: continue
        r = [z for z in np.roots(A) if np.imag(z) > 0]
        fs = sorted((np.angle(z) * sr / (2 * np.pi), -sr / np.pi * np.log(abs(z))) for z in r)
        fs = [f for f, bw in fs if f > 150 and bw < 500]
        if len(fs) >= 3: rows.append(fs[:3])
    share = float(np.mean(voiced)) if len(voiced) else 0
    if not rows: return share, None, None
    m = np.array(rows)
    return share, np.median(m, axis=0), np.percentile(m[:, 2], 10)


for f in files:
    takes = ['word'] if word else ['take1', 'take2', 'take3']
    for t in takes:
        out = []
        for who in ('his', 'luna'):
            p = os.path.join(d, f'sound__{f}__{t}--{who}.wav')
            if not os.path.exists(p): out.append(f'{who}: missing'); continue
            y, sr = librosa.load(p, sr=None, mono=True)
            share, med, lowf3 = formants(y, sr)
            if med is None: out.append(f'{who}: {len(y)/sr:.2f}s voiced {share:.0%} (no formants)')
            else: out.append(f'{who}: {len(y)/sr:.2f}s voiced {share:.0%} F1 {med[0]:.0f} F2 {med[1]:.0f} F3 {med[2]:.0f} lowF3 {lowf3:.0f}')
        print(f'{f:6} {t:5} | ' + ' | '.join(out))
