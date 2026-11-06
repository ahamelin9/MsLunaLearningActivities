# Measures held letter-sound takes against real speech: how much of the clip is
# voiced, its formants over the voiced middle (glides, nasals), and where a
# hiss's energy centres in the band LibriSpeech has (1-7.8 kHz), so a 24 kHz
# take is compared fairly with 16 kHz real speech.
#   python heldmeasure.py <tsv: sound \t take \t wav> <out.json>
import sys, json, numpy as np, soundfile as sf, parselmouth

def sounding(x, sr):
    h = int(0.005 * sr)
    db = np.array([20 * np.log10(np.sqrt(np.mean(x[i:i + h] ** 2)) + 1e-9) for i in range(0, len(x) - h, h)])
    live = np.where(db > db.max() - 30)[0]
    return live[0] * 0.005, (live[-1] + 1) * 0.005

def centroid(x, sr):
    n = len(x); y = x[int(n * 0.2):int(n * 0.8)]
    if len(y) < 512: return None
    X = np.abs(np.fft.rfft(y * np.hanning(len(y)))) ** 2; f = np.fft.rfftfreq(len(y), 1 / sr)
    b = (f > 1000) & (f < 7800)
    return float((X[b] * f[b]).sum() / X[b].sum())

out = []
for line in open(sys.argv[1]):
    if not line.strip(): continue
    snd, take, path = line.rstrip('\n').split('\t')
    x, sr = sf.read(path, dtype='float64')
    if x.ndim > 1: x = x.mean(1)
    a, b = sounding(x, sr)
    s = parselmouth.Sound(np.concatenate([np.zeros(int(0.05 * sr)), x, np.zeros(int(0.05 * sr))]), sr)
    p = s.to_pitch(time_step=0.005, pitch_floor=120, pitch_ceiling=450)
    ts = np.arange(a + 0.05, b + 0.05, 0.005)
    v = np.array([p.get_value_at_time(t) for t in ts])
    voiced = np.isfinite(v)
    r = {'sound': snd, 'take': take, 'ms': round((b - a) * 1000), 'voiced': round(float(voiced.mean()), 2),
         'f0': round(float(np.nanmedian(v))) if voiced.any() else None, 'centroid': None, 'F': None}
    c = centroid(x[int(a * sr):int(b * sr)], sr)
    r['centroid'] = round(c) if c else None
    if voiced.sum() > 6:
        f = s.to_formant_burg(time_step=0.005, max_number_of_formants=5, maximum_formant=5500)
        vt = ts[voiced]; mid = vt[int(len(vt) * 0.25):int(len(vt) * 0.75) + 1]
        r['F'] = [round(float(np.nanmedian([f.get_value_at_time(k, t) for t in mid]))) for k in (1, 2, 3)]
    out.append(r)
    print(snd, take, r['ms'], 'ms', 'voiced', r['voiced'], 'F', r['F'], 'c', r['centroid'])
json.dump(out, open(sys.argv[2], 'w'), indent=1, ensure_ascii=False)
