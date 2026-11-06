# Finds every phone in real recordings (LibriSpeech) by CTC forced alignment
# with the wav2vec2 espeak phoneme model, and measures the ones phonics cares
# about, so Luna's sounds can be compared with real American speech.
#   python align.py <utts.json> <out.json>
#   utts.json: [{ id, speaker, sex, wav, phones: ["ð","ə",...] }]
import sys, json, numpy as np, soundfile as sf, torch, librosa, parselmouth
from transformers import Wav2Vec2ForCTC, Wav2Vec2FeatureExtractor, Wav2Vec2PhonemeCTCTokenizer

NAME = 'facebook/wav2vec2-lv-60-espeak-cv-ft'
tok = Wav2Vec2PhonemeCTCTokenizer.from_pretrained(NAME, do_phonemize=False)
fe = Wav2Vec2FeatureExtractor.from_pretrained(NAME)
model = Wav2Vec2ForCTC.from_pretrained(NAME).eval()
V = tok.get_vocab(); BLANK = tok.pad_token_id

def ctc_align(logp, ids):
    """Viterbi CTC alignment: frame spans for each target id."""
    T, S = logp.shape[0], 2 * len(ids) + 1
    ext = [BLANK if s % 2 == 0 else ids[s // 2] for s in range(S)]
    NEG = -1e30
    dp = np.full((T, S), NEG); bp = np.zeros((T, S), dtype=np.int32)
    dp[0, 0] = logp[0, ext[0]]
    if S > 1: dp[0, 1] = logp[0, ext[1]]
    for t in range(1, T):
        for s in range(S):
            best, arg = dp[t - 1, s], s
            if s > 0 and dp[t - 1, s - 1] > best: best, arg = dp[t - 1, s - 1], s - 1
            if s > 1 and ext[s] != BLANK and ext[s] != ext[s - 2] and dp[t - 1, s - 2] > best: best, arg = dp[t - 1, s - 2], s - 2
            dp[t, s] = best + logp[t, ext[s]]; bp[t, s] = arg
    s = S - 1 if dp[T - 1, S - 1] >= dp[T - 1, S - 2] else S - 2
    path = [s]
    for t in range(T - 1, 0, -1):
        s = bp[t, s]; path.append(s)
    path = path[::-1]
    first = {}
    for t, s in enumerate(path):
        if s % 2 == 1 and s // 2 not in first: first[s // 2] = t
    # CTC marks a phone with one peaky frame; a phone lasts until the next one starts
    starts = [first.get(k) for k in range(len(ids))]
    spans = []
    for k, a in enumerate(starts):
        if a is None: spans.append(None); continue
        nxt = next((b for b in starts[k + 1:] if b is not None), None)
        b = (nxt - 1) if nxt is not None else min(T - 1, a + 10)
        spans.append((a, max(a, min(b, a + 25))))
    return spans

def formants(f, t0, t1):
    out = []
    for frac in (0.25, 0.5, 0.75):
        t = t0 + (t1 - t0) * frac
        out.append([f.get_value_at_time(k, t) for k in (1, 2, 3)])
    return out

def min_f3(f, t0, t1):
    vals = [f.get_value_at_time(3, t) for t in np.arange(t0, t1, 0.005)]
    vals = [v for v in vals if v == v]
    return min(vals) if vals else None

def spectrum_stats(x, sr):
    n = len(x); x = x[int(n * 0.2):int(n * 0.8)]
    if len(x) < 256: return None
    w = np.hanning(len(x)); X = np.abs(np.fft.rfft(x * w)) ** 2; f = np.fft.rfftfreq(len(x), 1 / sr)
    band = (f > 1000) & (f < 11500)
    X, f = X[band], f[band]
    c = float((f * X).sum() / X.sum())
    peak = float(f[np.argmax(np.convolve(X, np.ones(15) / 15, 'same'))])
    return {'centroid': c, 'peak': peak}

VOWELS = {'æ', 'ɛ', 'ɪ', 'ɑː', 'ʌ', 'iː', 'uː', 'eɪ', 'aɪ', 'oʊ', 'ɜː', 'ɚ', 'ɑːɹ', 'ɔːɹ', 'ɔː', 'ʊ', 'ɔɪ', 'aʊ'}
FRIC = {'s', 'ʃ', 'f', 'θ', 'z', 'v', 'ð', 'h'}
SON = {'ɹ', 'l', 'w', 'j', 'm', 'n', 'ŋ'}
STOP = {'p', 't', 'k', 'b', 'd', 'ɡ', 'tʃ', 'dʒ'}

MULTI = sorted([t for t in V if len(t) > 1 and not t.startswith('<') and not any(c.isdigit() for c in t)], key=len, reverse=True)
def tokenize(ipa):
    s = ''.join(c for c in ipa if c not in 'ˈˌ.,!?;:"\'-').replace(' ', '|')
    out, i = [], 0
    while i < len(s):
        if s[i] == '|': i += 1; continue
        m = next((t for t in MULTI if s.startswith(t, i)), None)
        if m: out.append(m); i += len(m); continue
        if s[i] in V: out.append(s[i])
        i += 1
    return out

utts = json.load(open(sys.argv[1]))
for u in utts:
    if 'phones' not in u: u['phones'] = tokenize(u['ipa'])
rows = []
for i, u in enumerate(utts):
    ids = [V[p] for p in u['phones'] if p in V]
    names = [p for p in u['phones'] if p in V]
    x, sr = sf.read(u['wav'], dtype='float32')
    x16 = librosa.resample(x, orig_sr=sr, target_sr=16000) if sr != 16000 else x
    with torch.no_grad():
        logits = model(fe(x16, sampling_rate=16000, return_tensors='pt').input_values).logits[0]
    logp = torch.log_softmax(logits, -1).numpy()
    if logp.shape[0] < len(ids) * 2: continue
    spans = ctc_align(logp, ids)
    hop = len(x16) / 16000 / logp.shape[0]
    snd = parselmouth.Sound(x.astype(np.float64), sampling_frequency=sr)
    fobj = snd.to_formant_burg(time_step=0.005, max_number_of_formants=5, maximum_formant=5500)
    for k, (p, sp) in enumerate(zip(names, spans)):
        if sp is None: continue
        t0, t1 = sp[0] * hop, (sp[1] + 1) * hop
        prev = names[k - 1] if k else None; nxt = names[k + 1] if k + 1 < len(names) else None
        r = {'p': p, 'spk': u['speaker'], 'sex': u['sex'], 'utt': u['id'], 'dur': t1 - t0, 't0': t0, 'prev': prev, 'next': nxt}
        try:
            if p in VOWELS or p in SON:
                r['f'] = formants(fobj, t0, t1)
                if p in {'ɹ', 'ɚ', 'ɜː', 'ɑːɹ', 'ɔːɹ'}: r['minF3'] = min_f3(fobj, t0, t1)
            if p in FRIC:
                a, b = int(t0 * sr), int(t1 * sr)
                r['spec'] = spectrum_stats(x[a:b], sr)
        except Exception as e:
            r['err'] = str(e)
        rows.append(r)
    if i % 10 == 0: print(i, len(rows), flush=True)
json.dump(rows, open(sys.argv[2], 'w'), ensure_ascii=False)
print('done', len(rows))
