# "Listens" to clips with a phoneme recognizer (wav2vec2 espeak-cv-ft) and,
# for words, Whisper. Usage:
#   python hear.py phones <manifest.tsv> <out.json>     tsv: id \t wavpath
#   python hear.py words  <manifest.tsv> <out.json>
import sys, json, numpy as np, soundfile as sf, torch, librosa
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor, Wav2Vec2FeatureExtractor, Wav2Vec2PhonemeCTCTokenizer

mode, tsv, out = sys.argv[1:4]
items = [l.rstrip('\n').split('\t') for l in open(tsv) if l.strip()]

def load(path):
    x, sr = sf.read(path, dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    if sr != 16000: x = librosa.resample(x, orig_sr=sr, target_sr=16000)
    pad = np.zeros(int(0.25 * 16000), dtype=np.float32)
    return np.concatenate([pad, x, pad])

NAME = 'facebook/wav2vec2-lv-60-espeak-cv-ft'
tok = Wav2Vec2PhonemeCTCTokenizer.from_pretrained(NAME, do_phonemize=False)
fe = Wav2Vec2FeatureExtractor.from_pretrained(NAME)
model = Wav2Vec2ForCTC.from_pretrained(NAME).eval()
vocab = {v: k for k, v in tok.get_vocab().items()}

asr = None
if mode == 'words':
    from transformers import pipeline
    asr = pipeline('automatic-speech-recognition', model='openai/whisper-small.en')

res = {}
for row in items:
    id_, path = row[0], row[1]
    x = load(path)
    with torch.no_grad():
        logits = model(fe(x, sampling_rate=16000, return_tensors='pt').input_values).logits[0]
    probs = logits.softmax(-1)
    ids = logits.argmax(-1).tolist()
    seq, prev = [], None
    for i in ids:
        if i != prev and i != tok.pad_token_id:
            seq.append(vocab[i])
        prev = i
    # each phone's best frame probability, for "is the target in there at all"
    peak = probs.max(0).values
    top = sorted(((float(peak[i]), vocab[i]) for i in range(len(vocab)) if i != tok.pad_token_id), reverse=True)[:6]
    r = {'phones': ' '.join(seq), 'top': [(p, round(s, 3)) for s, p in top]}
    if asr:
        r['whisper'] = asr(x.copy(), generate_kwargs={'language': None} if False else {})['text'].strip()
    res[id_] = r
    print(id_, '|', r['phones'], '|', r.get('whisper', ''), flush=True)

json.dump(res, open(out, 'w'), ensure_ascii=False, indent=1)
