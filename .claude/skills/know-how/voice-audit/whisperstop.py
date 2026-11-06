# Kilpatrick's stop: the burst, then a whisper of the vowel instead of a voiced "uh".
# Takes Luna's carrier word (rendered by ab-render), keeps the burst and the first
# few ms of voicing, then replaces the vowel with its whispered version.
#   python whisperstop.py <in.wav> <out.wav> <whisperMs> [keepVoiceMs]
import sys, numpy as np, soundfile as sf
from scipy.signal import stft, istft

src, dst, wms = sys.argv[1], sys.argv[2], float(sys.argv[3])
keep_voice = float(sys.argv[4]) if len(sys.argv) > 4 else 12
x, sr = sf.read(src, dtype='float64')
hop = int(0.005 * sr); win = int(0.025 * sr)
fr = [x[i:i + win] for i in range(0, len(x) - win, hop)]
db = np.array([20 * np.log10(np.sqrt(np.mean(f ** 2)) + 1e-9) for f in fr]); ref = db.max()
def voiced(f):
    f = f - f.mean(); ac = np.correlate(f, f, 'full')[len(f) - 1:]
    return ac[0] > 1e-9 and ac[int(sr / 400):int(sr / 80)].max() / ac[0] > 0.55
live = np.where(db > ref - 30)[0]; start = live[0]
# the burst: the biggest jump in level near the start; voicing: the first voiced frame after it
burst = start + int(np.argmax(np.diff(db[start:start + 40]))) + 1
v = next((i for i in range(burst, len(fr)) if voiced(fr[i]) and db[i] > ref - 15), burst + 4)
cut = v * hop + int(keep_voice / 1000 * sr)
L = int(wms / 1000 * sr)
seg = x[cut:cut + L + win]
# whisper: the vowel's smoothed spectral envelope over noise (no pitch)
f, t, Z = stft(seg, sr, nperseg=512, noverlap=384)
mag = np.abs(Z)
cep = np.fft.irfft(np.log(mag + 1e-9), axis=0); cep[30:-30] = 0
env = np.exp(np.fft.rfft(cep, axis=0).real)[:mag.shape[0]]
rng = np.random.default_rng(7)
_, w = istft(env * np.exp(1j * rng.uniform(0, 2 * np.pi, env.shape)), sr, nperseg=512, noverlap=384)
w = w[:L]
w *= (np.sqrt(np.mean(x[cut:cut + L] ** 2)) / (np.sqrt(np.mean(w ** 2)) + 1e-9)) * 10 ** (-9 / 20)
w *= np.linspace(1, 0, len(w)) ** 1.5
head = x[max(0, start * hop - int(0.01 * sr)):cut].copy()
xf = int(0.006 * sr); head[-xf:] *= np.linspace(1, 0, xf); w[:xf] *= np.linspace(0, 1, xf)
y = np.concatenate([head[:-xf], head[-xf:] + w[:xf], w[xf:]])
y = y / (np.abs(y).max() + 1e-9) * 0.6
sf.write(dst, y, sr)
print(dst, f'{len(y) / sr * 1000:.0f} ms (burst at {burst * 5} ms, voice at {v * 5} ms)')
