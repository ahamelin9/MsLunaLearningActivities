# Holds Luna's real hiss (F, TH) with long overlapping grains, and a "softer"
# version with the treble eased off (real F and TH are much less bright).
#   python hisshold.py <carrier.wav> <out-prefix> [holdMs]
import sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

def frames(x, sr, hop=0.005, win=0.02):
    h, w = int(hop * sr), int(win * sr)
    return [(i, x[i:i + w]) for i in range(0, len(x) - w, h)]

def longest_hiss(x, sr):
    fr = frames(x, sr); ref = max(np.sqrt(np.mean(f ** 2)) for _, f in fr)
    flags = [(np.mean(np.abs(np.diff(np.sign(f)))) / 2 * sr > 3500) and np.sqrt(np.mean(f ** 2)) > ref * 0.02 for _, f in fr]
    best, i = (0, 0), 0
    while i < len(flags):
        if flags[i]:
            j = i
            while j < len(flags) and flags[j]: j += 1
            if j - i > best[1] - best[0]: best = (i, j)
            i = j
        else: i += 1
    return x[fr[best[0]][0] + int(0.015 * sr):fr[best[1] - 1][0] - int(0.01 * sr)]

def grain_hold(seg, sr, ms, grain_ms=120, seed=3):
    rng = np.random.default_rng(seed); N = min(int(grain_ms / 1000 * sr), len(seg) // 2); hop = N // 4
    L = int(ms / 1000 * sr); out = np.zeros(L + N); norm = np.zeros(L + N); w = np.hanning(N)
    for at in range(0, L, hop):
        s = rng.integers(0, len(seg) - N); out[at:at + N] += seg[s:s + N] * w; norm[at:at + N] += w ** 2
    return out[:L] / np.sqrt(np.maximum(norm[:L], 1e-3))

def softer(x, sr):
    sos = butter(2, 4500, 'low', fs=sr, output='sos')
    return 0.6 * sosfilt(sos, x) + 0.4 * x

def finish(x, sr, db=-22):
    x = x.copy(); a, b = int(0.04 * sr), int(0.11 * sr)
    x[:a] *= np.linspace(0, 1, a); x[-b:] *= np.linspace(1, 0, b)
    return x * (10 ** (db / 20) / np.sqrt(np.mean(x ** 2)))

if __name__ == '__main__':
    src, prefix = sys.argv[1], sys.argv[2]; ms = float(sys.argv[3]) if len(sys.argv) > 3 else 420
    x, sr = sf.read(src); held = grain_hold(longest_hiss(x, sr), sr, ms)
    sf.write(f'{prefix}-long-grains.wav', finish(held, sr), sr)
    sf.write(f'{prefix}-softer.wav', finish(softer(held, sr), sr), sr)
