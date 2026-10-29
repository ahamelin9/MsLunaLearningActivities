# Scores phonics clips with the phoneme recognizer, restricted to English phones.
#   python score.py <takes.tsv> <out.json>      tsv: sound \t take \t wavpath
# For each clip: what it is heard as, how sure the model is that each target
# phone is there, and the strongest vowel in a clip that should have none.
import sys, json, numpy as np, soundfile as sf, torch, librosa
from transformers import Wav2Vec2ForCTC, Wav2Vec2FeatureExtractor, Wav2Vec2PhonemeCTCTokenizer

EN = ('n s t ə l k d m ɛ ɾ ɪ p z ð f j v b ɹ ʊ iː i w ʌ u uː ɡ æ aɪ ʃ h ŋ ɚ eɪ oʊ θ aʊ ɑ ɑː dʒ əl ɜː ʒ tʃ ɔ ɔː '
      'ɑːɹ ɔːɹ ɔɪ ɛɹ ɪɹ ʊɹ oː a aː e o').split()
VOWELS = set('ə ɛ ɪ iː i ʊ ʌ u uː æ aɪ ɚ eɪ oʊ aʊ ɑ ɑː ɜː ɔ ɔː ɑːɹ ɔːɹ ɔɪ ɛɹ ɪɹ ʊɹ oː a aː e o əl'.split())
ANY = lambda *xs: list(xs)
T = {
 'b': [['b']], 'd': [['d']], 'g': [['ɡ']], 'p': [['p']], 't': [['t']], 'k': [['k']], 'h': [['h']], 'w': [['w']], 'y': [['j']],
 'j': [['dʒ']], 'ch': [['tʃ']], 'ks': [['k'], ['s']], 'kw': [['k'], ['w']],
 'm': [['m']], 'n': [['n']], 'ng': [['ŋ']], 'l': [['l', 'əl']], 'r': [['ɹ', 'ɚ', 'ɜː']],
 's': [['s']], 'sh': [['ʃ']], 'f': [['f']], 'th': [['θ']], 'z': [['z']], 'v': [['v']], 'dh': [['ð']],
 'a': [['æ']], 'e': [['ɛ']], 'i': [['ɪ']], 'o': [['ɑ', 'ɑː']], 'u': [['ʌ']],
 'ay': [['eɪ']], 'ee': [['iː', 'i']], 'eye': [['aɪ']], 'oh': [['oʊ']], 'oo': [['uː', 'u']], 'you': [['j'], ['uː', 'u']],
 'ar': [['ɑːɹ', 'ɑː', 'ɑ'], ['ɑːɹ', 'ɹ', 'ɚ']], 'or': [['ɔːɹ', 'ɔː', 'ɔ', 'oː']], 'er': [['ɜː', 'ɚ']],
}
for b, (x, y) in {'bl': 'bl', 'br': 'bɹ', 'cl': 'kl', 'cr': 'kɹ', 'dr': 'dɹ', 'fl': 'fl', 'fr': 'fɹ', 'gl': 'ɡl', 'gr': 'ɡɹ', 'pl': 'pl',
                  'pr': 'pɹ', 'sk': 'sk', 'sl': 'sl', 'sm': 'sm', 'sn': 'sn', 'sp': 'sp', 'st': 'st', 'sw': 'sw', 'tr': 'tɹ', 'tw': 'tw'}.items():
    T[b] = [[x], [y, 'əl'] if y == 'l' else [y, 'ɚ'] if y == 'ɹ' else [y]]
VOWEL_SOUNDS = {'a', 'e', 'i', 'o', 'u', 'ay', 'ee', 'eye', 'oh', 'oo', 'you', 'ar', 'or', 'er', 'r', 'l', 'w', 'y'}

NAME = 'facebook/wav2vec2-lv-60-espeak-cv-ft'
tok = Wav2Vec2PhonemeCTCTokenizer.from_pretrained(NAME, do_phonemize=False)
fe = Wav2Vec2FeatureExtractor.from_pretrained(NAME)
model = Wav2Vec2ForCTC.from_pretrained(NAME).eval()
v = tok.get_vocab()
keep = [tok.pad_token_id] + [v[p] for p in EN if p in v]
names = ['_'] + [p for p in EN if p in v]

def load(path):
    x, sr = sf.read(path, dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    if sr != 16000: x = librosa.resample(x, orig_sr=sr, target_sr=16000)
    pad = np.zeros(int(0.3 * 16000), dtype=np.float32)
    return np.concatenate([pad, x, pad])

out = {}
for line in open(sys.argv[1]):
    if not line.strip(): continue
    sound, take, path = line.rstrip('\n').split('\t')
    x = load(path)
    with torch.no_grad():
        logits = model(fe(x, sampling_rate=16000, return_tensors='pt').input_values).logits[0]
    p = logits[:, keep].softmax(-1).numpy()          # frames × (blank + English)
    seq, prev = [], None
    for i in p.argmax(1):
        if i != prev and i != 0: seq.append(names[i])
        prev = i
    peak = {names[j]: float(p[:, j].max()) for j in range(1, len(names))}
    targets = T.get(sound, [])
    have = [max(peak.get(a, 0) for a in alts) for alts in targets]
    # a stop or hiss should carry no vowel; a vowel sound obviously does
    others = {k: s for k, s in peak.items() if not any(k in alts for alts in targets)}
    extra_vowel = 0.0 if sound in VOWEL_SOUNDS else max((s for k, s in others.items() if k in VOWELS), default=0.0)
    wrong = sorted(others.items(), key=lambda kv: -kv[1])[:3]
    score = (min(have) if have else 0) - 0.5 * extra_vowel
    out.setdefault(sound, {})[take] = {
        'heard': ' '.join(seq), 'target': round(min(have), 3) if have else None, 'each': [round(h, 3) for h in have],
        'extraVowel': round(extra_vowel, 3), 'rivals': [(k, round(s, 3)) for k, s in wrong], 'score': round(score, 3)}
    r = out[sound][take]
    print(f"{sound:4} {take:14} heard {r['heard']:14} target {r['target']}  vowel {r['extraVowel']}  rivals {r['rivals']}", flush=True)
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
