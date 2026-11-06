# Measures isolated letter-sound clips the way align.py measures phones in speech.
#   python measure_clips.py <tsv: label \t sound \t wav> <out.json>
import sys, json, numpy as np, soundfile as sf, parselmouth

def voiced_span(snd):
    p = snd.to_pitch(time_step=0.005)
    ts = [t for t in p.xs() if p.get_value_at_time(t) == p.get_value_at_time(t)]
    return (ts[0], ts[-1]) if len(ts) > 3 else None

def formants_over(snd, t0, t1):
    f = snd.to_formant_burg(time_step=0.005, max_number_of_formants=5, maximum_formant=5500)
    pts = []
    for frac in (0.25, 0.5, 0.75):
        t = t0 + (t1 - t0) * frac
        pts.append([f.get_value_at_time(k, t) for k in (1, 2, 3)])
    f3 = [f.get_value_at_time(3, t) for t in np.arange(t0, t1, 0.005)]
    f3 = [v for v in f3 if v == v]
    return pts, (min(f3) if f3 else None), (float(np.median(f3)) if f3 else None)

def spectrum(x, sr):
    n = len(x); a, b = int(n * 0.2), int(n * 0.8); y = x[a:b]
    if len(y) < 256: return None
    w = np.hanning(len(y)); X = np.abs(np.fft.rfft(y * w)) ** 2; f = np.fft.rfftfreq(len(y), 1 / sr)
    band = (f > 1000) & (f < 11500); X, f = X[band], f[band]
    sm = np.convolve(X, np.ones(31) / 31, 'same')
    return {'centroid': float((f * X).sum() / X.sum()), 'peak': float(f[np.argmax(sm)])}

def stop_tail(x, sr):
    """After the loudest burst, how long the voice runs (the 'uh')."""
    snd = parselmouth.Sound(x.astype(np.float64), sampling_frequency=sr)
    p = snd.to_pitch(time_step=0.005)
    voiced = [t for t in p.xs() if p.get_value_at_time(t) == p.get_value_at_time(t)]
    return (voiced[-1] - voiced[0]) if len(voiced) > 2 else 0.0

out = {}
for line in open(sys.argv[1]):
    if not line.strip(): continue
    label, sound, wav = line.rstrip('\n').split('\t')
    x, sr = sf.read(wav, dtype='float64')
    if x.ndim > 1: x = x.mean(1)
    if len(x) < sr * 0.06: x = np.concatenate([x, np.zeros(int(sr * 0.06) - len(x))])
    snd = parselmouth.Sound(x, sampling_frequency=sr)
    r = {'sound': sound, 'dur': len(x) / sr}
    try: vs = voiced_span(snd)
    except Exception: vs = None
    if vs:
        pts, mf3, f3med = formants_over(snd, *vs)
        r['f'] = pts; r['minF3'] = mf3; r['F3med'] = f3med; r['voiced'] = vs[1] - vs[0]
    r['spec'] = spectrum(x, sr)
    try: r['voicedTail'] = stop_tail(x, sr)
    except Exception: r['voicedTail'] = 0.0
    out[label] = r
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False, indent=0)
print(len(out), 'clips measured')
